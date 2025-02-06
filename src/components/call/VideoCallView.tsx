"use client";

import { useSocket } from "@/hooks/use-socket";
import VideoCall from "./VideoCall";
import { useCallback } from "react";

export default function VideoCallView() {
  let { localStream, isCallEnded, ongoingCall, constraints, peer, handleHangupCall } = useSocket();

  const isOnCall = peer && peer.stream ? true: false

  const handleHangup = useCallback(() => handleHangupCall({
    ongoingCall,
    isEmitHangup: true
  }), [ongoingCall, handleHangupCall])

  if(isCallEnded) {
    return <div className='mt-5 text-rose-500'>Call Ended</div>
  }

  if(!localStream && !peer) return;

  return (
    <aside className="video-view max-w-[35%] flex-1 flex flex-col">
      <div className="video-view user border-x-2 border-solid border-red-600 flex-1">
        {/* The video for the other person */}
        {peer && peer.stream && (
          <VideoCall
            isOnCall={isOnCall}
            stream={peer.stream}
            constraints={constraints}
          />
        )}
      </div>
      <div className="video-view other border-x-2 border-t-2 border-solid border-red-600 flex-1">
        {/* The video for the local user */}
        <VideoCall
          isLocalStream
          isOnCall={isOnCall}
          stream={localStream}
          constraints={constraints}
          handleHangupCall={handleHangup}
        />
      </div>
    </aside>
  );
}
