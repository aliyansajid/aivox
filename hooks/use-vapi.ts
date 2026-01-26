"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";

export type CallStatus =
  | "inactive"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface UseVapiOptions {
  assistantId: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onError?: (error: string) => void;
}

export function useVapi({
  assistantId,
  onCallStart,
  onCallEnd,
  onError,
}: UseVapiOptions) {
  const [callStatus, setCallStatus] = useState<CallStatus>("inactive");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<
    Array<{ role: "assistant" | "user"; text: string; timestamp: Date }>
  >([]);

  const vapiRef = useRef<Vapi | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Vapi client
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

    if (!publicKey) {
      setCallStatus("error");
      onError?.("Configuration error. Please contact support.");
      return;
    }

    vapiRef.current = new Vapi(publicKey);

    // Set up event listeners
    const vapi = vapiRef.current;

    vapi.on("call-start", () => {
      setCallStatus("connected");
      onCallStart?.();

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    });

    vapi.on("call-end", () => {
      setCallStatus("disconnected");
      onCallEnd?.();

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    });

    vapi.on("speech-start", () => {
      // Assistant started speaking
    });

    vapi.on("speech-end", () => {
      // Assistant stopped speaking
    });

    vapi.on("message", (message: any) => {
      // Handle transcript messages
      if (message.type === "transcript") {
        const role = message.role as "assistant" | "user";
        const text = message.transcript || message.transcriptText;

        if (text) {
          setTranscript((prev) => [
            ...prev,
            {
              role,
              text,
              timestamp: new Date(),
            },
          ]);
        }
      }
    });

    vapi.on("error", (error: any) => {
      setCallStatus("error");
      onError?.("An error occurred during the call. Please try again.");
    });

    // Cleanup
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      vapi.stop();
    };
  }, [assistantId, onCallStart, onCallEnd, onError]);

  // Start call
  const startCall = useCallback(async () => {
    if (!vapiRef.current) {
      onError?.("Vapi client is not initialized");
      return;
    }

    try {
      setCallStatus("connecting");
      setDuration(0);
      setTranscript([]);

      await vapiRef.current.start(assistantId);
    } catch (error: any) {
      setCallStatus("error");
      onError?.("Failed to start call. Please try again.");
    }
  }, [assistantId, onError]);

  // End call
  const endCall = useCallback(() => {
    if (!vapiRef.current) return;

    vapiRef.current.stop();
    setCallStatus("inactive");

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;

    const newMutedState = !isMuted;
    vapiRef.current.setMuted(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted]);

  // Format duration as MM:SS
  const formattedDuration = `${Math.floor(duration / 60)
    .toString()
    .padStart(2, "0")}:${(duration % 60).toString().padStart(2, "0")}`;

  return {
    callStatus,
    duration,
    formattedDuration,
    isMuted,
    transcript,
    startCall,
    endCall,
    toggleMute,
  };
}
