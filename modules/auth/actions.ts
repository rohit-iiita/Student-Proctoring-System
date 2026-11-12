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
      message: "Invalid email or password format",
    };
  }

  try {
    await loginUserService(validation.data);

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      message: "Invalid email or password",
    };
  }
}

export async function signupAction(input: TSignupInput) {
  const currentUser = await getCurrentUserService();

  if (currentUser) {
    return { success: false, message: "Currently user logged in" };
  }

  const validation = SIGNUP_SCHEMA.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Please enter valid registration details",
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
        : "Account created. Please verify your email.",
    };
  } catch (error) {
    console.error("Signup error:", error);

    return {
      success: false,
      message: "Unable to create account. Please try again.",
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

    return {
      success: true,
      data: {
        ...user,
      },
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
