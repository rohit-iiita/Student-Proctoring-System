import "server-only";

import { createSupabaseClient } from "@/lib/supabase/server";
import type { TUpdateProfileInput } from "./schemas";

// UPDATE CURRENT USER'S PROFILE (name)
export async function updateProfileService(input: TUpdateProfileInput) {
  const supabase = await createSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // 1. Update the profile row (RLS: profiles_update_own, column grant full_name)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName })
    .eq("id", user.id);

  if (profileError) {
    console.error("updateProfileService profile error:", profileError);
    throw new Error("Failed to update profile. Please try again.");
  }

  // 2. Keep auth metadata in sync so JWT claims / proxy role checks stay correct
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name: input.fullName },
  });

  if (metadataError) {
    console.error("updateProfileService metadata error:", metadataError);
    throw new Error("Failed to update account details. Please try again.");
  }

  // 3. Optionally change password (requires current password verification)
  if (input.newPassword) {
    // Re-authenticate to verify the current password before changing it
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email ?? "",
      password: input.currentPassword ?? "",
    });

    if (reauthError) {
      console.error("updateProfileService reauth error:", reauthError);
      throw new Error("Current password is incorrect.");
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: input.newPassword,
    });

    if (passwordError) {
      console.error("updateProfileService password error:", passwordError);
      throw new Error("Failed to change password. Please try again.");
    }
  }

  return { userId: user.id, fullName: input.fullName };
}
