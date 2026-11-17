"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { logoutAction } from "@/modules/auth/actions";
import type { TDashboardData, TDashboardRole } from "@/modules/dashboard/types";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { StatsCards } from "./stats-cards";
import { RecentComplaintsTable } from "./recent-complaints-table";

interface DashboardShellProps {
  initialData: TDashboardData;
}

export function DashboardShell({ initialData }: DashboardShellProps) {
  const router = useRouter();
  const [role, setRole] = React.useState<TDashboardRole>(
    initialData.activeRole,
  );

  const handleRoleChange = (newRole: TDashboardRole) => {
    setRole(newRole);
    router.push(`/dashboard?role=${newRole}`);
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <DashboardSidebar
        user={initialData.user}
        role={role}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <DashboardHeader
          user={initialData.user}
          role={role}
          onLogout={handleLogout}
        />

        {/* Page Body */}
        <main className="p-6 space-y-6">
          {/* Demo Role Switcher Banner */}
          {/* <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-700">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>
                <strong className="font-semibold text-zinc-900">Demo Role Switcher:</strong> Switch views to inspect Student, Faculty, or Admin dashboards.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleRoleChange("student")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  role === "student"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("faculty")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  role === "faculty"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  role === "admin"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                Admin
              </button>
            </div>
          </div> */}

          {/* Metric Summary Cards */}
          <StatsCards role={role} stats={initialData.stats} />

          {/* Recent Complaints Table */}
          <RecentComplaintsTable
            role={role}
            complaints={initialData.recentComplaints}
          />
        </main>
      </div>
    </div>
  );
}
