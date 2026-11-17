import { createSupabaseClient } from "./server";
import { createSupabaseAdminClient } from "./admin";

export { createSupabaseClient, createSupabaseAdminClient };
export const getSupabaseClient = createSupabaseClient;
export const supabaseAdminClient = createSupabaseAdminClient;
