import { z } from "zod";

export const COMPLAINT_CATEGORY_SCHEMA = z.enum([
  "ragging_and_harassment",
  "ta",
  "hostel",
  "mess_and_food",
  "discrimination_and_misconduct",
]);

/** Dropdown options for complaint category pickers, derived from the DB enum */
export const COMPLAINT_CATEGORY_OPTIONS: Array<{
  value: TComplaintCategoryValue;
  label: string;
}> = [
  { value: "ragging_and_harassment", label: "Ragging and Harassment" },
  { value: "ta", label: "TA" },
  { value: "hostel", label: "Hostel" },
  { value: "mess_and_food", label: "Mess and Food" },
  { value: "discrimination_and_misconduct", label: "Discrimination and Misconduct" },
];

export type TComplaintCategoryValue = (typeof COMPLAINT_CATEGORY_SCHEMA)["options"][number];

export const COMPLAINT_SCHEMA = z.object({
  studentId: z.string(),
  category: COMPLAINT_CATEGORY_SCHEMA,
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  status: z
    .enum(["submitted", "under_review", "resolved", "rejected"])
    .nullable()
    .optional(),
  resolution: z.string().nullable().optional(),
});

export const CREATE_COMPLAINT_SCHEMA = z.object({
  category: COMPLAINT_CATEGORY_SCHEMA,
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  respondents: z.string().optional(),
});
