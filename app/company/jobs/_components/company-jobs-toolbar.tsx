"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  LayoutGrid,
  List,
  PlusCircle,
  Briefcase,
  CheckCircle2,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";

interface CompanyJobsToolbarProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export function CompanyJobsToolbar({
  viewMode,
  setViewMode,
}: CompanyJobsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset page on search
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "ALL";
  const currentType = searchParams.get("employmentType") || "ALL";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground text-sm">
            Manage your job postings and AI interviews.
          </p>
        </div>
        <Button
          onClick={() => {
            router.push("/company/jobs/new");
          }}
        >
          <PlusCircle />
          Post New Job
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
        <Field className="flex-1 w-full">
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
              defaultValue={currentSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Select
          value={currentStatus}
          onValueChange={(val) => handleFilterChange("status", val)}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentType}
          onValueChange={(val) => handleFilterChange("employmentType", val)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <div className="flex items-center gap-2">
              <Briefcase />
              <SelectValue placeholder="Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="FULL_TIME">Full Time</SelectItem>
            <SelectItem value="PART_TIME">Part Time</SelectItem>
            <SelectItem value="CONTRACT">Contract</SelectItem>
            <SelectItem value="INTERNSHIP">Internship</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-md bg-background">
          <Button
            variant="ghost"
            size="icon"
            className={`${
              viewMode === "grid" ? "bg-accent text-accent-foreground" : ""
            }`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid />
            <span className="sr-only">Grid View</span>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="icon"
            className={`${
              viewMode === "list" ? "bg-accent text-accent-foreground" : ""
            }`}
            onClick={() => setViewMode("list")}
          >
            <List />
            <span className="sr-only">List View</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
