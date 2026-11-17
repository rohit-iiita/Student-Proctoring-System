import { z } from "zod";
import {
  NOTIFICATION_TYPE_SCHEMA,
  CREATE_NOTIFICATION_SCHEMA,
} from "./schemas";

export type TNotificationType = z.infer<typeof NOTIFICATION_TYPE_SCHEMA>;

export type TCreateNotificationInput = z.infer<typeof CREATE_NOTIFICATION_SCHEMA>;

/** Shape returned by getNotificationsService — used in the notifications page */
export interface TNotification {
  id: string;
  title: string;
  message: string;
  notificationType: TNotificationType;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}
