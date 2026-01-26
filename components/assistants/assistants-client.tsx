"use client";

import { useState, useEffect } from "react";
import { Assistant } from "@/app/generated/prisma";
import { AssistantSidebar } from "./assistant-sidebar";
import { AssistantForm } from "./assistant-form";
import {
  deleteAssistant,
  duplicateAssistant,
} from "@/app/actions/assistant-actions";
import { toast } from "sonner";

interface AssistantsClientProps {
  initialAssistants: Assistant[];
}

export function AssistantsClient({ initialAssistants }: AssistantsClientProps) {
  const [assistants, setAssistants] = useState<Assistant[]>(initialAssistants);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(
    null,
  );
  const [newAssistantName, setNewAssistantName] = useState<string | null>(null);

  // Set the most recent assistant as active by default
  useEffect(() => {
    if (assistants.length > 0 && !activeAssistant && !newAssistantName) {
      // Sort by updatedAt and select the most recent
      const mostRecent = [...assistants].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      )[0];
      setActiveAssistant(mostRecent);
    }
  }, [assistants, activeAssistant, newAssistantName]);

  const handleAssistantSelect = (assistant: Assistant) => {
    setActiveAssistant(assistant);
    setNewAssistantName(null);
  };

  const handleAssistantCreate = (name: string) => {
    // When creating a new assistant, show the form with the name
    setNewAssistantName(name);
    setActiveAssistant(null);
  };

  const handleAssistantSave = (savedAssistant: Assistant) => {
    // Update or add the assistant to the list
    const existingIndex = assistants.findIndex(
      (a) => a.id === savedAssistant.id,
    );

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...assistants];
      updated[existingIndex] = savedAssistant;
      setAssistants(updated);
    } else {
      // Add new
      setAssistants([savedAssistant, ...assistants]);
    }

    setActiveAssistant(savedAssistant);
    setNewAssistantName(null);
  };

  const handleAssistantDelete = async (id: string) => {
    try {
      const result = await deleteAssistant(id);

      if (!result.success) {
        toast.error(result.error || "Failed to delete assistant");
        return;
      }

      toast.success(result.message);

      // Remove from list
      setAssistants(assistants.filter((a) => a.id !== id));

      // If the deleted assistant was active, select another one
      if (activeAssistant?.id === id) {
        const remaining = assistants.filter((a) => a.id !== id);
        setActiveAssistant(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleAssistantDuplicate = async (id: string) => {
    try {
      const result = await duplicateAssistant(id);

      if (!result.success) {
        toast.error(result.error || "Failed to duplicate assistant");
        return;
      }

      toast.success(result.message);

      // Add duplicated assistant to list
      if (result.data) {
        setAssistants([result.data as Assistant, ...assistants]);
        setActiveAssistant(result.data as Assistant);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-80 shrink-0">
        <AssistantSidebar
          assistants={assistants}
          activeAssistantId={activeAssistant?.id}
          onAssistantSelect={handleAssistantSelect}
          onAssistantCreate={handleAssistantCreate}
          onAssistantDelete={handleAssistantDelete}
          onAssistantDuplicate={handleAssistantDuplicate}
        />
      </div>

      <div className="flex-1">
        {activeAssistant || newAssistantName ? (
          <AssistantForm
            assistant={activeAssistant || undefined}
            initialName={newAssistantName || undefined}
            onSave={handleAssistantSave}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium text-muted-foreground">
                No assistant selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Select an assistant from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
