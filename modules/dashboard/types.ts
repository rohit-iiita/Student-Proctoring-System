import type { TUser, TUserRole } from "@/modules/auth/types";

export type TDashboardRole = TUserRole;

export interface TStudentStats {
  total: number;
  unresolved: number;
  resolved: number;
  upcomingMeetings: number;
}

export interface TFacultyStats {
  assigned: number;
  pending: number;
  resolved: number;
  upcomingMeetings: number;
}

export interface TAdminStats {
  totalComplaints: number;
  submitted: number;
  underReview: number;
  resolved: number;
  rejected: number;
  registeredStudents: number;
  registeredFaculty: number;
}

export interface TDashboardComplaint {
  id: string;
  refNumber: string;
  studentName: string;
  category: string;
  subject: string;
  description: string;
  status: "submitted" | "under_review" | "resolved" | "rejected";
  assignedFaculty: string;
  createdAt: string;
}

export interface TDashboardMeeting {
  id: string;
  title: string;
  startsAt: string;
  location: string;
  status: "scheduled" | "cancelled" | "completed";
  facultyName?: string;
}

export interface TDashboardData {
  user: TUser;
  activeRole: TDashboardRole;
  stats: TStudentStats | TFacultyStats | TAdminStats;
  recentComplaints: TDashboardComplaint[];
  upcomingMeetings: TDashboardMeeting[];
}
