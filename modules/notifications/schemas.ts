import { z } from "zod";

export const NOTIFICATION_TYPE_SCHEMA = z.enum([
  "complaint",
  "meeting",
  "exam",
  "system",
]);

export const CREATE_NOTIFICATION_SCHEMA = z.object({
  userId: z.string().uuid("A valid user id is required."),
  title: z
    .string()
    .trim()
    .min(1, "Notification title is required.")
    .max(120, "Notification title must be 120 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(1, "Notification message is required.")
    .max(500, "Notification message must be 500 characters or fewer."),
  notificationType: NOTIFICATION_TYPE_SCHEMA.default("system"),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const NOTIFICATION_ID_SCHEMA = z
  .string()
  .uuid("A valid notification id is required.");

export type TCreateNotificationInput = z.infer<typeof CREATE_NOTIFICATION_SCHEMA>;
