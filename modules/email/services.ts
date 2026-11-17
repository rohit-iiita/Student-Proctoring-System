import "server-only";

import { createElement } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { resendClient } from "@/lib/resend";

import WelcomeEmail from "./templates/welcome-user";
import SuccessfulComplaintRegisteredEmail from "./templates/successful-complaint-registration";
import ComplaintMeetingCreationEmail from "./templates/complaint-meeting-creation";

import type {
  TComplaintCategory,
  TComplaintMeetingRecipientRole,
} from "../complaints/types";

export const welcomeUserEmailService = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  const resend = resendClient;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to:
      process.env.NODE_ENV === "production"
        ? email
        : process.env.EMAIL_TEST_RECIPIENT!,
    subject: "Successfull Signup",
    react: createElement(WelcomeEmail, {
      email,
      name,
    }),
  });

  if (error) throw error;
};

export const successfullComplaintRegistrationEmailService = async ({
  email,
  name,
  complaintId,
  category,
  subject,
  submittedAt,
}: {
  name: string;
  email: string;
  complaintId: string;
  subject: string;
  category: string;
  submittedAt: string;
}) => {
  const resend = resendClient;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to:
      process.env.NODE_ENV === "production"
        ? email
        : process.env.EMAIL_TEST_RECIPIENT!,
    subject: `Complaint Registered - ${complaintId}`,
    react: createElement(SuccessfulComplaintRegisteredEmail, {
      name,
      email,
      complaintId,
      category,
      subject,
      submittedAt,
    }),
  });

  if (error) throw error;
};

export const complaintMeetingCreationEmailService = async ({
  name,
  email,
  complaintId,
  meetingTitle,
  startTime,
  endTime,
  location,
  complaintCategory,
  meeting_url,
  recipientRole,
}: {
  email: string;
  name: string;
  complaintId: string;
  meetingTitle: string;
  startTime: Date;
  endTime: Date;
  location: string;
  complaintCategory: TComplaintCategory;
  meeting_url: string | null;
  recipientRole: TComplaintMeetingRecipientRole;
}) => {
  const resend = resendClient;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to:
      process.env.NODE_ENV === "production"
        ? email
        : process.env.EMAIL_TEST_RECIPIENT!,
    subject: `Meeting Scheduled - ${complaintId}`,
    react: createElement(ComplaintMeetingCreationEmail, {
      name,
      complaintId,
      meetingTitle,
      startTime: formatInTimeZone(startTime, "Asia/Kolkata", "hh:mm a"),
      endTime: formatInTimeZone(endTime, "Asia/Kolkata", "hh:mm a"),
      location,
      complaintCategory,
      meeting_url,
      recipientRole,
    }),
  });

  if (error) throw error;
};
