"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Check,
  Inbox,
} from "lucide-react";
import type { TNotification } from "@/modules/notifications/types";
import type { TUserRole } from "@/modules/auth/types";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/modules/notifications/actions";

interface NotificationsListProps {
  notifications: TNotification[];
  userRole: TUserRole;
  userName: string;
  userEmail: string;
  idNumber: string | null;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function TypeBadge({ type }: { type: TNotification["notificationType"] }) {
  switch (type) {
    case "complaint":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Complaint
        </span>
      );
    case "meeting":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
          Meeting
        </span>
      );
    case "exam":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Exam
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
          System
        </span>
      );
  }
}

export default function NotificationsList({
  notifications,
  userRole,
  userName,
  userEmail,
  idNumber,
}: NotificationsListProps) {
  const router = useRouter();

  const [items, setItems] = React.useState<TNotification[]>(notifications);
  const [syncedNotifications, setSyncedNotifications] =
    React.useState<TNotification[]>(notifications);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [markingAll, setMarkingAll] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const unreadCount = React.useMemo(
    () => items.filter((n) => n.readAt === null).length,
    [items]
  );

  // Keep the list fresh when navigating back to this page
  if (syncedNotifications !== notifications) {
    setSyncedNotifications(notifications);
    setItems(notifications);
  }

  const handleMarkAsRead = async (notificationId: string) => {
    setPendingId(notificationId);
    setFeedback(null);
    try {
      const result = await markNotificationAsReadAction({ notificationId });
      if (result.success) {
        setItems((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, readAt: n.readAt ?? new Date().toISOString() }
              : n
          )
        );
        router.refresh();
      } else {
        setFeedback(result.message ?? "Failed to mark notification as read.");
      }
    } catch {
      setFeedback("Failed to mark notification as read.");
    } finally {
      setPendingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    setFeedback(null);
    try {
      const result = await markAllNotificationsAsReadAction();
      if (result.success) {
        const now = new Date().toISOString();
        setItems((prev) =>
          prev.map((n) => (n.readAt === null ? { ...n, readAt: now } : n))
        );
        router.refresh();
      } else {
        setFeedback(result.message ?? "Failed to mark notifications as read.");
      }
    } catch {
      setFeedback("Failed to mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLogout = () => router.push("/login");

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="w-full md:w-64 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="h-16 px-6 flex items-center gap-2.5 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-900 leading-tight">SmartProctor</div>
              <div className="text-[10px] text-zinc-500">Complaint &amp; Exam System</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/complaints"
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
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {userRole === "admin" && (
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
              href="/profile"
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
                {userName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900 line-clamp-1">{userName}</div>
                <div className="text-[10px] text-zinc-500 capitalize">
                  {userRole}{idNumber ? ` (${idNumber})` : ""}
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
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-zinc-900">Notifications</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-700 capitalize border border-zinc-200">
              {userRole} View
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-zinc-900">{userName}</div>
              <div className="text-[11px] text-zinc-500">{userEmail}</div>
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

        {/* Body */}
        <main className="p-6 space-y-6">
          {/* Title + Mark all as read */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Notification Center</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
                  : "You are all caught up."}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs disabled:opacity-60"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{markingAll ? "Marking..." : "Mark All as Read"}</span>
              </Button>
            )}
          </div>

          {feedback && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {feedback}
            </div>
          )}

          {/* Notifications List */}
          {items.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs">
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">No notifications yet</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                    You will see notifications here when there are updates to your complaints,
                    meetings, or exams.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden divide-y divide-zinc-100">
              {items.map((notification) => {
                const unread = notification.readAt === null;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 flex items-start gap-3 transition-colors ${
                      unread ? "bg-blue-50/40" : "hover:bg-zinc-50/60"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        unread
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            unread ? "text-zinc-900" : "text-zinc-600"
                          }`}
                        >
                          {notification.title}
                        </span>
                        <TypeBadge type={notification.notificationType} />
                        {unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1.5">
                        {formatDate(notification.createdAt)}
                        {notification.readAt && " · Read"}
                      </p>
                    </div>
                    {unread && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={pendingId === notification.id}
                        className="h-7 text-xs px-2.5 rounded-lg text-zinc-700 hover:text-zinc-900 shrink-0 disabled:opacity-60"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        {pendingId === notification.id ? "Marking..." : "Mark read"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
