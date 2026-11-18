import { z } from "zod";

export const UPDATE_PROFILE_SCHEMA = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .max(80, "Full name must be at most 80 characters"),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "New password must contain at least one letter")
      .regex(/[0-9]/, "New password must contain at least one number")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  )
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Current password is required to change your password",
    path: ["currentPassword"],
  });

export type TUpdateProfileInput = z.infer<typeof UPDATE_PROFILE_SCHEMA>;
