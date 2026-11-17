import "server-only";

import { createSupabaseClient } from "@/lib/supabase/server";
import type { TNotification } from "./types";

/**
 * Insert a single notification for one user.
 * Called from other modules' server-side flows (e.g. complaint creation).
 */
export const createNotificationService = async ({
  userId,
  title,
  message,
  notificationType = "system",
  metadata = {},
}: {
  userId: string;
  title: string;
  message: string;
  notificationType?: "complaint" | "meeting" | "exam" | "system";
  metadata?: Record<string, unknown>;
}): Promise<void> => {
  const supabase = await createSupabaseClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    notification_type: notificationType,
    metadata,
  });

  if (error) throw error;
};

/**
 * List the current user's notifications, newest first.
 */
export const getNotificationsService = async ({
  userId,
}: {
  userId: string;
}): Promise<TNotification[]> => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, title, message, notification_type, metadata, read_at, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getNotificationsService error:", error);
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    message: row.message as string,
    notificationType: (row.notification_type ?? "system") as TNotification["notificationType"],
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    readAt: (row.read_at as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
};

/**
 * Count the current user's unread notifications (read_at IS NULL).
 * Uses the partial index idx_notifications_unread.
 */
export const getUnreadNotificationCountService = async ({
  userId,
}: {
  userId: string;
}): Promise<number> => {
  const supabase = await createSupabaseClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("getUnreadNotificationCountService error:", error);
    throw error;
  }

  return count ?? 0;
};

/**
 * Mark a single notification as read (sets read_at) if it belongs to the caller.
 */
export const markNotificationAsReadService = async ({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}): Promise<void> => {
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("markNotificationAsReadService error:", error);
    throw error;
  }
};

/**
 * Mark every unread notification of the caller as read.
 */
export const markAllNotificationsAsReadService = async ({
  userId,
}: {
  userId: string;
}): Promise<void> => {
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("markAllNotificationsAsReadService error:", error);
    throw error;
  }
};
