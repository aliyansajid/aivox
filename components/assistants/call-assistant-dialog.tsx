"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, PhoneCall } from "lucide-react";
import { useVapi } from "@/hooks/use-vapi";
import { Assistant } from "@/app/generated/prisma";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CallAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistant: Assistant;
}

export function CallAssistantDialog({
  open,
  onOpenChange,
  assistant,
}: CallAssistantDialogProps) {
  const [callStarted, setCallStarted] = useState(false);

  const {
    callStatus,
    formattedDuration,
    isMuted,
    transcript,
    startCall,
    endCall,
    toggleMute,
  } = useVapi({
    assistantId: assistant.vapiAssistantId,
    onCallStart: () => {
      setCallStarted(true);
      toast.success("Call connected");
    },
    onCallEnd: () => {
      setCallStarted(false);
      toast.info("Call ended");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleStartCall = () => {
    startCall();
  };

  const handleEndCall = () => {
    endCall();
    setCallStarted(false);
  };

  const handleClose = () => {
    if (callStatus === "connected" || callStatus === "connecting") {
      endCall();
    }
    onOpenChange(false);
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case "connecting":
        return "bg-yellow-500";
      case "connected":
        return "bg-green-500";
      case "disconnected":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case "connecting":
        return "Connecting...";
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Error";
      default:
        return "Ready";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Talk to {assistant.name}</DialogTitle>
          <DialogDescription>
            Test your AI assistant with a live voice call
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  getStatusColor(),
                  callStatus === "connecting" && "animate-pulse",
                )}
              />
              {callStatus === "connected" && (
                <div
                  className={cn(
                    "absolute inset-0 h-2 w-2 rounded-full animate-ping",
                    getStatusColor(),
                  )}
                />
              )}
            </div>
            <span className="text-sm font-medium">{getStatusText()}</span>
            {callStatus === "connected" && (
              <span className="text-sm text-muted-foreground">
                {formattedDuration}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            {!callStarted ? (
              <Button
                size="lg"
                onClick={handleStartCall}
                disabled={callStatus === "connecting"}
                className="h-16 w-16 rounded-full"
              >
                {callStatus === "connecting" ? <PhoneCall /> : <Phone />}
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "outline"}
                  onClick={toggleMute}
                  className="h-16 w-16 rounded-full"
                  disabled={callStatus !== "connected"}
                >
                  {isMuted ? <MicOff /> : <Mic />}
                </Button>

                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleEndCall}
                  className="h-16 w-16 rounded-full"
                >
                  <PhoneOff />
                </Button>
              </>
            )}
          </div>

          {transcript.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Transcript</h3>
              <ScrollArea className="h-50 rounded-md border p-4">
                <div className="space-y-3">
                  {transcript.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-2",
                        message.role === "user" && "flex-row-reverse",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                          message.role === "assistant"
                            ? "bg-muted"
                            : "bg-primary text-primary-foreground",
                        )}
                      >
                        <p className="text-xs font-medium mb-1">
                          {message.role === "assistant" ? "Assistant" : "You"}
                        </p>
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {!callStarted && callStatus === "inactive" && (
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Click the phone button to start a call with your assistant.</p>
              <p className="text-xs">
                Make sure your microphone is enabled and working.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
