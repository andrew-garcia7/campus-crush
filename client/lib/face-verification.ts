export const startSelfieCapture = async () => {
  try {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true
      });

    return stream;
  } catch (err) {
    throw new Error("Camera access denied");
  }
};