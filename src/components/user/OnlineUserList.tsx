"use client";

import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "./UserAvatar";
// Custom Hooks
import { useSocket } from "@/hooks/use-socket";
import { useUser } from "@clerk/nextjs";
// Type definitions
import { SocketUser } from "@/types";

export default function OnlineUserList() {
  const { user } = useUser();
  const { isConnected, onlineUsers, handleCall } = useSocket();

  const callHandler = (socketUser: SocketUser) => {
    // If the user is not defined, shouldn't let them call
    if(!user) return undefined;
    // If the user is calling the same person, then don't
    if(user.id === socketUser.userId) return undefined;
    // Else, handle the call
    return handleCall(socketUser)
  }

  return (
    <section className="inline-flex-center flex-1 gap-6">
      {!isConnected ? (
        <h4 className="text-3xl text-muted-foreground">
          Hang on while we make a connection
        </h4>
      ) : (
        <>
          {!!onlineUsers
            ? onlineUsers.map((socketUser) => (
              <UserAvatar
                  socketUser={socketUser}
                  onTap={() => callHandler(socketUser)}
                  key={socketUser.userId}
                />
              ))
            : Array.from({ length: 3 }).map((_, index) => (
                <Skeleton className="size-44 rounded-full no-select" key={index}/>
              ))}
        </>
      )}
    </section>
  );
}
