import { createSupabaseClient } from "./server";
import { createSupabaseAdminClient } from "./admin";

export const supabaseClient = await createSupabaseClient();
export const supabaseAdminClient = createSupabaseAdminClient;
