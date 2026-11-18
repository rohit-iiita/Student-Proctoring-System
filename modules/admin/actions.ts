"use server";

import { getCurrentUserService } from "@/modules/auth/services";
import { getStudentsService, getFacultyService } from "./services";
import type { TAdminStudentListItem, TAdminFacultyListItem } from "./types";

export const getStudentsAction = async (): Promise<{
  success: boolean;
  data?: TAdminStudentListItem[];
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }
    if (currentUser.role !== "admin") {
      return {
        success: false,
        message: "Only admins can view the student list.",
      };
    }

    const data = await getStudentsService();
    return { success: true, data };
  } catch (error) {
    console.error("getStudentsAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load students.",
    };
  }
};

export const getFacultyAction = async (): Promise<{
  success: boolean;
  data?: TAdminFacultyListItem[];
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }
    if (currentUser.role !== "admin") {
      return {
        success: false,
        message: "Only admins can view the faculty list.",
      };
    }

    const data = await getFacultyService();
    return { success: true, data };
  } catch (error) {
    console.error("getFacultyAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load faculty.",
    };
  }
};
