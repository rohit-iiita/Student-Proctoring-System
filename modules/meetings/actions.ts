"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserService } from "../auth/services";
import { CREATE_MEETING_SCHEMA } from "./schemas";
import { createComplaintMeetingService, getMyMeetingsService } from "./services";
import type { TMeetingListItem } from "./types";

// ─── GET: Meetings for the signed-in user ────────────────────────────────────

export const getMyMeetingsAction = async (): Promise<{
  success: boolean;
  data?: TMeetingListItem[];
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    const data = await getMyMeetingsService({
      userId: currentUser.userId,
      role: currentUser.role,
    });

    return { success: true, data };
  } catch (error) {
    console.error("getMyMeetingsAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load meetings.",
    };
  }
};

export const createComplaintMeetingAction = async (input: {
  complaintId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  meetingUrl?: string;
}): Promise<{ success: boolean; message?: string; data?: { meetingId: string } }> => {
  try {
    const currentUser = await getCurrentUserService();

    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    if (currentUser.role !== "admin") {
      return { success: false, message: "Only admins can schedule meetings." };
    }

    const validation = CREATE_MEETING_SCHEMA.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        message:
          validation.error.issues[0]?.message || "Invalid meeting details.",
      };
    }

    const result = await createComplaintMeetingService({
      adminId: currentUser.userId,
      input: validation.data,
    });

    revalidatePath("/complaints");
    revalidatePath(`/complaints/${validation.data.complaintId}`);
    revalidatePath("/meetings");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Meeting scheduled. ${result.recipientCount} participant(s) notified.`,
      data: { meetingId: result.meetingId },
    };
  } catch (error) {
    console.error("createComplaintMeetingAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to schedule the meeting. Please try again.",
    };
  }
};
