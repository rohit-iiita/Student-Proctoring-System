import { z } from "zod";
import {
  COMPLAINT_SCHEMA,
  COMPLAINT_CATEGORY_SCHEMA,
  CREATE_COMPLAINT_SCHEMA,
} from "./schemas";

export type TComplaintMeetingRecipientRole = "favour" | "against" | "admin";

export type TComplaintCategory = z.infer<typeof COMPLAINT_CATEGORY_SCHEMA>;

export type TComplaintStatus =
  | "submitted"
  | "under_review"
  | "resolved"
  | "rejected";

export type TComplaint = z.infer<typeof COMPLAINT_SCHEMA>;
export type TCreateComplaintInput = z.infer<typeof CREATE_COMPLAINT_SCHEMA>;

/** Shape returned by getComplaintsService — used in the list page */
export interface TComplaintListItem {
  id: string;
  referenceId: string;
  category: TComplaintCategory;
  subject: string;
  status: TComplaintStatus;
  createdAt: string;
  studentName: string | null;
  assignedFacultyName: string | null;
}

/** Shape returned by getComplaintByIdService — used in the detail page */
export interface TComplaintDetail extends TComplaintListItem {
  description: string;
  resolution: string | null;
  resolvedAt: string | null;
  attachments: Array<{
    id: string;
    filePath: string;
    fileType: string;
    fileSize: number;
  }>;
}

/** Faculty option for the admin assignment dropdown */
export interface TFacultyOption {
  id: string;
  fullName: string;
}
