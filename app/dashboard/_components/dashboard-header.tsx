"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import type { TUser } from "@/modules/auth/types";
import type { TDashboardRole } from "@/modules/dashboard/types";

interface DashboardHeaderProps {
  user: TUser;
  role: TDashboardRole;
  onLogout: () => void;
}

export function DashboardHeader({ user, role, onLogout }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-zinc-900 capitalize">
          {role} Dashboard
        </h1>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-700 capitalize border border-zinc-200">
          {role} View
        </span>
      </div>

      {/* User profile & Logout on Navbar */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-xs font-semibold text-zinc-900">
            {user.fullName}
          </div>
          <div className="text-[11px] text-zinc-500">
            {user.email || ""}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-zinc-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
