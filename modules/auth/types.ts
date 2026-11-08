import { z } from "zod";
import { LOGIN_SCHEMA, SIGNUP_SCHEMA, USER_SCHEMA } from "./schemas";

export type TLoginInput = z.infer<typeof LOGIN_SCHEMA>;
export type TSignupInput = z.infer<typeof SIGNUP_SCHEMA>;
export type TUser = z.infer<typeof USER_SCHEMA>;
