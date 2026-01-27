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
  const [transcript, setTranscript] = useState<
    Array<{ role: "assistant" | "user"; text: string; timestamp: Date }>
  >([]);

  const vapiRef = useRef<Vapi | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize Vapi client
  useEffect(() => {
    // Prevent double initialization in strict mode
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

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
      callStartTimeRef.current = Date.now();
      setDuration(0);
      onCallStart?.();

      // Clear any existing interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        if (callStartTimeRef.current) {
          const elapsed = Math.floor(
            (Date.now() - callStartTimeRef.current) / 1000,
          );
          setDuration(elapsed);
        }
      }, 1000);
    });

    vapi.on("call-end", () => {
      setCallStatus("disconnected");
      callStartTimeRef.current = null;

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Call onCallEnd after a small delay to allow Vapi to clean up
      setTimeout(() => {
        onCallEnd?.();
      }, 100);
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
      // Ignore "meeting ended" errors as they're expected after call ends
      const errorMessage =
        error?.message || error?.toString?.() || "Unknown error";

      if (
        errorMessage.toLowerCase().includes("meeting ended") ||
        errorMessage.toLowerCase().includes("ejection")
      ) {
        // Normal call end, ignore this error
        return;
      }

      // Handle specific errors
      if (
        errorMessage.toLowerCase().includes("bad sigauthz token") ||
        errorMessage.toLowerCase().includes("authentication")
      ) {
        setCallStatus("error");
        onError?.(
          "Authentication error. Please check your Vapi configuration.",
        );
        return;
      }

      setCallStatus("error");
      onError?.("An error occurred during the call. Please try again.");
    });

    // Cleanup only on unmount
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []); // Empty deps - only run once on mount/unmount

  // Start call
  const startCall = useCallback(async () => {
    if (!vapiRef.current) {
      onError?.("Vapi client is not initialized");
      return;
    }

    if (!assistantId || assistantId.trim() === "") {
      onError?.("Invalid assistant ID");
      return;
    }

    try {
      setCallStatus("connecting");
      setDuration(0);
      setTranscript([]);

      await vapiRef.current.start(assistantId);
    } catch (error: any) {
      setCallStatus("error");

      // Provide specific error messages
      const errorMessage = error?.message || error?.toString?.() || "";
      if (
        errorMessage.toLowerCase().includes("assistant") ||
        errorMessage.toLowerCase().includes("not found")
      ) {
        onError?.("Assistant not found. Please save your changes first.");
      } else if (errorMessage.toLowerCase().includes("authentication")) {
        onError?.("Authentication error. Please check your Vapi API keys.");
      } else {
        onError?.("Failed to start call. Please try again.");
      }
    }
  }, [assistantId, onError]);

  // End call
  const endCall = useCallback(() => {
    if (!vapiRef.current) return;

    vapiRef.current.stop();
    setCallStatus("inactive");
    callStartTimeRef.current = null;

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Format duration as MM:SS
  const formattedDuration = `${Math.floor(duration / 60)
    .toString()
    .padStart(2, "0")}:${(duration % 60).toString().padStart(2, "0")}`;

  return {
    callStatus,
    duration,
    formattedDuration,
    transcript,
    startCall,
    endCall,
  };
}
