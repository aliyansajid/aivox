"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { assistantSchema } from "@/schemas";

// Helper function to get authenticated company
async function getAuthenticatedCompany() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { company: true },
  });

  if (!user?.company) {
    throw new Error("Company not found");
  }

  return user.company;
}

// Vapi API configuration
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const VAPI_BASE_URL = "https://api.vapi.ai";

// Create assistant in Vapi
async function createVapiAssistant(data: z.infer<typeof assistantSchema>) {
  if (!VAPI_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not configured");
  }

  const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      model: {
        provider: data.provider,
        model: data.model,
        messages: [
          {
            role: "system",
            content: data.systemPrompt,
          },
        ],
      },
      voice: {
        provider: data.voiceProvider,
        voiceId: data.voice,
      },
      firstMessage: data.firstMessage,
      endCallMessage: data.endMessage || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Vapi assistant: ${error}`);
  }

  const result = await response.json();
  return result.id as string;
}

// Update assistant in Vapi
async function updateVapiAssistant(
  vapiAssistantId: string,
  data: z.infer<typeof assistantSchema>,
) {
  if (!VAPI_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not configured");
  }

  const response = await fetch(
    `${VAPI_BASE_URL}/assistant/${vapiAssistantId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        model: {
          provider: data.provider,
          model: data.model,
          messages: [
            {
              role: "system",
              content: data.systemPrompt,
            },
          ],
        },
        voice: {
          provider: data.voiceProvider,
          voiceId: data.voice,
        },
        firstMessage: data.firstMessage,
        endCallMessage: data.endMessage || undefined,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update Vapi assistant: ${error}`);
  }
}

// Delete assistant from Vapi
async function deleteVapiAssistant(vapiAssistantId: string) {
  if (!VAPI_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not configured");
  }

  const response = await fetch(
    `${VAPI_BASE_URL}/assistant/${vapiAssistantId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete Vapi assistant: ${error}`);
  }
}

// Create assistant
export async function createAssistant(data: z.infer<typeof assistantSchema>) {
  try {
    // Validate data
    const validatedData = assistantSchema.parse(data);

    // Get authenticated company
    const company = await getAuthenticatedCompany();

    // Create assistant in Vapi
    const vapiAssistantId = await createVapiAssistant(validatedData);

    // Create assistant in database
    const assistant = await prisma.assistant.create({
      data: {
        companyId: company.id,
        name: validatedData.name,
        vapiAssistantId,
        provider: validatedData.provider,
        model: validatedData.model,
        voiceProvider: validatedData.voiceProvider,
        voice: validatedData.voice,
        firstMessage: validatedData.firstMessage,
        systemPrompt: validatedData.systemPrompt,
        endMessage: validatedData.endMessage,
      },
    });

    revalidatePath("/company/assistants");

    return {
      success: true,
      message: "Assistant created successfully",
      data: assistant,
    };
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error("Create assistant error:", error);
    }

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data. Please check your inputs.",
      };
    }

    return {
      success: false,
      error: "Failed to create assistant. Please try again.",
    };
  }
}

// Update assistant
export async function updateAssistant(
  id: string,
  data: z.infer<typeof assistantSchema>,
) {
  try {
    // Validate data
    const validatedData = assistantSchema.parse(data);

    // Get authenticated company
    const company = await getAuthenticatedCompany();

    // Check if assistant exists and belongs to company
    const existingAssistant = await prisma.assistant.findFirst({
      where: {
        id,
        companyId: company.id,
      },
    });

    if (!existingAssistant) {
      return {
        success: false,
        error: "Assistant not found",
      };
    }

    // Update assistant in Vapi
    await updateVapiAssistant(existingAssistant.vapiAssistantId, validatedData);

    // Update assistant in database
    const assistant = await prisma.assistant.update({
      where: { id },
      data: {
        name: validatedData.name,
        provider: validatedData.provider,
        model: validatedData.model,
        voiceProvider: validatedData.voiceProvider,
        voice: validatedData.voice,
        firstMessage: validatedData.firstMessage,
        systemPrompt: validatedData.systemPrompt,
        endMessage: validatedData.endMessage,
      },
    });

    revalidatePath("/company/assistants");
    revalidatePath(`/company/assistants/${id}`);

    return {
      success: true,
      message: "Assistant updated successfully",
      data: assistant,
    };
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error("Update assistant error:", error);
    }

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data. Please check your inputs.",
      };
    }

    return {
      success: false,
      error: "Failed to update assistant. Please try again.",
    };
  }
}

// Delete assistant
export async function deleteAssistant(id: string) {
  try {
    // Get authenticated company
    const company = await getAuthenticatedCompany();

    // Check if assistant exists and belongs to company
    const existingAssistant = await prisma.assistant.findFirst({
      where: {
        id,
        companyId: company.id,
      },
    });

    if (!existingAssistant) {
      return {
        success: false,
        error: "Assistant not found",
      };
    }

    // Delete assistant from Vapi
    await deleteVapiAssistant(existingAssistant.vapiAssistantId);

    // Delete assistant from database
    await prisma.assistant.delete({
      where: { id },
    });

    revalidatePath("/company/assistants");

    return {
      success: true,
      message: "Assistant deleted successfully",
    };
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error("Delete assistant error:", error);
    }

    return {
      success: false,
      error: "Failed to delete assistant. Please try again.",
    };
  }
}

// Duplicate assistant
export async function duplicateAssistant(id: string) {
  try {
    // Get authenticated company
    const company = await getAuthenticatedCompany();

    // Check if assistant exists and belongs to company
    const existingAssistant = await prisma.assistant.findFirst({
      where: {
        id,
        companyId: company.id,
      },
    });

    if (!existingAssistant) {
      return {
        success: false,
        error: "Assistant not found",
      };
    }

    // Generate duplicate name with proper length validation
    let duplicateName = `${existingAssistant.name} (Copy)`;

    // Vapi has a 40 character limit for assistant names
    if (duplicateName.length > 40) {
      // Truncate the original name to fit within 40 chars including " (Copy)"
      const maxOriginalLength = 40 - 7; // 7 chars for " (Copy)"
      const truncatedName = existingAssistant.name.slice(0, maxOriginalLength);
      duplicateName = `${truncatedName} (Copy)`;
    }

    // Prepare data for duplication
    const duplicateData = {
      name: duplicateName,
      provider: existingAssistant.provider,
      model: existingAssistant.model,
      voiceProvider: existingAssistant.voiceProvider,
      voice: existingAssistant.voice,
      firstMessage: existingAssistant.firstMessage,
      systemPrompt: existingAssistant.systemPrompt,
      endMessage: existingAssistant.endMessage || "",
    };

    // Create assistant in Vapi
    const vapiAssistantId = await createVapiAssistant(duplicateData);

    // Create assistant in database
    const assistant = await prisma.assistant.create({
      data: {
        companyId: company.id,
        name: duplicateData.name,
        vapiAssistantId,
        provider: duplicateData.provider,
        model: duplicateData.model,
        voiceProvider: duplicateData.voiceProvider,
        voice: duplicateData.voice,
        firstMessage: duplicateData.firstMessage,
        systemPrompt: duplicateData.systemPrompt,
        endMessage: duplicateData.endMessage,
      },
    });

    revalidatePath("/company/assistants");

    return {
      success: true,
      message: "Assistant duplicated successfully",
      data: assistant,
    };
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error("Duplicate assistant error:", error);
    }

    return {
      success: false,
      error: "Failed to duplicate assistant. Please try again.",
    };
  }
}

// Get all assistants for authenticated company
export async function getAssistants() {
  try {
    // Get authenticated company
    const company = await getAuthenticatedCompany();

    // Get all assistants for this company
    const assistants = await prisma.assistant.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: assistants,
    };
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error("Get assistants error:", error);
    }

    return {
      success: false,
      error: "Failed to load assistants. Please try again.",
    };
  }
}

// Get single assistant by ID
export async function getAssistant(id: string) {
  try {
    // Get authenticated company
    const company = await getAuthenticatedCompany();

    // Get assistant
    const assistant = await prisma.assistant.findFirst({
      where: {
        id,
        companyId: company.id,
      },
    });

    if (!assistant) {
      return {
        success: false,
        error: "Assistant not found",
      };
    }

    return {
      success: true,
      data: assistant,
    };
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error("Get assistant error:", error);
    }

    return {
      success: false,
      error: "Failed to load assistant. Please try again.",
    };
  }
}
