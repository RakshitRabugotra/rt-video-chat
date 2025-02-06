"use client";

import { getConnectedDevices, requestMediaDevices } from "@/lib/media";
import { OngoingCall, Participants, PeerData, SocketUser } from "@/types";
import { useUser } from "@clerk/nextjs";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import Peer, { SignalData } from "simple-peer";

const MEDIA_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
  },
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 360, ideal: 720, max: 1080 },
    frameRate: { min: 15, ideal: 30, max: 30 },
  },
} satisfies MediaStreamConstraints;

export interface SocketConnection {
  isConnected: boolean;
  isCallEnded: boolean;
  socket: Socket | null;
  onlineUsers: SocketUser[] | null;
  ongoingCall: OngoingCall | null;
  localStream: MediaStream | null;
  constraints: typeof MEDIA_CONSTRAINTS;
  peer: PeerData | null;
  handleCall: (socketUser: SocketUser) => void;
  handleJoinCall: (ongoingCall: OngoingCall) => void;
  handleHangupCall: (data: {
    ongoingCall: OngoingCall | null;
    isEmitHangup?: boolean;
  }) => void;
  getMediaStream: (faceMode?: string) => Promise<MediaStream | null>;
  onIncomingCall: (participants: Participants) => void;
}

export const SocketContext = createContext<SocketConnection>({
  isConnected: false,
  isCallEnded: false,
  socket: null,
  onlineUsers: null,
  localStream: null,
  ongoingCall: null,
  peer: null,
  constraints: MEDIA_CONSTRAINTS,
  handleCall() {},
  handleJoinCall() {},
  handleHangupCall() {},
  onIncomingCall() {},
  async getMediaStream() {
    return null;
  },
});

export const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const { user } = useUser();
  // Context States
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setConnected] = useState(false);
  const [isCallEnded, setCallEnded] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<PeerData | null>(null);

  // The current user this socket and user-id
  const currentSocketUser = useMemo(
    () => onlineUsers?.find((onlineUser) => onlineUser.userId === user?.id),
    [onlineUsers, user]
  );

  /**
   * Handling the media devices for streaming video/audio
   */
  const getMediaStream = useCallback(
    async (faceMode?: string) => {
      if (localStream) {
        return localStream;
      }
      try {
        // Else, get the video input devices and get the first item
        const videoDevices = await getConnectedDevices("videoinput");
        const stream = await requestMediaDevices({
          ...MEDIA_CONSTRAINTS,
          video: {
            ...MEDIA_CONSTRAINTS.video,
            facingMode: videoDevices.length > 0 ? faceMode : undefined,
          },
        });
        // Set the local stream
        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.error("Error while getting the user's media stream", error);
        // Set the local stream
        setLocalStream(null);
        return null;
      }
    },
    [localStream]
  );

  /**
   * Initiates a call between two participants
   */
  const handleCall = useCallback(
    async (socketUser: SocketUser) => {
      setCallEnded(false);
      if (!currentSocketUser || !socket) return;

      // Get the current user's stream
      const stream = await getMediaStream();
      if (!stream) {
        console.error("no stream in handleCall");
        return;
      }

      // The caller and receiver info
      const participants: Participants = {
        caller: currentSocketUser,
        receiver: socketUser,
      };
      setOngoingCall({
        participants,
        isRinging: false,
      });
      socket.emit("call", participants);
    },
    [socket, currentSocketUser, ongoingCall]
  );

  const createPeer = useCallback(
    (stream: MediaStream, initiator: boolean) => {
      // Get the ice-servers
      const iceServers: RTCIceServer[] = [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
          ],
        },
      ];

      const peer = new Peer({
        stream,
        initiator,
        trickle: true,
        config: { iceServers },
      });
      // Listen to some particular stream event
      peer.on("stream", (otherStream) => {
        console.log("Got stream!!!!!: ", otherStream.getVideoTracks());
        setPeer((prevPeer) =>
          prevPeer ? { ...prevPeer, stream: otherStream } : prevPeer
        );
      });
      // If there was some error
      peer.on("error", console.error);
      // If the user disconnects/closes the call
      peer.on("close", () => handleHangupCall({ ongoingCall, isEmitHangup: true }));

      // Open a RTC Connection
      const rtcPeerConnection: RTCPeerConnection | undefined = (peer as any)
        ._pc;
      // If the call disconnects, or fails then hangup
      if (rtcPeerConnection) {
        rtcPeerConnection.oniceconnectionstatechange = async () => {
          if (
            rtcPeerConnection.iceConnectionState === "disconnected" ||
            rtcPeerConnection.iceConnectionState === "failed"
          ) {
            handleHangupCall({} as any);
          }
        };
      }
      return peer;
    },
    [ongoingCall]
  );

  const completePeerConnection = useCallback(
    async (connectionData: {
      sdp: SignalData;
      ongoingCall: OngoingCall;
      isCaller: boolean;
    }) => {
      // Complete's p2p connection
      if (!localStream) {
        console.error("Missing the localStream");
        return;
      }

      if (peer) {
        peer.peerConnection.signal(connectionData.sdp);
        return;
      }

      // We don't have a peer
      // Create a peer for the caller
      const newPeer = createPeer(localStream, true);
      setPeer({
        peerConnection: newPeer,
        participant: connectionData.ongoingCall.participants.receiver,
      });
      newPeer.on("signal", async (data: SignalData) => {
        if (socket) {
          // Emit WebRTC offer
          socket.emit("webrtcSignal", {
            sdp: data,
            ongoingCall,
            isCaller: true,
          });
        }
      });
    },
    [localStream, createPeer, peer, ongoingCall]
  );

  /**
   * Handles an incoming call
   */
  const onIncomingCall = useCallback(
    (participants: Participants) => {
      setOngoingCall({
        participants,
        isRinging: true,
      });
    },
    [socket, user, ongoingCall]
  );

  /**
   * Handle an incoming call
   */
  const handleJoinCall = useCallback(
    async (ongoingCall: OngoingCall) => {
      setCallEnded(false);
      // Join Call
      // Set the is-ringing to false, so the call modal hides
      setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : prev));
      // Get the current stream
      const stream = await getMediaStream();
      if (!stream) {
        console.error("Couldn't get stream in handleJoinCall");
        // Simply hangup
        return handleHangupCall({ ongoingCall, isEmitHangup: true })
      }
      // Create a peer for the caller
      const newPeer = createPeer(stream, true);
      setPeer({
        peerConnection: newPeer,
        participant: ongoingCall.participants.caller,
        stream: undefined,
      });
      newPeer.on("signal", async (data: SignalData) => {
        if (socket) {
          // Emit WebRTC offer
          socket.emit("webrtcSignal", {
            sdp: data,
            ongoingCall,
            isCaller: false,
          });
        }
      });
    },
    [socket, currentSocketUser]
  );

  /**
   * Handles Ignoring/Cancelling an incoming call
   */
  const handleHangupCall = useCallback(
    (data: { ongoingCall: OngoingCall | null; isEmitHangup?: boolean }) => {
      // Cancel the call
      if (socket && user && data?.ongoingCall && data?.isEmitHangup) {
        socket.emit("hangup", {
          ongoingCall: data.ongoingCall,
          userHangingupId: user.id,
        });
      }
      setOngoingCall(null);
      setPeer(null);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      setCallEnded(true);
      // Set the is-ringing to false, so the call modal hides
      setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : prev));
    },
    [socket, user, localStream]
  );

  // Initialize a socket
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    if (socket.connected) {
      onConnect();
    }
    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  // Set online users
  useEffect(() => {
    if (!socket || !isConnected) return;
    // Emit that the user is connected
    socket.emit("addNewUser", user);
    socket.on("getUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getUsers", (res) => {
        setOnlineUsers(res);
      });
    };
  }, [socket, isConnected, user]);

  // To persist the call-ended state after some time
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if(isCallEnded) {
      timeout = setTimeout(() => {
        setCallEnded(false)
      }, 2000)
    }
    return () => clearTimeout(timeout)
  }, [isCallEnded])

  // For calls
  useEffect(() => {
    if (!socket || !isConnected) return;
    // Handle the incoming call
    socket.on("incomingCall", onIncomingCall);
    socket.on("webrtcSignal", completePeerConnection);
    socket.on("hangup", handleHangupCall);
    return () => {
      socket.off("incomingCall", onIncomingCall);
      socket.off("webrtcSignal", completePeerConnection);
      socket.off("hangup", handleHangupCall);
    };
  }, [socket, isConnected, user, onIncomingCall, completePeerConnection, handleHangupCall]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isConnected,
        isCallEnded,
        localStream,
        ongoingCall,
        peer,
        constraints: MEDIA_CONSTRAINTS,
        getMediaStream,
        onIncomingCall,
        handleCall,
        handleJoinCall,
        handleHangupCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
