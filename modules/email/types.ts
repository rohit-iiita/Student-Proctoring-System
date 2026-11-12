import { z } from "zod";
import {
  COMPLAINT_REGISTRATION_EMAIL_SCHEMA,
  WELCOME_USER_EMAIL_SCHEMA,
} from "./schemas";

import type {
  TComplaintCategory,
  TComplaintMeetingRecipientRole,
} from "../complaints/types";

export type TComplaintRegistrationEmail = z.infer<
  typeof COMPLAINT_REGISTRATION_EMAIL_SCHEMA
>;
export type TWelcomeUser = z.infer<typeof WELCOME_USER_EMAIL_SCHEMA>;

export type TEmailJob =
  | {
      type: "welcome_user";
      data: {
        email: string;
        name: string;
      };
    }
  | {
      type: "complaint_registered";
      data: {
        email: string;
        name: string;
        complaintId: string;
        category: string;
        subject: string;
        submittedAt: string;
      };
    }
  | {
      type: "complaint_meeting_created";
      data: {
        email: string;
        name: string;
        complaintId: string;
        meetingTitle: string;
        startTime: string;
        endTime: string;
        location: string;
        complaintCategory: TComplaintCategory;
        meeting_url: string | null;
        recipientRole: TComplaintMeetingRecipientRole;
      };
    };
