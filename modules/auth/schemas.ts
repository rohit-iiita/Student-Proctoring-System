import { z } from "zod";

export const USER_ROLE_SCHEMA = z.enum(["student", "faculty", "admin"]);

export const LOGIN_SCHEMA = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SIGNUP_SCHEMA = z.object({
  fullName: z.string().min(2, "Name must contain at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "faculty"]).default("student"),
  idNumber: z.string().optional(),
});

export const USER_SCHEMA = z.object({
  userId: z.string(),
  email: z.string().nullable().optional(),
  fullName: z.string(),
  avatarUrl: z.string().nullable().optional(),
  role: USER_ROLE_SCHEMA,
  idNumber: z.string().nullable().optional(),
});
