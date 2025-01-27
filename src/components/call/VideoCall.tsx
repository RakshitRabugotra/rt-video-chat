"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Styles
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";

export interface VideoCallStyleProps {
  className?: string;
  classNames?: {
    base?: string;
    videoContainer?: string;
    video?: string;
    controls?: {
      base?: string;
      button?: string;
      buttonText?: string;
    };
  };
}

export interface VideoCallProps extends VideoCallStyleProps {
  stream: MediaStream | null
  constraints: MediaStreamConstraints
  isLocalStream: boolean;
  isOnCall: boolean;
  startStream: (faceMode?: string) => Promise<void>
}

export default function VideoCall({ stream, constraints, startStream, className, classNames }: VideoCallProps) {

  const webcamVideo = useRef<HTMLVideoElement | null>(null);

  
  // To keep track if we're streaming
  const isStreaming = useMemo(() => stream !== null, [stream])
  
  // The constraints on the video of the stream
  const { width: videoWidth, height: videoHeight } = useMemo(
    () => constraints.video as MediaTrackConstraints,
    [constraints]
  );

  // To keep the state of the stream audio and video
  const [isVideo, setVideo] = useState(Boolean(constraints.video)); 
  const [isAudio, setAudio] = useState(Boolean(constraints.audio)); 

  // To toggle the audio/video
  const toggleAudio = useCallback(() => {
    if(stream) {
      stream.getAudioTracks()[0].enabled = !isAudio;
      setAudio(prev => !prev);
    }
  }, [stream, isAudio])

  const toggleVideo = useCallback(() => {
    if(stream) {
      stream.getVideoTracks()[0].enabled = !isVideo;
      setVideo(prev => !prev);
    }
  }, [stream, isAudio])

  // To stop the video stream/call
  const stopStream = () => {

  }

  useEffect(() => {
    if (stream && webcamVideo.current) {
      // The stream is not null, then set the video source
      webcamVideo.current.srcObject = stream;
    }
  }, [isStreaming]);

  return (
    <div
      className={twMerge(
        "flex-center gap-8 w-full h-full",
        classNames?.base,
        className
      )}
    >
      {!isStreaming && (
        <>
          <h2>Welcome! Let's turn on the camera?</h2>
          <button onClick={() => startStream()}>Let's gooo</button>
        </>
      )}

      <div
        className={twMerge(
          "p-4",
          classNames?.videoContainer,
          isStreaming ? "block flex-center" : "hidden"
        )}
      >
        <video
          autoPlay
          playsInline
          ref={webcamVideo}
          className={twMerge(
            "rounded-3xl overflow-hidden border-2 border-solid border-foreground",
            classNames?.video
          )}
          width={Number(videoWidth)}
          height={Number(videoHeight)}
        ></video>

        {isStreaming && (
          <div
            className={twMerge(
              "inline-flex py-6 justify-center gap-8",
              classNames?.controls?.base
            )}
          >
            <Button
              size="sm"
              className={twMerge(
                "relative icon-mute border-2 border-solid",
                isAudio ? "border-green-400" : "border-0",
                classNames?.controls?.button
              )}
              onClick={toggleAudio}
            >
              <p
                className={twMerge(
                  "absolute inset-0 top-auto text-center text-xs color-[#d1d1d1] translate-y-[200%]",
                  classNames?.controls?.buttonText
                )}
              >
                Mute
              </p>
            </Button>
            <Button
              size="sm"
              className={twMerge(
                "relative icon-hide border-2 border-solid",
                isVideo ? "border-green-400" : "border-0",
                classNames?.controls?.button
              )}
              onClick={toggleVideo}
            >
              <p
                className={twMerge(
                  "absolute inset-0 top-auto text-center text-xs color-[#d1d1d1] translate-y-[200%]",
                  classNames?.controls?.buttonText
                )}
              >
                Hide
              </p>
            </Button>
            <Button
              size="sm"
              className={twMerge(
                "relative icon-hang",
                classNames?.controls?.button
              )}
              onClick={stopStream}
            >
              <p
                className={twMerge(
                  "absolute inset-0 top-auto text-center text-xs color-[#d1d1d1] translate-y-[200%]",
                  classNames?.controls?.buttonText
                )}
              >
                Hang Up
              </p>
            </Button>
          </div>
        )}

        {/* {isStreaming && <ChatBox />} */}
      </div>
    </div>
  );
}
