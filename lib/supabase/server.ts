import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Cookie updates may not be allowed in Server Components.
            // Session refresh is handled by the middleware/proxy.
          }
        },
      },
    },
  );
}
