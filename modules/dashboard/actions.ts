"use server";

import { getCurrentUserService } from "@/modules/auth/services";
import {
  getStudentDashboardDataService,
  getFacultyDashboardDataService,
  getAdminDashboardDataService,
} from "./services";
import type { TDashboardData, TDashboardRole } from "./types";

export async function getDashboardDataAction(
  roleOverride?: TDashboardRole
): Promise<{ success: boolean; data: TDashboardData }> {
  // 1. Fetch real current logged in user from Supabase auth session
  const currentUser = await getCurrentUserService();

  // 2. Active role: user's real role from Supabase, or roleOverride if specified
  const activeRole: TDashboardRole = roleOverride || currentUser?.role || "student";

  // 3. User object: use real user data from Supabase
  const user = currentUser || {
    userId: "guest",
    email: "",
    fullName: "Student User",
    avatarUrl: null,
    role: activeRole,
    idNumber: null,
  };

  // 4. Fetch real role-specific dashboard metrics and records directly from Supabase
  let result;
  if (activeRole === "faculty") {
    result = await getFacultyDashboardDataService(user.userId, user.fullName);
  } else if (activeRole === "admin") {
    result = await getAdminDashboardDataService();
  } else {
    result = await getStudentDashboardDataService(user.userId, user.fullName);
  }

  return {
    success: true,
    data: {
      user,
      activeRole,
      stats: result.stats,
      recentComplaints: result.recentComplaints,
      upcomingMeetings: result.upcomingMeetings,
    },
  };
}
