import "server-only";

import { createSupabaseClient } from "@/lib/supabase/server";
import type { TAdminStudentListItem, TAdminFacultyListItem } from "./types";

export const getStudentsService = async (): Promise<TAdminStudentListItem[]> => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      enrollment_no,
      department,
      semester,
      batch_year,
      created_at,
      profile:profiles!students_id_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getStudentsService error:", error);
    throw error;
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    enrollment_no: string | null;
    department: string | null;
    semester: number | null;
    batch_year: number | null;
    created_at: string;
    profile: { full_name: string | null; email: string | null } | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    fullName: row.profile?.full_name ?? "Unknown Student",
    email: row.profile?.email ?? null,
    enrollmentNo: row.enrollment_no ?? null,
    department: row.department ?? null,
    semester: row.semester ?? null,
    batchYear: row.batch_year ?? null,
    createdAt: row.created_at,
  }));
};

export const getFacultyService = async (): Promise<TAdminFacultyListItem[]> => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("faculty")
    .select(`
      id,
      employee_id,
      department,
      designation,
      created_at,
      profile:profiles!faculty_id_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getFacultyService error:", error);
    throw error;
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    employee_id: string | null;
    department: string | null;
    designation: string | null;
    created_at: string;
    profile: { full_name: string | null; email: string | null } | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    fullName: row.profile?.full_name ?? "Unknown Faculty",
    email: row.profile?.email ?? null,
    employeeId: row.employee_id ?? null,
    department: row.department ?? null,
    designation: row.designation ?? null,
    createdAt: row.created_at,
  }));
};
