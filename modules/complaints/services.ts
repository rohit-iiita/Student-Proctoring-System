import "server-only";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { createSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createNotificationService } from "@/modules/notifications/services";
import { successfullComplaintRegistrationEmailService } from "@/modules/email/services";
import { formatComplaintCategory } from "@/lib/utils";
import type {
  TComplaintCategory,
  TComplaintListItem,
  TComplaintDetail,
  TComplaintStatus,
  TFacultyOption,
  TStudentOption,
  TResolutionCertificate,
} from "./types";

// Helper: Generate a random 9-character reference (matching DB function without prefix)
export function generateReferenceNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  const randomBytes = crypto.randomBytes(9);
  for (let i = 0; i < 9; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

// Helper: Normalize category string to DB enum value
export function normalizeCategory(category: string): TComplaintCategory {
  const lower = category.trim().toLowerCase();
  if (lower.includes("ragging") || lower.includes("harassment")) {
    return "ragging_and_harassment";
  }
  if (lower === "ta" || lower.includes("teaching assistant")) {
    return "ta";
  }
  if (lower.includes("mess") || lower.includes("food")) {
    return "mess_and_food";
  }
  if (lower.includes("discrimination") || lower.includes("misconduct")) {
    return "discrimination_and_misconduct";
  }
  return "hostel";
}

export interface AttachmentUploadItem {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
}

export const createComplaintService = async ({
  studentId,
  category,
  description,
  subject,
  respondentIds = [],
  attachments = [],
}: {
  studentId: string;
  category: string;
  subject: string;
  description: string;
  respondentIds?: string[];
  attachments?: AttachmentUploadItem[];
}) => {
  const supabase = await createSupabaseClient();
  const dbCategory = normalizeCategory(category);
  const referenceId = generateReferenceNumber();

  // 1. Ensure student profile and students record exist to satisfy foreign key constraint
  try {
    const { data: studentCheck } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .maybeSingle();

    if (!studentCheck) {
      await createSupabaseAdminClient
        .from("students")
        .upsert({ id: studentId }, { onConflict: "id" });
    }
  } catch (err) {
    console.warn("Could not verify student record in students table:", err);
  }

  // 2. Insert new complaint record
  const { data: complaint, error: insertError } = await supabase
    .from("complaints")
    .insert({
      reference_id: referenceId,
      student_id: studentId,
      category: dbCategory,
      subject,
      description,
      status: "submitted",
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating complaint:", insertError);
    throw insertError;
  }

  // 3. Link the selected student respondents to the complaint.
  //    Only IDs that actually exist in `students` are inserted, so a stale or
  //    invalid selection can never violate the foreign key constraint.
  if (respondentIds.length > 0) {
    try {
      const uniqueIds = Array.from(new Set(respondentIds));

      const { data: validRespondents, error: respondentsError } = await supabase
        .from("students")
        .select("id")
        .in("id", uniqueIds);

      if (respondentsError) throw respondentsError;

      const rowsToInsert = (validRespondents ?? [])
        .filter((row) => typeof row.id === "string")
        .map((row) => ({
          complaint_id: complaint.id,
          student_id: row.id,
        }));

      if (rowsToInsert.length > 0) {
        const { error: insertRespondentsError } = await supabase
          .from("complaint_respondents")
          .insert(rowsToInsert);

        if (insertRespondentsError) throw insertRespondentsError;
      }
    } catch (respErr) {
      console.warn("Could not link respondents to complaint:", respErr);
    }
  }

  // 4. Handle attachments upload to Supabase Storage & complaint_attachments
  const uploadedFiles: Array<{ name: string; size: string }> = [];

  if (attachments && attachments.length > 0) {
    for (const file of attachments) {
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${complaint.id}/${Date.now()}_${cleanName}`;

        // Upload directly to 'complaint-attachments' bucket
        const { error: uploadError } = await supabase.storage
          .from("complaint-attachments")
          .upload(storagePath, file.buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: true,
          });

        if (uploadError) {
          console.error(`Error uploading ${file.name} to storage:`, uploadError);
        } else {
          // The trg_storage_complaint_attachment trigger on storage.objects
          // inserts the complaint_attachments row; do not insert it again here.
          uploadedFiles.push({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          });
        }
      } catch (fileErr) {
        console.error(`Failed processing attachment ${file.name}:`, fileErr);
      }
    }
  }

  // 5. Notify all admins about the new complaint (non-blocking)
  try {
    const { data: admins, error: adminsError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminsError) throw adminsError;

    if (admins && admins.length > 0) {
      const notificationPromises = admins.map((admin: { id: string }) =>
        createNotificationService({
          userId: admin.id,
          title: "New Complaint Filed",
          message: `A new complaint (${complaint.reference_id}) "${subject}" has been submitted and awaits assignment.`,
          notificationType: "complaint",
          metadata: { complaintId: complaint.id, referenceId: complaint.reference_id },
        })
      );
      await Promise.all(notificationPromises);
    }
  } catch (notifErr) {
    console.warn("Could not send admin notifications for new complaint:", notifErr);
  }

  // 6. Send registration confirmation emails to the student and all admins
  //    after the response is sent. Failures are logged, never fail the
  //    complaint creation.
  after(async () => {
    try {
      const [studentResult, adminsResult] = await Promise.all([
        createSupabaseAdminClient
          .from("profiles")
          .select("full_name, email")
          .eq("id", studentId)
          .maybeSingle(),
        createSupabaseAdminClient
          .from("profiles")
          .select("full_name, email")
          .eq("role", "admin"),
      ]);

      if (studentResult.error) throw studentResult.error;
      if (adminsResult.error) throw adminsResult.error;

      const studentProfile = studentResult.data;
      const admins = adminsResult.data ?? [];

      const recipients = [
        ...(studentProfile?.email
          ? [
              {
                name: studentProfile.full_name,
                email: studentProfile.email,
              },
            ]
          : []),
        ...admins
          .filter((admin) => admin.email)
          .map((admin) => ({ name: admin.full_name, email: admin.email })),
      ];

      const results = await Promise.allSettled(
        recipients.map((recipient) =>
          successfullComplaintRegistrationEmailService({
            email: recipient.email,
            name: recipient.name,
            complaintId: complaint.reference_id,
            category: formatComplaintCategory(dbCategory),
            subject: complaint.subject,
            submittedAt: new Date(complaint.created_at).toLocaleString(
              "en-IN",
              { dateStyle: "medium", timeStyle: "short" },
            ),
          }),
        ),
      );

      for (const result of results) {
        if (result.status === "rejected") {
          console.warn("Complaint registration email failed:", result.reason);
        }
      }
    } catch (emailErr) {
      console.warn(
        "Could not send complaint registration emails:",
        emailErr,
      );
    }
  });

  return {
    ...complaint,
    attachments: uploadedFiles,
  };
};

export const updateComplaintService = async ({
  complaintId,
  status,
  resolution,
}: {
  complaintId: string;
  status: TComplaintStatus;
  resolution: string | null;
}) => {
  const supabase = await createSupabaseClient();
  
  if (status === "resolved") {
    const { error } = await supabase
      .from("complaints")
      .update({ status, resolution, resolved_at: new Date().toISOString() })
      .eq("id", complaintId);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("complaints")
      .update({ status })
      .eq("id", complaintId);

    if (error) throw error;
  }
};

// ─── READ: Complaints list (role-scoped) ─────────────────────────────────────

/**
 * Fetch complaints list scoped by the caller's role.
 *  - student → only their own complaints
 *  - faculty  → complaints assigned to them
 *  - admin    → all complaints
 */
export const getComplaintsService = async ({
  userId,
  role,
}: {
  userId: string;
  role: "student" | "faculty" | "admin";
}): Promise<TComplaintListItem[]> => {
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("complaints")
    .select(
      `id,
       reference_id,
       category,
       subject,
       status,
       created_at,
       student:students!complaints_student_id_fkey(
         profile:profiles!students_id_fkey(full_name)
       ),
       assigned:faculty!complaints_assigned_to_fkey(
         profile:profiles!faculty_id_fkey(full_name)
       )`
    )
    .order("created_at", { ascending: false });

  if (role === "student") {
    // students.id == profiles.id == auth user id
    query = query.eq("student_id", userId);
  } else if (role === "faculty") {
    query = query.eq("assigned_to", userId);
  }
  // admin → no filter

  const { data, error } = await query;

  if (error) {
    console.error("getComplaintsService error:", error);
    throw error;
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    reference_id: string;
    category: TComplaintCategory;
    subject: string;
    status: TComplaintStatus;
    created_at: string;
    student: { profile: { full_name: string } | null } | null;
    assigned: { profile: { full_name: string } | null } | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    referenceId: row.reference_id,
    category: row.category,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
    studentName: row.student?.profile?.full_name ?? null,
    assignedFacultyName: row.assigned?.profile?.full_name ?? null,
  }));
};

// ─── READ: Faculty dropdown for admin assignment ─────────────────────────────

export const getFacultyListService = async (): Promise<TFacultyOption[]> => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("faculty")
    .select("id, profile:profiles!faculty_id_fkey(full_name)")
    .order("employee_id", { ascending: true });

  if (error) {
    console.error("getFacultyListService error:", error);
    throw error;
  }

  return (data ?? []).map((row) => {
    const profile = row.profile as unknown as { full_name: string } | null;
    return {
      id: row.id as string,
      fullName: profile?.full_name ?? "Unknown Faculty",
    };
  });
};

// ─── READ: Student directory for the respondent multi-select picker ──────────

export const getStudentOptionsService = async (): Promise<TStudentOption[]> => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("students")
    .select(
      `id,
       enrollment_no,
       profile:profiles!students_id_fkey(full_name)`,
    )
    .order("enrollment_no", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getStudentOptionsService error:", error);
    throw error;
  }

  return (data ?? []).map((row) => {
    const student = row as unknown as {
      id: string;
      enrollment_no: string | null;
      profile: { full_name: string } | null;
    };
    return {
      id: student.id,
      fullName: student.profile?.full_name ?? "Unknown Student",
      enrollmentNo: student.enrollment_no ?? null,
    };
  });
};

// ─── UPDATE: Assign faculty (admin) ──────────────────────────────────────────

export const assignComplaintService = async ({
  complaintId,
  facultyId,
}: {
  complaintId: string;
  facultyId: string;
}) => {
  const supabase = await createSupabaseClient();

  // Move submitted complaints into review once assigned
  const { data: existing, error: fetchError } = await supabase
    .from("complaints")
    .select("status")
    .eq("id", complaintId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) throw new Error("Complaint not found.");

  const nextStatus: TComplaintStatus =
    existing.status === "submitted" ? "under_review" : existing.status;

  const { error: updateError } = await supabase
    .from("complaints")
    .update({ assigned_to: facultyId, status: nextStatus })
    .eq("id", complaintId);

  if (updateError) throw updateError;

  // Notify the assigned faculty member (non-blocking)
  try {
    const { data: complaintDetails, error: detailError } = await supabase
      .from("complaints")
      .select("reference_id, subject")
      .eq("id", complaintId)
      .maybeSingle();

    if (detailError) throw detailError;

    if (complaintDetails) {
      await createNotificationService({
        userId: facultyId,
        title: "Complaint Assigned to You",
        message: `Complaint (${complaintDetails.reference_id}) "${complaintDetails.subject}" has been assigned to you for review.`,
        notificationType: "complaint",
        metadata: { complaintId, referenceId: complaintDetails.reference_id },
      });
    }
  } catch (notifErr) {
    console.warn("Could not send faculty notification for assignment:", notifErr);
  }

  revalidatePath("/complaints");
  revalidatePath(`/complaints/${complaintId}`);
};

// ─── READ: Single complaint detail ───────────────────────────────────────────

export const getComplaintByReferenceIdService = async (
  complaintRefId: string
): Promise<TComplaintDetail | null> => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(
      `id,
       reference_id,
       category,
       subject,
       description,
       status,
       resolution,
       resolved_at,
       created_at,
       student:students!complaints_student_id_fkey(
         profile:profiles!students_id_fkey(full_name)
       ),
       assigned:faculty!complaints_assigned_to_fkey(
         profile:profiles!faculty_id_fkey(full_name)
       ),
        complaint_respondents(
          student:students!complaint_respondents_student_id_fkey(
            id,
            enrollment_no,
            profile:profiles!students_id_fkey(full_name)
          )
        ),
        complaint_attachments(id, file_path, file_type, file_size)`
    )
    .eq("reference_id", complaintRefId)
    .maybeSingle();

  if (error) {
    console.error("getComplaintByIdService error:", error);
    throw error;
  }

  if (!data) return null;

  const row = data as unknown as {
    id: string;
    reference_id: string;
    category: TComplaintCategory;
    subject: string;
    description: string;
    status: TComplaintStatus;
    resolution: string | null;
    resolved_at: string | null;
    created_at: string;
    student: { profile: { full_name: string } | null } | null;
    assigned: { profile: { full_name: string } | null } | null;
    complaint_respondents:
      | Array<{
          student: {
            id: string;
            enrollment_no: string | null;
            profile: { full_name: string } | null;
          } | null;
        }>
      | null;
    complaint_attachments:
      | Array<{
          id: string;
          file_path: string;
          file_type: string;
          file_size: number;
        }>
      | null;
  };

  return {
    id: row.id,
    referenceId: row.reference_id,
    category: row.category,
    subject: row.subject,
    description: row.description,
    status: row.status,
    resolution: row.resolution ?? null,
    resolvedAt: row.resolved_at ?? null,
    createdAt: row.created_at,
    studentName: row.student?.profile?.full_name ?? null,
    assignedFacultyName: row.assigned?.profile?.full_name ?? null,
    respondents: (row.complaint_respondents ?? [])
      .map((resp) =>
        resp.student
          ? {
              id: resp.student.id,
              fullName: resp.student.profile?.full_name ?? "Unknown Student",
              enrollmentNo: resp.student.enrollment_no ?? null,
            }
          : null,
      )
      .filter((r): r is { id: string; fullName: string; enrollmentNo: string | null } => r !== null),
    attachments: (row.complaint_attachments ?? []).map((a) => ({
      id: a.id,
      filePath: a.file_path,
      fileType: a.file_type,
      fileSize: a.file_size,
      fileUrl: supabase.storage
        .from("complaint-attachments")
        .getPublicUrl(a.file_path).data.publicUrl,
    })),
  };
};

// ─── READ: Signed resolution certificate ─────────────────────────────────────

export const getResolutionCertificateService = async (
  complaintId: string
): Promise<TResolutionCertificate | null> => {
  const supabase = await createSupabaseClient();

  // list() is RLS-filtered by resolution_certificates_select_participant, so a
  // participant sees their certificate and everyone else sees an empty folder.
  const { data: objects, error } = await supabase.storage
    .from("resolution-certificates")
    .list(complaintId, { limit: 1, search: "resolution-certificate-" });

  if (error) {
    console.error("getResolutionCertificateService list error:", error);
    return null;
  }

  const certificate = (objects ?? []).find((obj) =>
    obj.name.startsWith("resolution-certificate-"),
  );
  if (!certificate) return null;

  const filePath = `${complaintId}/${certificate.name}`;
  const { data: signed, error: signError } = await supabase.storage
    .from("resolution-certificates")
    .createSignedUrl(filePath, 60 * 60);

  if (signError || !signed) {
    console.error("getResolutionCertificateService sign error:", signError);
    return null;
  }

  return {
    fileName: certificate.name,
    url: signed.signedUrl,
  };
};
