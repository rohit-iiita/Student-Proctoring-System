"use server";

import { sendWelcomeUserEmailAction } from "../email/actions";
import { LOGIN_SCHEMA, SIGNUP_SCHEMA } from "./schemas";
import {
  getCurrentUserService,
  loginUserService,
  logoutUserService,
  signupUserService,
} from "./services";
import type { TLoginInput, TSignupInput } from "./types";

export async function loginAction(input: TLoginInput) {
  const currentUser = await getCurrentUserService();

  if (currentUser) {
    return { success: false, message: "Currently user logged in" };
  }

  const validation = LOGIN_SCHEMA.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid email or password format",
    };
  }

  try {
    await loginUserService(validation.data);
    const user = await getCurrentUserService();

    return {
      success: true,
      message: "Login successful",
      role: user?.role || "student",
    };
  } catch (error: any) {
    console.error("Login error:", error);

    const errorMessage =
      error?.message?.includes("Invalid login credentials")
        ? "Invalid email or password"
        : error?.message || "Invalid email or password";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function signupAction(input: TSignupInput) {
  const validation = SIGNUP_SCHEMA.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Please enter valid registration details",
    };
  }

  try {
    const userData = await signupUserService(validation.data);

    try {
      await sendWelcomeUserEmailAction({
        email: validation.data.email,
        name: validation.data.fullName,
      });
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }

    return {
      success: true,
      message: userData.session
        ? "Account created successfully"
        : "Account created successfully. You can now sign in.",
      role: validation.data.role,
    };
  } catch (error: any) {
    console.error("Signup error:", error);

    const errorMessage =
      error?.message?.includes("User already registered")
        ? "This email is already registered."
        : error?.message || "Unable to create account. Please try again.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function logoutAction() {
  try {
    await logoutUserService();

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error:", error);

    return {
      success: false,
      message: "Unable to log out",
    };
  }
}

export async function getCurrentUserAction() {
  try {
    const user = await getCurrentUserService();

    if (!user) {
      return {
        success: false,
        data: null,
        message: "No authenticated user",
      };
    }

    return {
      success: true,
      data: user,
      message: "Fetched user's information successfully",
    };
  } catch (error) {
    console.error("Get current user error:", error);

    return {
      success: false,
      data: null,
      message: "Unable to fetch user information",
    };
  }
}
