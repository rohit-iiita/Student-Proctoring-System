"use server";

import { revalidatePath } from "next/cache";
import { UPDATE_PROFILE_SCHEMA } from "./schemas";
import { updateProfileService } from "./services";
import type { TUpdateProfileInput } from "./types";

export async function updateProfileAction(input: TUpdateProfileInput): Promise<{
  success: boolean;
  message: string;
}> {
  const validation = UPDATE_PROFILE_SCHEMA.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid profile details",
    };
  }

  try {
    await updateProfileService(validation.data);

    // Immediately reflect the new name everywhere the user is rendered
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/complaints");
    revalidatePath("/meetings");
    revalidatePath("/notifications");

    return {
      success: true,
      message: "Profile updated successfully!",
    };
  } catch (error) {
    console.error("updateProfileAction error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update profile. Please try again.",
    };
  }
}
