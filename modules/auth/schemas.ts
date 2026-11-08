import { z } from "zod";

export const LOGIN_SCHEMA = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SIGNUP_SCHEMA = z.object({
  fullName: z.string().min(2, "Name must contain at least 2 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const USER_SCHEMA = z.object({
  userId: z.string(),
  email: z.string(),
  fullName: z.string(),
  avatarUrl: z.string(),
});
