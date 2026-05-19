"use client";

import { useEffect, useRef, useState } from "react";

export function useWebRTC({ audioOnly = false }: { audioOnly?: boolean } = {}) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const boot = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: audioOnly ? false : { facingMode }
        });
        setStream((current) => {
          current?.getTracks().forEach((track) => track.stop());
          return media;
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = media;
      } catch {
        setStream(null);
      }
    };
    boot();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [audioOnly, facingMode]);

  const toggleMute = () => {
    stream?.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted((v) => !v);
  };

  const toggleCamera = () => {
    stream?.getVideoTracks().forEach((t) => (t.enabled = cameraOff));
    setCameraOff((v) => !v);
  };

  const toggleSpeaker = () => setSpeakerOn((current) => !current);
  const switchCamera = () => setFacingMode((current) => (current === "user" ? "environment" : "user"));

  return {
    localVideoRef,
    muted,
    cameraOff,
    speakerOn,
    stream,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    switchCamera
  };
}
