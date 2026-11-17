import { z } from "zod";

export const CREATE_MEETING_SCHEMA = z
  .object({
    complaintId: z.string().uuid("A valid complaint is required."),
    title: z
      .string()
      .trim()
      .min(3, "Meeting title must be at least 3 characters.")
      .max(120, "Meeting title must be 120 characters or fewer."),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be 1000 characters or fewer.")
      .optional(),
    startsAt: z
      .string()
      .min(1, "Start time is required.")
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "Enter a valid start time."
      ),
    endsAt: z
      .string()
      .min(1, "End time is required.")
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "Enter a valid end time."
      ),
    location: z
      .string()
      .trim()
      .max(200, "Location must be 200 characters or fewer.")
      .optional(),
    meetingUrl: z
      .union([z.string().trim().url("Enter a valid meeting URL."), z.literal("")])
      .optional(),
  })
  .refine(
    (data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(),
    {
      message: "End time must be after the start time.",
      path: ["endsAt"],
    }
  )
  .refine(
    (data) => Boolean(data.location?.trim()) || Boolean(data.meetingUrl?.trim()),
    {
      message: "Provide a location or a meeting link.",
      path: ["meetingUrl"],
    }
  );

export type TCreateMeetingInput = z.infer<typeof CREATE_MEETING_SCHEMA>;
