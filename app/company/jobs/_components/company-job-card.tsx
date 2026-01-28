"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Users,
  MapPin,
  Briefcase,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Job, JobStatus } from "@/app/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteJob, duplicateJob } from "@/app/actions/job-actions";
import { Spinner } from "@/components/ui/spinner";

interface CompanyJobCardProps {
  job: Job & { _count?: { applications: number } };
  viewMode: "grid" | "list";
}

export function CompanyJobCard({ job, viewMode }: CompanyJobCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const applicationCount = job._count?.applications || 0;

  async function onDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteJob(job.id);
      if (result.success) {
        toast.success("Job deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete job");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  async function onDuplicate() {
    setIsDuplicating(true);
    try {
      const result = await duplicateJob(job.id);
      if (result.success) {
        toast.success("Job duplicated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to duplicate job");
      }
    } catch (error) {
      toast.error("An error occurred while duplicating");
    } finally {
      setIsDuplicating(false);
    }
  }

  const statusColors: Record<
    JobStatus,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    ACTIVE: "default",
    PAUSED: "secondary",
    CLOSED: "destructive",
  };

  const ActionsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/company/jobs/${job.id}/edit`}>
            <Pencil />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate} disabled={isDuplicating}>
          <Copy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === "list") {
    return (
      <>
        <div className="group flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-card hover:bg-accent/30 hover:shadow-sm transition-all">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">
                    <Link href={`/company/jobs/${job.id}/edit`}>
                      {job.title}
                    </Link>
                  </h3>
                  <Badge variant={statusColors[job.status]}>{job.status}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{job.employmentType.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {job.locationType === "REMOTE"
                        ? "Remote"
                        : job.location || "On-site"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(job.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="sm:hidden">
                <ActionsMenu />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 font-normal">
                <Users className="w-3.5 h-3.5" />
                {applicationCount} Applicants
              </Badge>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end justify-between gap-2">
            <ActionsMenu />
            <Button variant="outline" size="sm" asChild>
              <Link href={`/company/jobs/${job.id}`}>View Details</Link>
            </Button>
          </div>
        </div>

        <DeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={onDelete}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  // Grid View
  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <Badge variant={statusColors[job.status]}>{job.status}</Badge>
          <ActionsMenu />
        </CardHeader>
        <CardContent className="flex-1 space-y-6">
          <div className="space-y-1">
            <h3
              className="font-semibold text-xl line-clamp-1"
              title={job.title}
            >
              <Link
                href={`/company/jobs/${job.id}/edit`}
                className="hover:text-primary transition-colors"
              >
                {job.title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {job.employmentType.replace("_", " ")}
            </Badge>
            <Badge variant="secondary">{job.locationType}</Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Posted{" "}
              {formatDistanceToNow(new Date(job.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardContent>
        <CardFooter className="border-t flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Users className="w-4 h-4 text-primary" />
            {applicationCount} Applicants
          </div>
          <Button
            size="sm"
            onClick={() => router.push(`/company/jobs/${job.id}`)}
          >
            View
          </Button>
        </CardFooter>
      </Card>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={onDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the job
            posting and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? <Spinner className="mr-2" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
