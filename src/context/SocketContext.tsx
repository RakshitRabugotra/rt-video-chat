"use client";

import { SocketUser } from "@/types";
import { useUser } from "@clerk/nextjs";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface SocketConnection {
  socket: Socket | null,
  onlineUsers: SocketUser[] | null,
  isConnected: boolean,
}

export const SocketContext = createContext<SocketConnection>({
  isConnected: false,
  socket: null,
  onlineUsers: null
});

export const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const { user } = useUser();
  // Context States
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);

  console.log("online: ", onlineUsers)

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

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
