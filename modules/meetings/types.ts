import { z } from "zod";
import { CREATE_MEETING_SCHEMA } from "./schemas";
import type { TComplaintMeetingRecipientRole } from "../complaints/types";

export type TCreateMeetingInput = z.infer<typeof CREATE_MEETING_SCHEMA>;

export type TMeetingStatus = "scheduled" | "cancelled" | "completed";

export type TMeetingInvitationStatus = "invited" | "accepted" | "declined";

/** Participants to insert for a newly created complaint meeting */
export interface TMeetingRecipient {
  userId: string;
  email: string;
  fullName: string;
  recipientRole: TComplaintMeetingRecipientRole;
}

/** Shape returned by getMyMeetingsService — used in the meetings page */
export interface TMeetingListItem {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  meetingUrl: string | null;
  location: string | null;
  status: TMeetingStatus;
  createdAt: string;
  complaintId: string | null;
  complaintReferenceId: string | null;
  complaintSubject: string | null;
  createdByName: string | null;
  invitationStatus: TMeetingInvitationStatus | null;
  respondedAt: string | null;
}
