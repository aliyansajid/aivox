import { getAssistants } from "@/app/actions/assistant-actions";
import { AssistantsClient } from "@/components/assistants/assistants-client";
import { redirect } from "next/navigation";

// This page needs to be dynamic because it requires authentication
export const dynamic = "force-dynamic";

export default async function AssistantsPage() {
  // Fetch assistants from database
  const result = await getAssistants();

  // If there's an error (like unauthorized), handle it
  if (!result.success) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch assistants:", result.error);
    }
    // If unauthorized, redirect to login
    if (result.error?.includes("Unauthorized")) {
      redirect("/login");
    }
    // Otherwise, pass empty array
  }

  const assistants = result.success && result.data ? result.data : [];

  return (
    <div className="h-full overflow-hidden">
      <AssistantsClient initialAssistants={assistants} />
    </div>
  );
}
