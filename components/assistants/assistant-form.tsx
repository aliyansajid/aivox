"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomFormField, FormFieldType } from "@/components/custom-form-field";
import { toast } from "sonner";
import { assistantSchema } from "@/schemas";
import { Assistant } from "@/app/generated/prisma";
import { Mic, DollarSign, Phone, Save, Bot } from "lucide-react";
import { CallAssistantDialog } from "./call-assistant-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CONSTANTS,
  PROVIDERS,
  MODELS,
  VOICE_PROVIDERS,
  VOICES,
  BADGE_COLORS,
} from "@/constants";
import { Spinner } from "../ui/spinner";
import {
  createAssistant,
  updateAssistant,
} from "@/app/actions/assistant-actions";

interface AssistantFormProps {
  assistant?: Assistant;
  initialName?: string;
  onSave?: (assistant: Assistant) => void;
}

export function AssistantForm({
  assistant,
  initialName,
  onSave,
}: AssistantFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof assistantSchema>>({
    resolver: zodResolver(assistantSchema),
    defaultValues: {
      name: assistant?.name || initialName || "",
      provider: assistant?.provider || "openai",
      model: assistant?.model || "gpt-5.2",
      voiceProvider: assistant?.voiceProvider || "vapi",
      voice: assistant?.voice || "Tara",
      firstMessage: assistant?.firstMessage || "",
      systemPrompt: assistant?.systemPrompt || "",
      endMessage: assistant?.endMessage || "",
    },
  });

  // Watch fields for dynamic updates
  const watchProvider = form.watch("provider");
  const watchModel = form.watch("model");
  const watchVoiceProvider = form.watch("voiceProvider");
  const watchVoice = form.watch("voice");

  // Effect to reset model when provider changes if current model is not valid for new provider
  useEffect(() => {
    const supportedModels = MODELS[watchProvider] || [];
    const isModelValid = supportedModels.some((m) => m.value === watchModel);
    if (!isModelValid && supportedModels.length > 0) {
      form.setValue("model", supportedModels[0].value);
    }
  }, [watchProvider, form, watchModel]);

  // Effect to update form when assistant prop changes
  useEffect(() => {
    if (assistant) {
      form.reset({
        name: assistant.name || "",
        provider: assistant.provider || "openai",
        model: assistant.model || "gpt-5.2",
        voiceProvider: assistant.voiceProvider || "vapi",
        voice: assistant.voice || "Tara",
        firstMessage: assistant.firstMessage || "",
        systemPrompt: assistant.systemPrompt || "",
        endMessage: assistant.endMessage || "",
      });
    }
  }, [assistant?.id, form, assistant]);

  // Helper to get Models options based on provider
  const modelOptions = useMemo(() => {
    if (!watchProvider) return [];
    return MODELS[watchProvider] || [];
  }, [watchProvider]);

  // Helper to get Voice options based on provider
  const voiceOptions = useMemo(() => {
    if (!watchVoiceProvider) return [];
    if (watchVoiceProvider === "vapi") return VOICES;
    return [];
  }, [watchVoiceProvider]);

  // Cost Calculation
  const costBreakdown = useMemo(() => {
    let modelCost = 0;
    let voiceCost = 0;

    // Find model cost
    const models = MODELS[watchProvider];
    if (models) {
      const selectedModel = models.find((m) => m.value === watchModel);
      if (selectedModel) modelCost = selectedModel.cost;
    }

    // Find voice cost
    if (watchVoiceProvider === "vapi") {
      const selectedVoice = VOICES.find((v) => v.value === watchVoice);
      if (selectedVoice) voiceCost = selectedVoice.cost;
    }

    const subtotal =
      CONSTANTS.HOSTING_COST +
      CONSTANTS.TRANSCRIBE_COST +
      modelCost +
      voiceCost;
    const platformFee = subtotal * CONSTANTS.PLATFORM_FEE_PERCENT;
    const total = subtotal + platformFee;

    return {
      hosting: CONSTANTS.HOSTING_COST,
      transcribe: CONSTANTS.TRANSCRIBE_COST,
      model: modelCost,
      voice: voiceCost,
      platformFee,
      total,
    };
  }, [watchProvider, watchModel, watchVoiceProvider, watchVoice]);

  const onSubmit = async (data: z.infer<typeof assistantSchema>) => {
    setIsSubmitting(true);
    try {
      let result;

      if (assistant?.id) {
        // Update existing assistant
        result = await updateAssistant(assistant.id, data);
      } else {
        // Create new assistant

        result = await createAssistant(data);
      }

      if (!result.success) {
        toast.error(result.error || "Failed to save assistant");
        return;
      }

      toast.success(assistant ? result.message : result.message);

      // Call onSave callback if provided
      if (onSave && result.data) {
        onSave(result.data as Assistant);
      }

      if (!assistant) {
        router.push("/company/assistants");
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestCall = () => {
    if (!assistant) return;
    setIsCallDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="contents">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                {assistant?.name || initialName || "New Assistant"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">
                  {PROVIDERS.find((p) => p.value === watchProvider)?.label}
                </Badge>
                <span>•</span>
                <span>{watchModel}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {assistant && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestCall}
                >
                  <Phone />
                  Talk to Assistant
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : <Save />}
                {assistant ? "Publish Changes" : "Create Assistant"}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-3 rounded-md bg-primary/10">
                    <Bot className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Model</CardTitle>
                    <CardDescription>
                      Configure the underlying AI model and behavior
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="name"
                  label="Assistant Name"
                  placeholder="e.g. Customer Support AI"
                />

                <div className="grid grid-cols-2 gap-3">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SELECT}
                    name="provider"
                    label="Provider"
                    placeholder="Select provider"
                    selectOptions={PROVIDERS}
                    className="w-full"
                  />
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SELECT}
                    name="model"
                    label="Model"
                    placeholder="Select model"
                    selectOptions={modelOptions.map((m) => ({
                      label: m.label,
                      value: m.value,
                      badges: m.badges,
                      cost: m.cost,
                      badgeColors: BADGE_COLORS,
                    }))}
                    className="w-full"
                  />
                </div>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.TEXTAREA}
                  name="firstMessage"
                  label="First Message"
                  placeholder="Hello! How can I help you today?"
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.TEXTAREA}
                  name="systemPrompt"
                  label="System Prompt"
                  placeholder="Define the assistant's personality and instructions..."
                  className="min-h-37.5"
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.TEXTAREA}
                  name="endMessage"
                  label="End Message"
                  placeholder="Thank you for chatting!"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-3 rounded-md bg-primary/10">
                    <Mic className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Voice</CardTitle>
                    <CardDescription>
                      Choose how your assistant sounds
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="voiceProvider"
                  label="Voice Provider"
                  selectOptions={VOICE_PROVIDERS}
                  className="w-full"
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="voice"
                  label="Voice"
                  placeholder="Select a voice"
                  selectOptions={voiceOptions.map((v) => ({
                    label: v.label,
                    value: v.value,
                    badges: v.badges,
                  }))}
                  className="w-full"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-3 rounded-md bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Cost Estimation</CardTitle>
                    <CardDescription>
                      Estimated cost breakdown per minute
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-muted-foreground">Hosting</div>
                    <div className="text-right font-medium">
                      ${costBreakdown.hosting.toFixed(3)}
                    </div>

                    <div className="text-muted-foreground">Transcribe</div>
                    <div className="text-right font-medium">
                      ${costBreakdown.transcribe.toFixed(3)}
                    </div>

                    <div className="text-muted-foreground">
                      Model ({watchModel})
                    </div>
                    <div className="text-right font-medium">
                      ${costBreakdown.model.toFixed(3)}
                    </div>

                    <div className="text-muted-foreground">
                      Voice ({watchVoice})
                    </div>
                    <div className="text-right font-medium">
                      ${costBreakdown.voice.toFixed(3)}
                    </div>

                    <div className="text-muted-foreground">Platform Fee</div>
                    <div className="text-right font-medium">
                      ${costBreakdown.platformFee.toFixed(3)}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        Total Estimated Cost
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-bold block">
                          ~${costBreakdown.total.toFixed(3)} /min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      {/* Call Assistant Dialog */}
      {assistant && (
        <CallAssistantDialog
          open={isCallDialogOpen}
          onOpenChange={setIsCallDialogOpen}
          assistant={assistant}
        />
      )}
    </div>
  );
}
