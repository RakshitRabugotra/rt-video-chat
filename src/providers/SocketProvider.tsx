'use client'

import { SocketContextProvider } from "@/context/SocketContext";
import { PropsWithChildren } from "react";

export default function SocketProvider({children}: PropsWithChildren) {

  return <SocketContextProvider>
    {children}
  </SocketContextProvider>
}