"use client";

import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "./UserAvatar";
// Custom Hooks
import { useSocket } from "@/hooks/use-socket";

export default function OnlineUserList() {
  const { isConnected, onlineUsers, handleCall } = useSocket();

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
                <UserAvatar {...socketUser} onTap={() => handleCall(socketUser)} key={socketUser.userId} />
              ))
            : Array.from({ length: 3 }).map((_, index) => (
                <Skeleton className="size-44 rounded-full no-select" />
              ))}
        </>
      )}
    </section>
  );
}
