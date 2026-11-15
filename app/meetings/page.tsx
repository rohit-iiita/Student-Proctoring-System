"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  mockUsers,
  getMeetings,
  updateMeetingParticipantResponse,
  getUnreadNotificationCount,
  MockUser,
  MockMeeting,
} from "@/lib/mock-data";
import { formatTime, getMeetingStatus, getMeetingTimeLabel } from "@/lib/utils";
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
  PlusCircle,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Users,
  Info,
  CalendarDays,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

export default function MeetingsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading meetings...</div>}>
      <MeetingsContent />
    </React.Suspense>
  );
}

function MeetingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Role state from URL query, default to "student"
  const initialRole = (searchParams.get("role") as UserRole) || "student";
  const [role, setRole] = React.useState<UserRole>(initialRole);

  // Active tab: "upcoming", "live", or "past"
  const [activeTab, setActiveTab] = React.useState<"upcoming" | "live" | "past">("upcoming");

  // Timer state ticking every minute to update remaining times and move meetings between tabs automatically
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    // Tick every minute (60,000 ms) to keep countdowns and tab status up to date
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Meetings state loaded from centralized store
  const [meetings, setMeetings] = React.useState<MockMeeting[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Load meetings and unread notifications count
  const loadData = () => {
    setMeetings(getMeetings());
    const user = mockUsers.find((u) => u.role === role) || mockUsers[0];
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

  // 2. Filter meetings for current user role:
  // - Student: sees meetings they are invited to
  // - Faculty: sees meetings they organized or are participating in
  // - Admin: sees all meetings
  const userMeetings = React.useMemo(() => {
    if (role === "student") {
      return meetings.filter((m) =>
        m.participants.some((p) => p.email === currentUser.email)
      );
    }
    if (role === "faculty") {
      return meetings.filter(
        (m) =>
          m.organizerEmail === currentUser.email ||
          m.participants.some((p) => p.email === currentUser.email)
      );
    }
    return meetings; // Admin sees all meetings
  }, [role, currentUser.email, meetings]);

  // 3. Categorize meetings into Upcoming, Live Now, and Past using full date AND time
  const upcomingMeetings = React.useMemo(() => {
    return userMeetings.filter(
      (m) => getMeetingStatus(m.date, m.startTime, m.endTime, m.status, now) === "upcoming"
    );
  }, [userMeetings, now]);

  const liveMeetings = React.useMemo(() => {
    return userMeetings.filter(
      (m) => getMeetingStatus(m.date, m.startTime, m.endTime, m.status, now) === "live"
    );
  }, [userMeetings, now]);

  const pastMeetings = React.useMemo(() => {
    return userMeetings.filter(
      (m) => getMeetingStatus(m.date, m.startTime, m.endTime, m.status, now) === "past"
    );
  }, [userMeetings, now]);

  // Determine meetings displayed in the current tab
  const displayedMeetings =
    activeTab === "live"
      ? liveMeetings
      : activeTab === "past"
      ? pastMeetings
      : upcomingMeetings;

  // 4. Handle Student Accept / Decline response
  const handleResponse = (meetingId: string, response: "accepted" | "declined") => {
    updateMeetingParticipantResponse(meetingId, currentUser.email, response);
    loadData(); // Reload meetings and notifications
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

            {/* Active Link: Meetings */}
            <Link
              href={`/meetings?role=${role}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Meetings</span>
            </Link>

            {/* Notifications link with unread count badge */}
            <Link
              href={`/notifications?role=${role}`}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-zinc-400" />
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
              Meetings & Hearings
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
        <main className="p-6 space-y-6">

          {/* Demo Role Switcher */}
          <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-700">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>
                <strong className="font-semibold text-zinc-900">Demo Role Switcher:</strong> Switch views to see Student response buttons, or Faculty/Admin schedule tools.
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

          {/* Header Action: Title & Schedule Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                {role === "student" && "My Scheduled Inquiries & Meetings"}
                {role === "faculty" && "Grievance Inquiry Meetings"}
                {role === "admin" && "Campus Inquiries & Disciplinary Hearings"}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {role === "student" && "Accept or decline hearing invitations related to your complaints."}
                {role === "faculty" && "Organize and coordinate grievance inquiry hearings with students."}
                {role === "admin" && "Monitor all campus inquiry sessions and committee meetings."}
              </p>
            </div>

            {/* "Schedule Meeting" button for Faculty and Admin only */}
            {role !== "student" && (
              <Link href={`/meetings/new?role=${role}`}>
                <Button className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs">
                  <PlusCircle className="w-4 h-4" />
                  <span>Schedule Meeting</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Upcoming vs Live Now vs Past Toggle Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-2">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "upcoming"
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Upcoming ({upcomingMeetings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("live")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "live"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === "live" ? "bg-white" : "bg-red-500"} animate-pulse`}></span>
              <span>Live Now ({liveMeetings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("past")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "past"
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Past ({pastMeetings.length})</span>
            </button>
          </div>

          {/* Meetings Cards List */}
          {displayedMeetings.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">
                {activeTab === "live"
                  ? "No meetings are live right now"
                  : activeTab === "upcoming"
                  ? "No upcoming meetings found"
                  : "No past meetings found"}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {activeTab === "live"
                  ? "Meetings currently in session will appear here automatically with a live timer and quick join link."
                  : role === "student"
                  ? `You have no ${activeTab} meeting invitations scheduled.`
                  : `There are currently no ${activeTab} meetings recorded for this view.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedMeetings.map((meeting) => {
                // Determine status and human-friendly time label using the full date & time
                const meetingStatus = getMeetingStatus(
                  meeting.date,
                  meeting.startTime,
                  meeting.endTime,
                  meeting.status,
                  now
                );
                const timeLabel = getMeetingTimeLabel(
                  meeting.date,
                  meeting.startTime,
                  meeting.endTime,
                  meeting.status,
                  now
                );

                // Find current user's participant entry (for student accept/decline)
                const userParticipant = meeting.participants.find(
                  (p) => p.email === currentUser.email
                );

                return (
                  <div
                    key={meeting.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-colors ${
                      meetingStatus === "live"
                        ? "border-red-300 ring-1 ring-red-200"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    {/* Top row: Title, Badges, Date & Time */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-100 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Live Indicator Badge */}
                          {meetingStatus === "live" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                              LIVE
                            </span>
                          )}
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                            Linked: {meeting.complaintRef}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Organized by {meeting.organizerName}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-900 mt-1">
                          {meeting.title}
                        </h3>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-xs font-bold text-zinc-900 flex items-center sm:justify-end gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>
                            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {meeting.date}
                        </div>
                        {/* Countdown or Status Label */}
                        <div
                          className={`text-[11px] font-semibold mt-1 sm:text-right ${
                            meetingStatus === "live"
                              ? "text-red-600"
                              : meetingStatus === "upcoming"
                              ? "text-amber-600"
                              : "text-zinc-400"
                          }`}
                        >
                          {timeLabel}
                        </div>
                      </div>
                    </div>

                    {/* Location & Online Link / Join Button */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600 items-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{meeting.location}</span>
                      </div>

                      {meeting.meetingUrl && (
                        <div className="flex items-center gap-2 sm:justify-end">
                          {meetingStatus === "live" ? (
                            <a
                              href={meeting.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join Meeting</span>
                              </Button>
                            </a>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-blue-500 shrink-0" />
                              <a
                                href={meeting.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate font-mono text-[11px]"
                              >
                                {meeting.meetingUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Participants & Response Section */}
                    <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* For Faculty/Admin: Show participant responses */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-zinc-500 block">
                          Participant Responses:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {meeting.participants.map((p, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-zinc-50 border border-zinc-200"
                            >
                              <span className="font-medium text-zinc-800">{p.name}</span>
                              {p.response === "accepted" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Accepted
                                </span>
                              )}
                              {p.response === "declined" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                  <XCircle className="w-3 h-3" />
                                  Declined
                                </span>
                              )}
                              {p.response === "pending" && (
                                meetingStatus === "past" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                                    <HelpCircle className="w-3 h-3 text-zinc-400" />
                                    No response
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                    <HelpCircle className="w-3 h-3" />
                                    Pending
                                  </span>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* For Students: Accept & Decline Actions (Read-only for Past meetings) */}
                      {role === "student" && userParticipant && (
                        <div className="flex items-center gap-2 shrink-0">
                          {meetingStatus === "past" ? (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Meeting ended</span>
                            </div>
                          ) : (
                            <>
                              <span className="text-xs text-zinc-500 mr-1">Your response:</span>
                              {userParticipant.response === "accepted" ? (
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Accepted
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResponse(meeting.id, "declined")}
                                    className="h-7 text-xs text-zinc-600 hover:text-red-600"
                                  >
                                    Change to Decline
                                  </Button>
                                </div>
                              ) : userParticipant.response === "declined" ? (
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-700 bg-red-100 border border-red-200 flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Declined
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResponse(meeting.id, "accepted")}
                                    className="h-7 text-xs text-zinc-600 hover:text-emerald-600"
                                  >
                                    Change to Accept
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleResponse(meeting.id, "accepted")}
                                    className="h-8 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResponse(meeting.id, "declined")}
                                    className="h-8 text-xs font-medium text-red-600 hover:bg-red-50 border-red-200 rounded-lg px-3"
                                  >
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
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
