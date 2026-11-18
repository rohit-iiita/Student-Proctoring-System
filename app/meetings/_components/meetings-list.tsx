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
  Search,
  Inbox,
  MapPin,
  Video,
  Clock,
  ExternalLink,
} from "lucide-react";
import type {
  TMeetingInvitationStatus,
  TMeetingListItem,
  TMeetingStatus,
} from "@/modules/meetings/types";
import type { TUserRole } from "@/modules/auth/types";

interface MeetingsListProps {
  meetings: TMeetingListItem[];
  userRole: TUserRole;
  userName: string;
  userEmail: string;
  idNumber: string | null;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      weekday: "short",
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

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function MeetingStatusBadge({ status }: { status: TMeetingStatus }) {
  switch (status) {
    case "scheduled":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Scheduled
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Completed
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
          Cancelled
        </span>
      );
    default:
      return null;
  }
}

function InvitationBadge({
  status,
}: {
  status: TMeetingInvitationStatus | null;
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
        Organizer
      </span>
    );
  }
  switch (status) {
    case "invited":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Invited
        </span>
      );
    case "accepted":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Accepted
        </span>
      );
    case "declined":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          Declined
        </span>
      );
    default:
      return null;
  }
}

export default function MeetingsList({
  meetings,
  userRole,
  userName,
  userEmail,
  idNumber,
}: MeetingsListProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filtered = React.useMemo(() => {
    return meetings.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !m.title.toLowerCase().includes(q) &&
          !(m.complaintReferenceId ?? "").toLowerCase().includes(q) &&
          !(m.complaintSubject ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [meetings, statusFilter, searchQuery]);

  const scheduledCount = meetings.filter(
    (m) => m.status === "scheduled",
  ).length;
  const pastCount = meetings.filter((m) => m.status !== "scheduled").length;

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
              <div className="font-bold text-sm text-zinc-900 leading-tight">
                SmartProctor
              </div>
              <div className="text-[10px] text-zinc-500">
                Complaint &amp; Exam System
              </div>
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
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Meetings</span>
            </Link>

            <Link
              href="/notifications"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <Bell className="w-4 h-4 text-zinc-400" />
              <span>Notifications</span>
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
                <div className="text-xs font-semibold text-zinc-900 line-clamp-1">
                  {userName}
                </div>
                <div className="text-[10px] text-zinc-500 capitalize">
                  {userRole}
                  {idNumber ? ` (${idNumber})` : ""}
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
            <h1 className="text-base font-bold text-zinc-900">Meetings</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-700 capitalize border border-zinc-200">
              {userRole} View
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-zinc-900">
                {userName}
              </div>
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
          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-zinc-900">My Meetings</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {scheduledCount > 0
                ? `You have ${scheduledCount} scheduled meeting${scheduledCount === 1 ? "" : "s"}${pastCount > 0 ? ` and ${pastCount} in your history` : ""}.`
                : "Scheduled inquiry meetings you are invited to will appear here."}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or complaint ref #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-transparent pl-9 pr-2 text-xs text-zinc-700 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-400"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Meetings Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                      No meetings found
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                      {searchQuery || statusFilter !== "all"
                        ? "Try clearing your search query or changing the status filter."
                        : userRole === "admin"
                          ? "Meetings you schedule from a complaint will appear here."
                          : "When an admin schedules a meeting that involves you, it will show up here with your invitation status."}
                    </p>
                  </div>
                  {(searchQuery || statusFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                      className="text-xs mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Meeting</th>
                      <th className="py-3 px-4">Complaint</th>
                      <th className="py-3 px-4">When</th>
                      <th className="py-3 px-4">Where</th>
                      <th className="py-3 px-4">Scheduled By</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Your Response</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {filtered.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50/60 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium max-w-xs truncate text-zinc-900">
                          {item.title}
                        </td>
                        <td className="py-3 px-4">
                          {item.complaintId ? (
                            <Link
                              href={`/complaints/${item.complaintReferenceId}`}
                              className="font-mono text-zinc-900 hover:underline"
                              title={item.complaintSubject ?? undefined}
                            >
                              {item.complaintReferenceId ?? "View complaint"}
                            </Link>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-zinc-900">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{formatDateTime(item.startsAt)}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            until {formatTime(item.endsAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-[180px]">
                          {item.meetingUrl ? (
                            <Link
                              href={item.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                            >
                              <Video className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[130px]">
                                Join online
                              </span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </Link>
                          ) : item.location ? (
                            <span className="inline-flex items-center gap-1.5 text-zinc-600">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {item.createdByName ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          <MeetingStatusBadge status={item.status} />
                        </td>
                        <td className="py-3 px-4">
                          <InvitationBadge status={item.invitationStatus} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.complaintId ? (
                            <Link
                              href={`/complaints/${item.complaintReferenceId}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2.5 rounded-lg text-zinc-700 hover:text-zinc-900"
                              >
                                View Complaint
                              </Button>
                            </Link>
                          ) : item.meetingUrl ? (
                            <a
                              href={item.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2.5 rounded-lg text-zinc-700 hover:text-zinc-900"
                              >
                                Join
                              </Button>
                            </a>
                          ) : (
                            <span className="text-zinc-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
