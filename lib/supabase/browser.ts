import "client-only";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey,
  );
}
