import { z } from "zod";

export const COMPLAINT_SCHEMA = z.object({
  studentId: z.string(),
  category: z.enum([
    "ragging_and_harassment",
    "ta",
    "hostel",
    "mess_and_food",
    "discrimination_and_misconduct",
  ]),
  subject: z.string(),
  description: z.string(),
  status: z
    .enum(["submitted", "under_review", "resolved", "rejected"])
    .nullable(),
  resolution: z.string().nullable(),
});

