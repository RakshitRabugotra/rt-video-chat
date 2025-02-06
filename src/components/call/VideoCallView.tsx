"use client";

import { useSocket } from "@/hooks/use-socket";
import VideoCall from "./VideoCall";

export default function VideoCallView() {
  let { localStream, constraints, peer, ongoingCall } = useSocket();

  const isOnCall = peer && peer.stream ? true: false

  console.log("peer-stream: ", peer?.stream?.getVideoTracks())
  console.log("local-stream: ", localStream?.getVideoTracks())

  return (
    <>
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
        />
      </div>
    </>
  );
}
