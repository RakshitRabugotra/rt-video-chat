"use client";

import { useEffect, useMemo, useRef } from "react";
// Custom Hooks
import useMedia from "@/hooks/use-media";
// Styles
import ChatBox from "@/components/ChatBox";
import { twMerge } from "tailwind-merge";
import { Button } from "./ui/button";

export interface VideoBoxProps {
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

export default function VideoBox({ className, classNames }: VideoBoxProps) {
  const {
    isStreaming,
    stream,
    constraints,
    isVideo,
    isAudio,
    startStream,
    stopStream,
    toggleAudio,
    toggleVideo,
  } = useMedia();

  const webcamVideo = useRef<HTMLVideoElement | null>(null);

  const { width: videoWidth, height: videoHeight } = useMemo(
    () => constraints.video as MediaTrackConstraints,
    [constraints]
  );

  const handleStartStream = () => {
    startStream()
      .then(() => {
        console.log("Start started successfully");
      })
      .catch(() => {
        console.error("Error while starting the stream");
      });
  };

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
          <button onClick={handleStartStream}>Let's gooo</button>
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
