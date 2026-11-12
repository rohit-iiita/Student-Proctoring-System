import "server-only";

import { createClient } from "@supabase/supabase-js";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const createSupabaseAdminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
