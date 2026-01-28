import { getAssistants } from "@/app/actions/assistant-actions";
import { AssistantsClient } from "@/components/assistants/assistants-client";

export default async function AssistantsPage() {
  // Fetch assistants from database
  const result = await getAssistants();

  const assistants = result.success && result.data ? result.data : [];

  return (
    <div className="h-full overflow-hidden">
      <AssistantsClient initialAssistants={assistants} />
    </div>
  );
}
