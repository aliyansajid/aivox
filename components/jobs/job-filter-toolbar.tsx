"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  MapPin,
  Briefcase,
  DollarSign,
  SearchIcon,
} from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Field } from "../ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "../ui/input-group";

interface JobFilterToolbarProps {
  locations?: string[]; // Or complex object
}

export function JobFilterToolbar({ locations = [] }: JobFilterToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for advanced filters visibility
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Search Handler
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    // Reset page if needed? Current implementation doesn't have pagination params yet usually.
    router.replace(`?${params.toString()}`);
  }, 300);

  // Filter Handler for Single Selects
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`);
  };

  const currentType = searchParams.get("type") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentSearch = searchParams.get("q") || "";
  const currentSalary = searchParams.get("salary") || "";

  const salaryRanges = [
    { label: "$0 - $50k", value: "0-50k" },
    { label: "$50k - $100k", value: "50k-100k" },
    { label: "$100k - $150k", value: "100k-150k" },
    { label: "$150k - $200k", value: "150k-200k" },
    { label: "$200k+", value: "200k+" },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
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
            value={currentType}
            onValueChange={(val) => handleFilterChange("type", val)}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Briefcase className="size-4" />
                <SelectValue placeholder="Role Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={currentLocation}
            onValueChange={(val) => handleFilterChange("location", val)}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <SelectValue placeholder="Location" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {formatEnum(loc)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentSalary}
            onValueChange={(val) => handleFilterChange("salary", val)}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <DollarSign className="size-4" />
                <SelectValue placeholder="Salary" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Salary</SelectItem>
              {salaryRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className={`${showAdvanced ? "bg-accent border-accent" : "bg-background"}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatEnum(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
