"use client";

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

export interface SocketConnection {
  socket: Socket | null;
  onlineUsers: SocketUser[] | null;
  ongoingCall: OngoingCall | null;
  isConnected: boolean;
  handleCall: (socketUser: SocketUser) => void;
  onIncomingCall: (participants: Participants) => void;
}

export const SocketContext = createContext<SocketConnection>({
  isConnected: false,
  socket: null,
  onlineUsers: null,
  ongoingCall: null,
  handleCall() {},
  onIncomingCall() {},
});

export const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const { user } = useUser();
  // Context States
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);

  // The current user this socket and user-id
  const currentSocketUser = useMemo(
    () => onlineUsers?.find((onlineUser) => onlineUser.userId === user?.id),
    [onlineUsers, user]
  );

  /**
   * Initiates a call between two participants
   */
  const handleCall = useCallback(
    (socketUser: SocketUser) => {
      if (!currentSocketUser || !socket) return;
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
        ongoingCall,
        onIncomingCall,
        handleCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
