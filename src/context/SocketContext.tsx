"use client";

import { getConnectedDevices, requestMediaDevices } from "@/lib/media";
import { OngoingCall, Participants, SocketUser } from "@/types";
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


const MEDIA_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
  },
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 640, ideal: 1280, max: 1920 },
    frameRate: { min: 15, ideal: 30, max: 30 },
  },
} satisfies MediaStreamConstraints

export interface SocketConnection {
  isConnected: boolean;
  socket: Socket | null;
  onlineUsers: SocketUser[] | null;
  ongoingCall: OngoingCall | null;
  localStream: MediaStream | null;
  constraints: typeof MEDIA_CONSTRAINTS;
  handleCall: (socketUser: SocketUser) => void;
  getMediaStream: (faceMode?: string) => Promise<MediaStream | null>
  onIncomingCall: (participants: Participants) => void;
}

export const SocketContext = createContext<SocketConnection>({
  isConnected: false,
  socket: null,
  onlineUsers: null,
  localStream: null,
  ongoingCall: null,
  constraints: MEDIA_CONSTRAINTS,
  handleCall() {},
  onIncomingCall() {},
  async getMediaStream() { return null },
});

export const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const { user } = useUser();
  // Context States
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

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
          }
        });
        // Set the local stream
        setLocalStream((prev) => stream);
        return stream;
      } catch (error) {
        console.error("Error while getting the user's media stream");
        // Set the local stream
        setLocalStream((prev) => null);
        return null;
      }
    },
    [localStream]
  );

  /**
   * Initiates a call between two participants
   */
  const handleCall = useCallback(
    async(socketUser: SocketUser) => {
      if (!currentSocketUser || !socket) return;

      // Get the current user's stream
      const stream = await getMediaStream()
      if(!stream) {
        console.error("no stream in handleCall")
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

  /**
   * Handles an incoming call
   */
  const onIncomingCall = useCallback(
    (participants: Participants) => {
      setOngoingCall((prev) => ({
        participants,
        isRinging: true,
      }));
    },
    [socket, user, ongoingCall]
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

  // For calls
  useEffect(() => {
    if (!socket || !isConnected) return;
    // Handle the incoming call
    socket.on("incomingCall", onIncomingCall);
    return () => {
      socket.off("incomingCall", onIncomingCall);
    };
  }, [socket, isConnected, user, onIncomingCall]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isConnected,
        localStream,
        ongoingCall,
        constraints: MEDIA_CONSTRAINTS,
        getMediaStream,
        onIncomingCall,
        handleCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
