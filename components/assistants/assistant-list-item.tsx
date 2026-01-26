"use client";

import { Assistant } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Bot, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AssistantListItemProps {
  assistant: Assistant;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function AssistantListItem({
  assistant,
  isActive,
  onClick,
  onDelete,
  onDuplicate,
}: AssistantListItemProps) {
  const truncateName = (name: string, maxLength: number = 27) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, 24) + "...";
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors cursor-pointer w-full overflow-hidden",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
          isActive
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-border bg-background",
        )}
      >
        <Bot className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-sm font-medium w-full" title={assistant.name}>
          {truncateName(assistant.name)}
        </p>

        <div className="flex items-center gap-1.5 mt-0.5 min-w-0 overflow-hidden">
          <span className="text-xs text-muted-foreground capitalize shrink-0">
            {assistant.provider}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">•</span>
          <span className="text-xs text-muted-foreground truncate min-w-0">
            {assistant.model}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.();
              }}
            >
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
