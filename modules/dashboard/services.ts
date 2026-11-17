import "server-only";

import { createSupabaseClient } from "@/lib/supabase/server";
import { formatCategoryLabel } from "./utils";
import type {
  TStudentStats,
  TFacultyStats,
  TAdminStats,
  TDashboardComplaint,
  TDashboardMeeting,
} from "./types";

// ==========================================
// STUDENT DASHBOARD SERVICES
// ==========================================

export async function getStudentDashboardDataService(
  studentId: string,
  studentName?: string
): Promise<{
  stats: TStudentStats;
  recentComplaints: TDashboardComplaint[];
  upcomingMeetings: TDashboardMeeting[];
}> {
  const supabase = await createSupabaseClient();

  // 1. Fetch complaints for this student from Supabase
  const { data: complaintsData, error: complaintsError } = await supabase
    .from("complaints")
    .select(`
      id,
      reference_id,
      category,
      subject,
      description,
      status,
      created_at
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (complaintsError) {
    console.error("Error fetching student complaints from Supabase:", complaintsError);
  }

  // 2. Fetch scheduled meetings for this student from Supabase
  const { data: meetingsData, error: meetingsError } = await supabase
    .from("meeting_participants")
    .select(`
      invitation_status,
      meeting:meetings (
        id,
        title,
        starts_at,
        location,
        status,
        created_by
      )
    `)
    .eq("user_id", studentId);

  if (meetingsError) {
    console.error("Error fetching student meetings from Supabase:", meetingsError);
  }

  const complaintsList = complaintsData || [];
  const formattedComplaints: TDashboardComplaint[] = complaintsList.map((c: any) => ({
    id: c.id,
    refNumber: c.reference_id || `CMP-${c.id.slice(0, 8).toUpperCase()}`,
    studentName: studentName || "You",
    category: formatCategoryLabel(c.category),
    subject: c.subject || "No Subject",
    description: c.description || "",
    status: c.status || "submitted",
    assignedFaculty: "Faculty Reviewer",
    createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
  }));

  const total = formattedComplaints.length;
  const unresolved = formattedComplaints.filter(
    (c) => c.status === "submitted" || c.status === "under_review"
  ).length;
  const resolved = formattedComplaints.filter((c) => c.status === "resolved").length;

  const formattedMeetings: TDashboardMeeting[] = (meetingsData || [])
    .map((m: any) => m.meeting)
    .filter(Boolean)
    .map((m: any) => ({
      id: m.id,
      title: m.title || "Meeting",
      startsAt: m.starts_at ? new Date(m.starts_at).toLocaleString() : "TBD",
      location: m.location || "Online",
      status: m.status || "scheduled",
    }));

  return {
    stats: {
      total,
      unresolved,
      resolved,
      upcomingMeetings: formattedMeetings.filter((m) => m.status === "scheduled").length,
    },
    recentComplaints: formattedComplaints.slice(0, 5),
    upcomingMeetings: formattedMeetings,
  };
}

// ==========================================
// FACULTY DASHBOARD SERVICES
// ==========================================

export async function getFacultyDashboardDataService(
  facultyId: string,
  facultyName?: string
): Promise<{
  stats: TFacultyStats;
  recentComplaints: TDashboardComplaint[];
  upcomingMeetings: TDashboardMeeting[];
}> {
  const supabase = await createSupabaseClient();

  // 1. Fetch complaints from Supabase
  // In Supabase, complaints can be assigned or under review for faculty members
  const { data: complaintsData, error: complaintsError } = await supabase
    .from("complaints")
    .select(`
      id,
      reference_id,
      student_id,
      category,
      subject,
      description,
      status,
      created_at,
      student:profiles!complaints_student_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false });

  if (complaintsError) {
    console.error("Error fetching faculty complaints from Supabase:", complaintsError);
  }

  // 2. Fetch meetings created by or involving this faculty
  const { data: meetingsData, error: meetingsError } = await supabase
    .from("meetings")
    .select(`
      id,
      title,
      starts_at,
      location,
      status,
      created_by
    `)
    .eq("created_by", facultyId)
    .order("starts_at", { ascending: true });

  if (meetingsError) {
    console.error("Error fetching faculty meetings from Supabase:", meetingsError);
  }

  const complaintsList = complaintsData || [];
  const formattedComplaints: TDashboardComplaint[] = complaintsList.map((c: any) => ({
    id: c.id,
    refNumber: c.reference_id || `CMP-${c.id.slice(0, 8).toUpperCase()}`,
    studentName: c.student?.full_name || "Student",
    category: formatCategoryLabel(c.category),
    subject: c.subject || "No Subject",
    description: c.description || "",
    status: c.status || "under_review",
    assignedFaculty: facultyName || "Assigned Faculty",
    createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
  }));

  const assigned = formattedComplaints.length;
  const pending = formattedComplaints.filter((c) => c.status === "under_review").length;
  const resolved = formattedComplaints.filter((c) => c.status === "resolved").length;

  const formattedMeetings: TDashboardMeeting[] = (meetingsData || []).map((m: any) => ({
    id: m.id,
    title: m.title || "Meeting",
    startsAt: m.starts_at ? new Date(m.starts_at).toLocaleString() : "TBD",
    location: m.location || "Online",
    status: m.status || "scheduled",
    facultyName: facultyName || "Faculty",
  }));

  return {
    stats: {
      assigned,
      pending,
      resolved,
      upcomingMeetings: formattedMeetings.filter((m) => m.status === "scheduled").length,
    },
    recentComplaints: formattedComplaints.slice(0, 5),
    upcomingMeetings: formattedMeetings,
  };
}

// ==========================================
// ADMIN DASHBOARD SERVICES
// ==========================================

export async function getAdminDashboardDataService(): Promise<{
  stats: TAdminStats;
  recentComplaints: TDashboardComplaint[];
  upcomingMeetings: TDashboardMeeting[];
}> {
  const supabase = await createSupabaseClient();

  // Fetch real counts and complaints across the institution
  const [complaintsRes, studentsRes, facultyRes, meetingsRes] = await Promise.all([
    supabase
      .from("complaints")
      .select(`
        id,
        reference_id,
        category,
        subject,
        description,
        status,
        created_at,
        student:profiles!complaints_student_id_fkey(full_name)
      `)
      .order("created_at", { ascending: false }),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("faculty").select("id", { count: "exact", head: true }),
    supabase.from("meetings").select("id, title, starts_at, location, status").order("starts_at", { ascending: true }),
  ]);

  if (complaintsRes.error) {
    console.error("Error fetching admin complaints from Supabase:", complaintsRes.error);
  }

  const complaintsList = complaintsRes.data || [];
  const formattedComplaints: TDashboardComplaint[] = complaintsList.map((c: any) => ({
    id: c.id,
    refNumber: c.reference_id || `CMP-${c.id.slice(0, 8).toUpperCase()}`,
    studentName: c.student?.full_name || "Student",
    category: formatCategoryLabel(c.category),
    subject: c.subject || "No Subject",
    description: c.description || "",
    status: c.status || "submitted",
    assignedFaculty: "Faculty",
    createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
  }));

  const totalComplaints = formattedComplaints.length;
  const submitted = formattedComplaints.filter((c) => c.status === "submitted").length;
  const underReview = formattedComplaints.filter((c) => c.status === "under_review").length;
  const resolved = formattedComplaints.filter((c) => c.status === "resolved").length;
  const rejected = formattedComplaints.filter((c) => c.status === "rejected").length;

  const formattedMeetings: TDashboardMeeting[] = (meetingsRes.data || []).map((m: any) => ({
    id: m.id,
    title: m.title || "Meeting",
    startsAt: m.starts_at ? new Date(m.starts_at).toLocaleString() : "TBD",
    location: m.location || "Online",
    status: m.status || "scheduled",
  }));

  return {
    stats: {
      totalComplaints,
      submitted,
      underReview,
      resolved,
      rejected,
      registeredStudents: studentsRes.count ?? 0,
      registeredFaculty: facultyRes.count ?? 0,
    },
    recentComplaints: formattedComplaints.slice(0, 5),
    upcomingMeetings: formattedMeetings,
  };
}
