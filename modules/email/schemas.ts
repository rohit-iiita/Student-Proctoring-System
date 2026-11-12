import { z } from "zod";

export const WELCOME_USER_EMAIL_SCHEMA = z.object({
  email: z.email("Enter a valid email"),
  name: z.string().min(1, "Name cannot be empty"),
});

export const COMPLAINT_REGISTRATION_EMAIL_SCHEMA = z.object({
  name: z.string().min(1, "Name connot be empty"),
  email: z.string(),
  complaintId: z.string(),
  subject: z.string(),
  category: z.string(),
  submittedAt: z.string(),
});

export const COMPLAINT_MEETING_EMAIL_SCHEMA = z.object({
  email: z.email(),
  name: z.string().min(1),
  complaintId: z.string().min(1),
  meetingTitle: z.string().min(1),
  startTime: z.date(),
  endTime: z.date(),
  location: z.string().min(1),
  complaintCategory: z.string().min(1),
  meeting_url: z.string().url().nullable(),
  recipientRole: z.enum(["favour", "against", "admin"]),
});
