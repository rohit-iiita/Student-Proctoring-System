import "server-only";

import { supabaseClient } from "@/lib/supabase";
import type { TLoginInput, TSignupInput } from "./types";

// LOGIN
export async function loginUserService(input: TLoginInput) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) throw error;

  return data.user;
}

// SIGNUP
export async function signupUserService(input: TSignupInput) {
  const { data, error } = await supabaseClient.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
      },
    },
  });

  if (error) throw error;

  return data;
}

// LOGOUT
export async function logoutUserService() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) throw error;
}

// GET CURRENT USER
export async function getCurrentUserService() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error) throw error;

  if (!user) return null;

  // Fetch additional profile information
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError) throw profileError;

  return {
    userId: user.id,
    email: user.email,
    fullName: user.user_metadata.full_name,
    avatarUrl: profile.role,
    role: profile.role,
  };
}
