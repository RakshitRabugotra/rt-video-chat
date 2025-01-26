import { useState } from "react";
import { MEDIA_CONSTRAINTS, requestMediaDevices } from "../lib/media";

export interface MediaOptions {
  constraints: MediaStreamConstraints;
}


export default function useMedia(options: MediaOptions = {
  constraints: MEDIA_CONSTRAINTS,
}) {
  // Get the constraints from the options
  const { constraints } = options;
  // controls if media input is on or off
  const [isStreaming, setStreaming] = useState(false);

  // controls the current stream value
  const [stream, setStream] = useState<MediaStream | null>(null);

  // controls if isAudio/isVideo is on or off (separately from each other)
  const [isAudio, setAudio] = useState(!!constraints?.audio);
  const [isVideo, setVideo] = useState(!!constraints?.video);

  // get the user's media stream
  const startStream = async () => {
    return requestMediaDevices(constraints)
    .then((stream) => {
      console.log("Got MediaStream: ", stream);
      setStream(stream);
      setStreaming(true);
    })
    .catch((error) => {
      console.error("Error accessing media devices: ", error);
      setStream(null);
      setStreaming(false);
    });
  };

  // stops the user's media stream
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStreaming(false);
    }
  };

  // enable/disable isAudio tracks in the media stream
  const toggleAudio = () => {
    if (stream) {
      setAudio(prev => !prev);
      stream.getAudioTracks()[0].enabled = isAudio;
    }
  };

  // enable/disable isVideo tracks in the media stream
  const toggleVideo = () => {
    if (stream) {
      setVideo(prev => !prev);
      stream.getVideoTracks()[0].enabled = !isVideo;
    }
  };

  return {
    isStreaming,
    isAudio,
    isVideo,
    stream,
    constraints,
    startStream,
    stopStream,
    toggleAudio,
    toggleVideo
  };
}
