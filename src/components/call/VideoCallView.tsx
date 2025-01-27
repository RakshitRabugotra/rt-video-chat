"use client";

import { useSocket } from "@/hooks/use-socket";
import VideoCall from "./VideoCall";

export default function VideoCallView() {
  let { localStream, constraints, getMediaStream } = useSocket();

  const startStream = async () => {
    localStream = await getMediaStream();
  };

  return (
    <>
      <div className="video-view user border-x-2 border-solid border-red-600 flex-1">
        {/* The video for the other person */}
        {/* <VideoCall /> */}
      </div>
      <div className="video-view other border-x-2 border-t-2 border-solid border-red-600 flex-1">
        {/* The video for the local user */}
        <VideoCall
          isLocalStream
          isOnCall={false}
          stream={localStream}
          startStream={startStream}
          constraints={constraints}
        />
      </div>
    </>
  );
}
