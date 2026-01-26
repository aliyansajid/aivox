"use client";

import { useState, useMemo } from "react";
import { Assistant } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, SearchIcon } from "lucide-react";
import { AssistantListItem } from "./assistant-list-item";
import { CreateAssistantDialog } from "./create-assistant-dialog";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

interface AssistantSidebarProps {
  assistants: Assistant[];
  activeAssistantId?: string;
  onAssistantSelect: (assistant: Assistant) => void;
  onAssistantCreate: (name: string) => void;
  onAssistantDelete?: (id: string) => void;
  onAssistantDuplicate?: (id: string) => void;
}

export function AssistantSidebar({
  assistants,
  activeAssistantId,
  onAssistantSelect,
  onAssistantCreate,
  onAssistantDelete,
  onAssistantDuplicate,
}: AssistantSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredAssistants = useMemo(() => {
    if (!searchQuery.trim()) return assistants;

    const query = searchQuery.toLowerCase();
    return assistants.filter(
      (assistant) =>
        assistant.name.toLowerCase().includes(query) ||
        assistant.provider.toLowerCase().includes(query) ||
        assistant.model.toLowerCase().includes(query),
    );
  }, [assistants, searchQuery]);

  return (
    <>
      <div className="flex h-full overflow-hidden flex-col border-r bg-background">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Assistants</h2>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus />
              <span className="sr-only">Create Assistant</span>
            </Button>
          </div>

          <InputGroup>
            <InputGroupInput
              id="inline-start-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-4 w-full">
            {filteredAssistants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No assistants found" : "No assistants yet"}
                </p>
                {!searchQuery && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Create your first assistant
                  </Button>
                )}
              </div>
            ) : (
              filteredAssistants.map((assistant) => (
                <AssistantListItem
                  key={assistant.id}
                  assistant={assistant}
                  isActive={assistant.id === activeAssistantId}
                  onClick={() => onAssistantSelect(assistant)}
                  onDelete={
                    onAssistantDelete
                      ? () => onAssistantDelete(assistant.id)
                      : undefined
                  }
                  onDuplicate={
                    onAssistantDuplicate
                      ? () => onAssistantDuplicate(assistant.id)
                      : undefined
                  }
                />
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Assistants</span>
            <span className="font-medium">{assistants.length}</span>
          </div>
        </div>
      </div>

      <CreateAssistantDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onAssistantCreated={onAssistantCreate}
      />
    </>
  );
}
