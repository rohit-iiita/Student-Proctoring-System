"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Calendar,
  Bell,
  User,
  GraduationCap,
  Briefcase,
  LogOut,
} from "lucide-react";
import type { TUser } from "@/modules/auth/types";
import type { TDashboardRole } from "@/modules/dashboard/types";
import { getUnreadNotificationCountAction } from "@/modules/notifications/actions";

interface DashboardSidebarProps {
  user: TUser;
  role: TDashboardRole;
  onLogout: () => void;
}

export function DashboardSidebar({ user, role, onLogout }: DashboardSidebarProps) {
  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  React.useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const result = await getUnreadNotificationCountAction();
        if (isMounted && result.success && typeof result.data === "number") {
          setUnreadCount(result.data);
        }
      } catch {
        // Badge is non-critical; silently ignore fetch errors
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  return (
    <aside className="w-full md:w-64 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0">
      <div>
        {/* System Brand / Logo */}
        <div className="h-16 px-6 flex items-center gap-2.5 border-b border-zinc-100">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-zinc-900 leading-tight">
              SmartProctor
            </div>
            <div className="text-[10px] text-zinc-500">
              Complaint & Exam System
            </div>
          </div>
        </div>

        {/* Navigation Links (filtered by user role) */}
        <nav className="p-4 space-y-1">
          <Link
            href={`/dashboard?role=${role}`}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href={`/complaints?role=${role}`}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>Complaints</span>
          </Link>

          <Link
            href="/meetings"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>Meetings</span>
          </Link>

          <Link
            href="/notifications"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <Bell className="w-4 h-4 text-zinc-400" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Admin-only links: Manage Students & Faculty */}
          {role === "admin" && (
            <>
              <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Administration
              </div>
              <Link
                href="/admin/students"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-zinc-400" />
                <span>Manage Students</span>
              </Link>

              <Link
                href="/admin/faculty"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-zinc-400" />
                <span>Manage Faculty</span>
              </Link>
            </>
          )}

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Account
          </div>
          <Link
            href={`/profile?role=${role}`}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <User className="w-4 h-4 text-zinc-400" />
            <span>Profile Settings</span>
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer: Current user info */}
      <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-900 line-clamp-1">
                {user.fullName}
              </div>
              <div className="text-[10px] text-zinc-500 capitalize">
                {role} {user.idNumber ? `(${user.idNumber})` : ""}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
