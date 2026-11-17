import * as React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
} from "lucide-react";
import type {
  TDashboardRole,
  TStudentStats,
  TFacultyStats,
  TAdminStats,
} from "@/modules/dashboard/types";

interface StatsCardsProps {
  role: TDashboardRole;
  stats: TStudentStats | TFacultyStats | TAdminStats;
}

export function StatsCards({ role, stats }: StatsCardsProps) {
  if (role === "student") {
    const studentStats = stats as TStudentStats;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Complaints Raised</span>
            <div className="p-2 bg-zinc-100 rounded-xl text-zinc-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-2">{studentStats.total}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Grievances registered by you</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Unresolved Complaints</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{studentStats.unresolved}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Submitted or under review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Resolved Complaints</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{studentStats.resolved}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Successfully addressed</div>
        </div>
      </div>
    );
  }

  if (role === "faculty") {
    const facultyStats = stats as TFacultyStats;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Assigned Complaints</span>
            <div className="p-2 bg-zinc-100 rounded-xl text-zinc-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-2">{facultyStats.assigned}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Complaints assigned to you</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Pending Review</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{facultyStats.pending}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Awaiting your resolution</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Resolved by You</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{facultyStats.resolved}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Completed investigations</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Upcoming Meetings</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{facultyStats.upcomingMeetings}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Scheduled with students</div>
        </div>
      </div>
    );
  }

  // Admin stats
  const adminStats = stats as TAdminStats;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <span className="text-[11px] font-medium text-zinc-500 block">Total</span>
        <div className="text-xl font-bold text-zinc-900 mt-1">{adminStats.totalComplaints}</div>
        <span className="text-[10px] text-zinc-400">Complaints</span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <span className="text-[11px] font-medium text-amber-700 block">Submitted</span>
        <div className="text-xl font-bold text-amber-600 mt-1">{adminStats.submitted}</div>
        <span className="text-[10px] text-zinc-400">Unassigned</span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <span className="text-[11px] font-medium text-blue-700 block">Under Review</span>
        <div className="text-xl font-bold text-blue-600 mt-1">{adminStats.underReview}</div>
        <span className="text-[10px] text-zinc-400">Investigating</span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <span className="text-[11px] font-medium text-emerald-700 block">Resolved</span>
        <div className="text-xl font-bold text-emerald-600 mt-1">{adminStats.resolved}</div>
        <span className="text-[10px] text-zinc-400">Closed</span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <span className="text-[11px] font-medium text-zinc-700 block">Rejected</span>
        <div className="text-xl font-bold text-zinc-600 mt-1">{adminStats.rejected}</div>
        <span className="text-[10px] text-zinc-400">Invalid</span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <span className="text-[11px] font-medium text-zinc-500 block">Students</span>
        <div className="text-xl font-bold text-zinc-900 mt-1">{adminStats.registeredStudents}</div>
        <span className="text-[10px] text-zinc-400">Registered</span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <span className="text-[11px] font-medium text-zinc-500 block">Faculty</span>
        <div className="text-xl font-bold text-zinc-900 mt-1">{adminStats.registeredFaculty}</div>
        <span className="text-[10px] text-zinc-400">Registered</span>
      </div>
    </div>
  );
}
