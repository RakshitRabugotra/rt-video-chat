"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/hooks/use-socket";
import { Skeleton } from "./ui/skeleton";

export default function OnlineUserList() {
  const { isConnected, onlineUsers } = useSocket();

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
                <Avatar key={socketUser.userId} className="size-44 no-select">
                  <AvatarImage
                    src={socketUser.profile.imageUrl}
                    className="no-select"
                  />
                  <AvatarFallback className="no-select">
                    {socketUser.profile.username}
                  </AvatarFallback>
                </Avatar>
              ))
            : Array.from({ length: 3 }).map((_, index) => (
                <Skeleton className="size-44 rounded-full no-select" />
              ))}
        </>
      )}
    </section>
  );
}
