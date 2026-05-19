"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TranscriptHandler = (transcript: string, isFinal: boolean) => void;

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function useVoiceTools() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);
  const [voiceOutputSupported, setVoiceOutputSupported] = useState(false);

  const getRecognitionCtor = useCallback(() => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startListening = useCallback((onTranscript: TranscriptHandler) => {
    const RecognitionCtor = getRecognitionCtor();
    if (!RecognitionCtor) return false;

    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let nextTranscript = "";
      let final = false;
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        nextTranscript += event.results[index][0]?.transcript || "";
        final = Boolean(event.results[index].isFinal);
      }
      onTranscript(nextTranscript.trim(), final);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
    return true;
  }, [getRecognitionCtor]);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.02;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
    return true;
  }, []);

  useEffect(() => {
    setVoiceInputSupported(Boolean(getRecognitionCtor()));
    setVoiceOutputSupported(typeof window !== "undefined" && "speechSynthesis" in window);

    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [getRecognitionCtor]);

  return {
    listening,
    speaking,
    voiceInputSupported,
    voiceOutputSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}