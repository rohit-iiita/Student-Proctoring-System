"use server";

import { LOGIN_SCHEMA, SIGNUP_SCHEMA } from "./schemas";
import {
  getCurrentUserService,
  loginUserService,
  logoutUserService,
  signupUserService,
} from "./services";

export async function loginAction(input: { email: string; password: string }) {
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

export async function signupAction(input: unknown) {
  const validation = SIGNUP_SCHEMA.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Please enter valid registration details",
    };
  }

  try {
    const data = await signupUserService(validation.data);

    return {
      success: true,
      message: data.session
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
