"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "../ui/input-group";
import { FieldLabel } from "../ui/field";

export function JobFilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.replace(`?${params.toString()}`);
  }, 300);

  const handleFilterChange = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    const text = params.get(key);
    let current = text ? text.split(",") : [];

    if (checked) {
      if (!current.includes(value)) current.push(value);
    } else {
      current = current.filter((item) => item !== value);
    }

    if (current.length > 0) {
      params.set(key, current.join(","));
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`);
  };

  const getChecked = (key: string, value: string) => {
    const text = searchParams.get(key);
    if (!text) return false;
    return text.split(",").includes(value);
  };

  const clearFilters = () => {
    router.replace("/applicant/jobs");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Refine your job search</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Search</Label>
          <InputGroup>
            <InputGroupInput
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.get("q")?.toString()}
              placeholder="Search..."
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Employment Type</Label>
          {[
            { label: "Full Time", value: "FULL_TIME" },
            { label: "Part Time", value: "PART_TIME" },
            { label: "Contract", value: "CONTRACT" },
            { label: "Internship", value: "INTERNSHIP" },
          ].map((type) => (
            <div key={type.value} className="flex items-center gap-2">
              <Checkbox
                id={`type-${type.value}`}
                checked={getChecked("type", type.value)}
                onCheckedChange={(checked) =>
                  handleFilterChange("type", type.value, checked as boolean)
                }
              />
              <FieldLabel htmlFor={`type-${type.value}`}>
                {type.label}
              </FieldLabel>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Location</Label>
          {[
            { label: "Remote", value: "REMOTE" },
            { label: "On-site", value: "ONSITE" },
            { label: "Hybrid", value: "HYBRID" },
          ].map((item) => (
            <div key={item.value} className="flex items-center gap-2">
              <Checkbox
                id={`loc-${item.value}`}
                checked={getChecked("location", item.value)}
                onCheckedChange={(checked) =>
                  handleFilterChange("location", item.value, checked as boolean)
                }
              />
              <FieldLabel htmlFor={`loc-${item.value}`}>
                {item.label}
              </FieldLabel>
            </div>
          ))}
        </div>

        <Separator />

        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
          disabled={searchParams.toString().length === 0}
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}
