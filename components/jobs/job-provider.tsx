"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

interface JobContextValue {
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
}

const JobContext = React.createContext<JobContextValue | undefined>(undefined);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(
    searchParams.get("jobId"),
  );

  // Sync state with URL manually (Shallow Routing)
  const setJob = (id: string | null) => {
    setSelectedJobId(id);
    const params = new URLSearchParams(window.location.search);
    if (id) {
      params.set("jobId", id);
    } else {
      params.delete("jobId");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, "", newUrl);
  };

  return (
    <JobContext.Provider value={{ selectedJobId, setSelectedJobId: setJob }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobContext() {
  const context = React.useContext(JobContext);
  if (!context) {
    throw new Error("useJobContext must be used within a JobProvider");
  }
  return context;
}
