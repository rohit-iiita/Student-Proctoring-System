import "server-only";

import { createSupabaseClient } from "@/lib/supabase/server";
import type { TLoginInput, TSignupInput, TUser, TUserRole } from "./types";

// LOGIN
export async function loginUserService(input: TLoginInput) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) throw error;

  return data.user;
}

// SIGNUP
export async function signupUserService(input: TSignupInput) {
  const supabase = await createSupabaseClient();
  const role: TUserRole = input.role || "student";

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        role: role,
        id_number: input.idNumber,
      },
    },
  });

  if (error) {
    console.log("ERROR", error.message);
    throw error;
  }

  // The DB trigger `handle_new_auth_user` now handles inserting into
  // public.profiles and public.students / public.faculty automatically
  // based on the metadata passed above.

  return data;
}

// LOGOUT
export async function logoutUserService() {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

// GET CURRENT USER
export async function getCurrentUserService(): Promise<TUser | null> {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Fetch additional profile information
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const role: TUserRole = (profile?.role ||
      user.user_metadata?.role ||
      "student") as TUserRole;
    let idNumber: string | null = user.user_metadata?.id_number || null;

    // Optionally fetch idNumber from role table if not in metadata
    if (!idNumber) {
      if (role === "student") {
        const { data: studentRecord } = await supabase
          .from("students")
          .select("enrollment_no")
          .eq("id", user.id)
          .maybeSingle();
        idNumber = studentRecord?.enrollment_no ?? null;
      } else if (role === "faculty") {
        const { data: facultyRecord } = await supabase
          .from("faculty")
          .select("employee_id")
          .eq("id", user.id)
          .maybeSingle();
        idNumber = facultyRecord?.employee_id ?? null;
      }
    }

    return {
      userId: user.id,
      email: user.email ?? profile?.email ?? "",
      fullName: profile?.full_name || user.user_metadata?.full_name || "User",
      avatarUrl: profile?.avatar_url ?? null,
      role,
      idNumber,
    };
  } catch (error) {
    console.error("Error in getCurrentUserService:", error);
    return null;
  }
}
