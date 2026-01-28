"use client";

import { formatDistanceToNow } from "date-fns";
import { Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Job } from "@/app/generated/prisma";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useJobContext } from "@/components/jobs/job-provider";

interface JobCardProps {
  job: Job & { company: { name: string; logoUrl?: string | null } };
  variant?: "grid" | "list";
}

export function JobCard({
  job,
  variant = "grid",
  isSaved = false,
  onToggleSave,
}: JobCardProps & {
  isSaved?: boolean;
  onToggleSave?: (id: string) => Promise<void>;
}) {
  const isList = variant === "list";
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedJobId } = useJobContext();

  // Sync state if prop changes (for filter updates etc)
  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleSave || isLoading) return;

    setIsLoading(true);
    // Optimistic update
    setSaved(!saved);
    try {
      await onToggleSave(job.id);
    } catch (error) {
      // Revert on error
      setSaved(saved);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    setSelectedJobId(job.id);
  };

  if (isList) {
    return (
      <Card
        className="py-0 cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-4 sm:p-6">
          <div className="flex items-start gap-2 w-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={job.company.logoUrl as string} />
              <AvatarFallback>
                {job.company.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold leading-tight line-clamp-1 pr-8 sm:pr-0">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {job.company.name}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{job.employmentType.replace("_", " ")}</span>
                <span>•</span>
                <span>{job.locationType}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-primary font-medium w-full sm:w-auto mt-1 sm:mt-0">
                  {job.salaryRange}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-row-reverse items-center justify-between sm:flex-col sm:items-end sm:gap-2 w-full sm:w-auto pl-[3.5rem] sm:pl-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Bookmark className={saved ? "fill-current" : ""} />
            </Button>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(job.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Avatar className="h-10 w-10">
            <AvatarImage src={job.company.logoUrl as string} />
            <AvatarFallback>
              {job.company.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Bookmark className={saved ? "fill-primary stroke-primary" : ""} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{job.company.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">{job.title}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {job.employmentType.replace("_", " ")}
            </Badge>
            <Badge variant="secondary">{job.locationType}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{job.salaryRange}</span>
          <span className="text-xs text-muted-foreground">{job.location}</span>
        </div>
        <Button onClick={handleCardClick}>Apply now</Button>
      </CardFooter>
    </Card>
  );
}
