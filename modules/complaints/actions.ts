"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserService } from "../auth/services";
import {
  createComplaintService,
  getComplaintsService,
  getComplaintByReferenceIdService,
  getFacultyListService,
  getStudentOptionsService,
  assignComplaintService,
  updateComplaintService,
  getResolutionCertificateService,
  type AttachmentUploadItem,
} from "./services";
import { CREATE_COMPLAINT_SCHEMA } from "./schemas";
import type {
  TComplaintListItem,
  TComplaintDetail,
  TFacultyOption,
  TComplaintStatus,
  TStudentOption,
  TResolutionCertificate,
} from "./types";

export const createComplaintAction = async (formData: FormData) => {
  const currentUser = await getCurrentUserService();

  if (!currentUser) {
    return {
      success: false,
      message: "Please sign in to submit a complaint.",
    };
  }

  const category = (formData.get("category") as string) || "";
  const subject = (formData.get("subject") as string) || "";
  const description = (formData.get("description") as string) || "";
  const respondentIds = formData
    .getAll("respondentIds")
    .filter(
      (entry): entry is string => typeof entry === "string" && entry.length > 0,
    );

  if (respondentIds.includes(currentUser.userId)) {
    return {
      success: false,
      message: "Student cannot be respondent of their own complaint",
    };
  }

  const validation = CREATE_COMPLAINT_SCHEMA.safeParse({
    category,
    subject,
    description,
    respondentIds: respondentIds.length > 0 ? respondentIds : undefined,
  });

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message || "Invalid complaint details.",
    };
  }

  // Parse attached files
  const fileEntries = formData.getAll("files");
  const attachments: AttachmentUploadItem[] = [];

  for (const entry of fileEntries) {
    if (entry && typeof entry === "object" && "arrayBuffer" in entry) {
      const file = entry as File;
      if (file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        attachments.push({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          buffer: Buffer.from(arrayBuffer),
        });
      }
    }
  }

  try {
    const created = await createComplaintService({
      studentId: currentUser.userId,
      category: validation.data.category,
      subject: validation.data.subject,
      description: validation.data.description,
      respondentIds: validation.data.respondentIds,
      attachments,
    });

    // Revalidate paths so dashboards and complaint lists update immediately
    revalidatePath("/dashboard");
    revalidatePath("/complaints");

    return {
      success: true,
      message: "Complaint registered successfully",
      data: {
        id: created.id,
        refNumber: created.reference_id,
        studentName: currentUser.fullName,
        category: validation.data.category,
        subject: created.subject,
        description: created.description,
        status: created.status,
        assignedFaculty: "Unassigned",
        createdAt: new Date().toISOString().split("T")[0],
        attachments: created.attachments,
      },
    };
  } catch (error) {
    console.error("createComplaintAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit grievance. Please try again.",
    };
  }
};

// ─── GET: Complaints list ─────────────────────────────────────────────────────

export const getComplaintsAction = async (): Promise<{
  success: boolean;
  data?: TComplaintListItem[];
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    const data = await getComplaintsService({
      userId: currentUser.userId,
      role: currentUser.role,
    });

    return { success: true, data };
  } catch (error) {
    console.error("getComplaintsAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load complaints.",
    };
  }
};

// ─── GET: Single complaint detail ─────────────────────────────────────────────

export const getComplaintByReferenceIdAction = async (
  complaintId: string,
): Promise<{
  success: boolean;
  data?: TComplaintDetail | null;
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    const data = await getComplaintByReferenceIdService(complaintId);
    return { success: true, data };
  } catch (error) {
    console.error("getComplaintByIdAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load complaint.",
    };
  }
};

// ─── GET: Faculty list for admin assignment dropdown ─────────────────────────

export const getFacultyListAction = async (): Promise<{
  success: boolean;
  data?: TFacultyOption[];
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

    const data = await getFacultyListService();
    return { success: true, data };
  } catch (error) {
    console.error("getFacultyListAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load faculty list.",
    };
  }
};

// ─── GET: Student directory for the respondent picker ────────────────────────

export const getStudentOptionsAction = async (): Promise<{
  success: boolean;
  data?: TStudentOption[];
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    const data = await getStudentOptionsService();
    return { success: true, data };
  } catch (error) {
    console.error("getStudentOptionsAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load student list.",
    };
  }
};

// ─── UPDATE: Admin assigns complaint to faculty ──────────────────────────────

export const assignComplaintAction = async ({
  complaintId,
  facultyId,
}: {
  complaintId: string;
  facultyId: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }
    if (currentUser.role !== "admin") {
      return { success: false, message: "Only admins can assign complaints." };
    }
    if (!complaintId || !facultyId) {
      return { success: false, message: "Complaint and faculty are required." };
    }

    await assignComplaintService({ complaintId, facultyId });

    revalidatePath("/complaints");
    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath("/dashboard");

    return { success: true, message: "Complaint assigned successfully." };
  } catch (error) {
    console.error("assignComplaintAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to assign complaint.",
    };
  }
};

// ─── UPDATE: Faculty updates status & resolution notes ───────────────────────

export const updateComplaintAction = async ({
  complaintId,
  status,
  resolution,
}: {
  complaintId: string;
  status: TComplaintStatus;
  resolution: string | null;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }
    if (currentUser.role !== "faculty" && currentUser.role !== "admin") {
      return {
        success: false,
        message: "Only faculty or admins can update complaints.",
      };
    }

    // Resolution note or rejection reason is required when closing a complaint
    if (
      (status === "resolved" || status === "rejected") &&
      !resolution?.trim()
    ) {
      return {
        success: false,
        message:
          "A resolution note or rejection reason is required when choosing Resolved or Rejected.",
      };
    }

    await updateComplaintService({
      complaintId,
      status,
      resolution: resolution?.trim() || null,
    });

    revalidatePath("/complaints");
    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Complaint status updated to "${status.replace("_", " ").toUpperCase()}".`,
    };
  } catch (error) {
    console.error("updateComplaintAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update complaint.",
    };
  }
};

// ─── GET: Signed resolution certificate for a complaint ──────────────────────

export const getResolutionCertificateAction = async (
  complaintId: string
): Promise<{
  success: boolean;
  data?: TResolutionCertificate | null;
  message?: string;
}> => {
  try {
    const currentUser = await getCurrentUserService();
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    const data = await getResolutionCertificateService(complaintId);
    return { success: true, data };
  } catch (error) {
    console.error("getResolutionCertificateAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load the resolution certificate.",
    };
  }
};
