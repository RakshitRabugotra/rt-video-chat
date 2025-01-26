"use client";

// Custom hooks
import { useSocket } from "@/hooks/use-socket";

export default function CallNotification() {
  const { ongoingCall } = useSocket();

  if (!ongoingCall?.isRinging) return;

  return (
    <div className="absolute bg-slate-500/70 w-screen h-screen inset-0 flex-center">
      Someone is calling
    </div>
  );
}
