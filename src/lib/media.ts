export const MEDIA_CONSTRAINTS = {
  video: {
    width: 640,
    height: 360,
    frameRate: 25,
    aspectRatio: {
      exact: 640 / 360,
    },
  },
  audio: false,
} as MediaStreamConstraints


/**
 * 
 * @param constraints 
 * @returns 
 */
export const openMediaDevices = async (constraints: MediaStreamConstraints) => {
  return await navigator.mediaDevices.getUserMedia(constraints);
};

/**
 * 
 * @param constraints 
 * @returns 
 */
export const requestMediaDevices = async (constraints = MEDIA_CONSTRAINTS) => {
  let stream: MediaStream | null = null;
  try {
    stream = await openMediaDevices(constraints);
    console.log("Got MediaStream: ", stream);
  } catch (error) {
    console.error("Error accessing media devices: ", error);
  } finally {
    return stream;
  }
};

/**
 * Querying media devices
 */

/**
 * 
 * @param type 
 * @returns All the media devices filtered by the kind of device
 * 
 * @example
 * const videoCameras = getConnectedDevices('videoinput');
 * console.log('Cameras found:', videoCameras);
 */
export const getConnectedDevices = async(type:  MediaDeviceInfo['kind']) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === type)
}