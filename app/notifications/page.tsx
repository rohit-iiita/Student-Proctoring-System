"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  mockUsers,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  MockUser,
  MockNotification,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
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
  CheckCheck,
  Info,
  Clock,
  ExternalLink,
  Inbox,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

export default function NotificationsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading notifications...</div>}>
      <NotificationsContent />
    </React.Suspense>
  );
}

function NotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Role state from URL query, default to "student"
  const initialRole = (searchParams.get("role") as UserRole) || "student";
  const [role, setRole] = React.useState<UserRole>(initialRole);

  // Active filter tab: "all" or "unread"
  const [filterTab, setFilterTab] = React.useState<"all" | "unread">("all");

  // Notifications state loaded from centralized store
  const [notifications, setNotifications] = React.useState<MockNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Load notifications from centralized store
  const loadData = () => {
    const all = getNotifications();
    const user = mockUsers.find((u) => u.role === role) || mockUsers[0];
    // Filter notifications belonging to the current user
    const userNotifs = all.filter((n) => n.recipientEmail === user.email);
    setNotifications(userNotifs);
    setUnreadCount(getUnreadNotificationCount(user.email));
  };

  React.useEffect(() => {
    loadData();
  }, [role]);

  React.useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam && (roleParam === "student" || roleParam === "faculty" || roleParam === "admin")) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const currentUser: MockUser =
    mockUsers.find((u) => u.role === role) || mockUsers[0];

  // 2. Filter list based on active tab ("all" vs "unread")
  const displayedNotifications = React.useMemo(() => {
    if (filterTab === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [filterTab, notifications]);

  // 3. Handle Mark as Read on individual notification
  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    loadData();
  };

  // 4. Handle Mark All as Read
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(currentUser.email);
    loadData();
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      
      {/* ===================== SIDEBAR ===================== */}
      <aside className="w-full md:w-64 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Header */}
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

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              href={`/dashboard?role=${role}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-400" />
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
              href={`/meetings?role=${role}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>Meetings</span>
            </Link>

            {/* Active Link: Notifications with badge */}
            <Link
              href={`/notifications?role=${role}`}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </Link>

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

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900 line-clamp-1">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-zinc-500 capitalize">
                  {role} ({currentUser.idNumber})
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-zinc-900">
              In-App Notifications
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-700 capitalize border border-zinc-200">
              {role} View
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-zinc-900">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-zinc-500">
                {currentUser.email}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-zinc-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-6 max-w-4xl space-y-6">

          {/* Demo Role Switcher */}
          <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-700">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>
                <strong className="font-semibold text-zinc-900">Demo Role Switcher:</strong> Switch views to see notifications tailored for Student, Faculty, or Admin.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  role === "student"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("faculty")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  role === "faculty"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  role === "admin"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Header Action: Filter Tabs & Mark All as Read */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filterTab === "all"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                All ({notifications.length})
              </button>

              <button
                onClick={() => setFilterTab("unread")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  filterTab === "unread"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-8 text-zinc-700 hover:text-zinc-900 rounded-xl"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {displayedNotifications.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">
                {filterTab === "unread" ? "No unread notifications" : "No notifications yet"}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {filterTab === "unread"
                  ? "You have caught up with all your campus alerts and hearing updates."
                  : "You will receive updates here when complaints are updated or meetings are scheduled."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    notif.read
                      ? "bg-white border-zinc-200 text-zinc-600"
                      : "bg-blue-50/40 border-blue-200 text-zinc-900 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread indicator dot */}
                    <div className="pt-1 shrink-0">
                      {!notif.read ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" title="Unread" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs ${
                            notif.read ? "font-semibold text-zinc-800" : "font-bold text-zinc-900"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notif.time}
                        </span>
                      </div>

                      <p
                        className={`text-xs leading-relaxed ${
                          notif.read ? "text-zinc-500" : "text-zinc-800 font-medium"
                        }`}
                      >
                        {notif.message}
                      </p>

                      {/* Direct Link if present */}
                      {notif.link && (
                        <div className="pt-1">
                          <Link
                            href={notif.link}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                          >
                            <span>Open details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mark as read button */}
                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-[11px] h-7 px-2 text-zinc-500 hover:text-zinc-900 shrink-0"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Backend Info Notice */}
          <div className="p-3.5 bg-zinc-100 rounded-xl text-xs text-zinc-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>
              <strong>Backend Integration Note:</strong> Automated email notifications for complaint status changes, meeting invitations, and assignments will be dispatched via Resend / Supabase Webhooks in production.
            </span>
          </div>

        </main>
      </div>
    </div>
  );
}
