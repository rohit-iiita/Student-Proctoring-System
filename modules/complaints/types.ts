import { z } from "zod";
import { COMPLAINT_SCHEMA } from "./schemas";

export type TComplaintMeetingRecipientRole = "favour" | "against" | "admin";

export type TComplaintCategory =
  | "ragging_and_harassment"
  | "ta"
  | "hostel"
  | "mess_and_food"
  | "discrimination_and_misconduct";

export type TComplaintStatus =
  "submitted" | "under_review" | "resolved" | "rejected";

export type TComplaint = z.infer<typeof COMPLAINT_SCHEMA>;
