"use client";

// Custom hooks
import { useSocket } from "@/hooks/use-socket";
import UserAvatar from "@/components/user/UserAvatar";
import { useCallback } from "react";

export default function CallNotification() {
  const { ongoingCall, handleJoinCall, handleHangupCall } = useSocket();

  const handleHangup = useCallback(
    () =>
      handleHangupCall({
        ongoingCall,
        isEmitHangup: true,
      }),
    [ongoingCall, handleHangupCall]
  );

  if (!ongoingCall?.isRinging) return;

  return (
    <div className="absolute dark:bg-background/80 bg-foreground/80 w-screen h-screen inset-0 flex-center">
      <div className="min-w-[300px] min-h-[100px] flex-center rounded-xl p-4 bg-[#dfdfdf] shadow-lg">
        <UserAvatar
          disableAnimation
          socketUser={ongoingCall.participants.caller}
          classNames={{
            avatar: {
              base: "size-36",
            },
          }}
        />
        <p className="text-sm mb-2 text-black p-3">
          Incoming Call from&nbsp;
          <strong className="text-sm">
            {ongoingCall.participants.caller.profile.fullName}
          </strong>
        </p>
        <div className="inline-flex-center gap-4">
          <button
            className="relative rounded-full text-2xl mb-[18px]"
            onClick={() => handleJoinCall(ongoingCall)}
          >
            📞
            <span className="absolute text-muted-foreground text-xs inset-0 top-auto translate-y-[150%]">
              Pick
            </span>
          </button>
          <button
            className="relative rounded-full text-2xl mb-[18px]"
            onClick={() => handleHangup()}
          >
            ❌
            <span className="absolute text-muted-foreground text-xs inset-0 top-auto translate-y-[150%]">
              Ignore
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
