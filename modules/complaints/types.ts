import { z } from "zod";
import {
  COMPLAINT_SCHEMA,
  COMPLAINT_CATEGORY_SCHEMA,
  CREATE_COMPLAINT_SCHEMA,
  STUDENT_OPTION_SCHEMA,
} from "./schemas";

export type TComplaintMeetingRecipientRole = "favour" | "against" | "faculty" | "admin";

export type TComplaintCategory = z.infer<typeof COMPLAINT_CATEGORY_SCHEMA>;

export type TComplaintStatus =
  | "submitted"
  | "under_review"
  | "resolved"
  | "rejected";

export type TComplaint = z.infer<typeof COMPLAINT_SCHEMA>;
export type TCreateComplaintInput = z.infer<typeof CREATE_COMPLAINT_SCHEMA>;
export type TStudentOption = z.infer<typeof STUDENT_OPTION_SCHEMA>;

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
  /** Students against whom this complaint was filed (name + enrollment no.) */
  respondents: TStudentOption[];
  attachments: Array<{
    id: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  }>;
}

/** Faculty option for the admin assignment dropdown */
export interface TFacultyOption {
  id: string;
  fullName: string;
}

/** Admin authority block captured in the resolve-signature dialog (client-only) */
export interface TResolveAuthority {
  name: string;
  email: string;
  role: "admin";
}

/** Input required to generate a complaint resolution certificate PDF */
export interface TResolutionCertificateData {
  referenceId: string;
  category: TComplaintCategory;
  subject: string;
  description: string;
  status: TComplaintStatus;
  studentName: string | null;
  assignedFacultyName: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolution: string;
  authority: TResolveAuthority;
  signatureDataUrl: string;
}

/** Signed resolution certificate stored in the resolution-certificates bucket */
export interface TResolutionCertificate {
  fileName: string;
  url: string;
}
