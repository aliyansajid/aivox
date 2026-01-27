"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomFormField, FormFieldType } from "../custom-form-field";
import { Form } from "../ui/form";
import { Spinner } from "../ui/spinner";
import { createAssistantSchema } from "@/schemas";
import { toast } from "sonner";
import { Assistant } from "@/app/generated/prisma";
import { createAssistant } from "@/app/actions/assistant-actions";
import { ArrowRight, PlusCircle } from "lucide-react";

interface CreateAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssistantCreated: (assistant: Assistant) => void;
}

export function CreateAssistantDialog({
  open,
  onOpenChange,
  onAssistantCreated,
}: CreateAssistantDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof createAssistantSchema>>({
    resolver: zodResolver(createAssistantSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof createAssistantSchema>) => {
    setIsLoading(true);
    try {
      // Create assistant with default values immediately
      const result = await createAssistant({
        name: data.name.trim(),
        provider: "openai",
        model: "gpt-5.2",
        voiceProvider: "vapi",
        voice: "Tara",
        firstMessage: "Hello! How can I help you today?",
        systemPrompt:
          "You are a helpful AI assistant. Be professional, friendly, and concise in your responses.",
        endMessage: "Thank you for the conversation. Have a great day!",
      });

      if (!result.success) {
        toast.error(result.error || "Failed to create assistant");
        return;
      }

      toast.success(result.message);

      // Pass the created assistant to the parent
      if (result.data) {
        onAssistantCreated(result.data as Assistant);
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Create AI Assistant</DialogTitle>
              <DialogDescription>
                Give your assistant a name. You'll configure its behavior in the
                next step.
              </DialogDescription>
            </DialogHeader>

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="text"
              name="name"
              label="Assistant Name"
              placeholder="e.g. Customer Support AI"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <PlusCircle />
                    Create assitant
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
