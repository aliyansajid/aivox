"use client";

import { X, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { getJobDetails, toggleSaveJob } from "@/app/actions/applicant-actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

import { useJobContext } from "@/components/jobs/job-provider";

const fetcher = async (id: string) => {
  const res = await getJobDetails(id);
  if (!res.success) throw new Error(res.error);
  return res.data;
};

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { selectedJobId, setSelectedJobId } = useJobContext();

  const {
    data: job,
    error,
    isLoading,
    mutate,
  } = useSWR(selectedJobId ? selectedJobId : null, fetcher);

  const closeSidebar = () => {
    setSelectedJobId(null);
  };

  const handleSave = async () => {
    if (!job) return;
    const result = await toggleSaveJob(job.id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
      mutate({ ...job, isSaved: result.saved as boolean }, false); // Optimistic update
    }
  };

  if (!selectedJobId) {
    return null;
  }

  return (
    <Sidebar
      collapsible="none"
      side="right"
      className="sticky top-0 hidden h-svh border-l lg:flex w-[400px] bg-white"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">Job Details</h2>
        <Button variant="ghost" size="icon" onClick={closeSidebar}>
          <X />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            Failed to load job details: {error.message}
          </div>
        ) : job ? (
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-16 w-16 border">
                      {job.company.logoUrl && (
                        <AvatarImage src={job.company.logoUrl} />
                      )}
                      <AvatarFallback>
                        {job.company.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {job.company.name}
                    </span>
                  </div>
                  <Button size="sm">Apply Now</Button>
                </div>

                <h1 className="text-2xl font-bold">{job.title}</h1>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {job.employmentType.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary">{job.locationType}</Badge>
                  <Badge variant="outline">{job.salaryRange}</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">About the role</h3>
                <div className="text-sm text-muted-foreground">
                  {job.description}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  About {job.company.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {job.company.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {job.company.website && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Website</span>
                      <Link
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                  {job.company.location && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Location</span>
                      <span>{job.company.location}</span>
                    </div>
                  )}
                  {job.company.size && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">
                        Company Size
                      </span>
                      <span>{job.company.size}</span>
                    </div>
                  )}
                  {job.company.industry && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Industry</span>
                      <span>{job.company.industry}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}
