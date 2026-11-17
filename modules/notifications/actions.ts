"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserService } from "../auth/services";
import {
  getNotificationsService,
  getUnreadNotificationCountService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
} from "./services";
import { NOTIFICATION_ID_SCHEMA } from "./schemas";
import type { TNotification } from "./types";

// ─── GET: Notifications list for the signed-in user ──────────────────────────

export const getNotificationsAction = async (): Promise<{
  success: boolean;
  data?: TNotification[];
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    const data = await getNotificationsService({ userId: currentUser.userId });
    return { success: true, data };
  } catch (error) {
    console.error("getNotificationsAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load notifications.",
    };
  }
};

// ─── GET: Unread count for the signed-in user ────────────────────────────────

export const getUnreadNotificationCountAction = async (): Promise<{
  success: boolean;
  data?: number;
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    const data = await getUnreadNotificationCountService({
      userId: currentUser.userId,
    });
    return { success: true, data };
  } catch (error) {
    console.error("getUnreadNotificationCountAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load unread count.",
    };
  }
};

// ─── UPDATE: Mark one notification as read ───────────────────────────────────

export const markNotificationAsReadAction = async ({
  notificationId,
}: {
  notificationId: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    const parsed = NOTIFICATION_ID_SCHEMA.safeParse(notificationId);
    if (!parsed.success) {
      return { success: false, message: "Invalid notification id." };
    }

    await markNotificationAsReadService({
      notificationId: parsed.data,
      userId: currentUser.userId,
    });

    revalidatePath("/notifications");
    revalidatePath("/dashboard");

    return { success: true, message: "Notification marked as read." };
  } catch (error) {
    console.error("markNotificationAsReadAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read.",
    };
  }
};

// ─── UPDATE: Mark all notifications as read ──────────────────────────────────

export const markAllNotificationsAsReadAction = async (): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    await markAllNotificationsAsReadService({ userId: currentUser.userId });

    revalidatePath("/notifications");
    revalidatePath("/dashboard");

    return { success: true, message: "All notifications marked as read." };
  } catch (error) {
    console.error("markAllNotificationsAsReadAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as read.",
    };
  }
};
