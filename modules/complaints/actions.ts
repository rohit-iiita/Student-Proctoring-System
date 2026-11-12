"use server";

import { getCurrentUserService } from "../auth/services";
import { createComplaintService } from "./services";

import type { TComplaint } from "./types";

export const createComplaintAction = async ({
  studentId,
  category,
  description,
  subject,
}: TComplaint) => {
  const currentUser = await getCurrentUserService();

  if (!currentUser) {
    return { success: false, message: "NO USER found to perform this action" };
  }

  await createComplaintService({
    studentId,
    subject,
    description,
    category,
  });
};
