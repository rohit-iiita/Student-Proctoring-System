import { Resend } from "resend";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const RESEND_API_KEY = process.env.NEXT_RESENT_API_KEY;

export const resendClient = new Resend(RESEND_API_KEY);
