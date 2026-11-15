"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  mockUsers,
  getComplaints,
  mockMeetings,
  MockUser,
  MockComplaint,
} from "@/lib/mock-data";
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
  AlertCircle,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Info,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

// Main Dashboard Component with Suspense wrapper to handle URL query parameters cleanly
export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading dashboard...</div>}>
      <DashboardContent />
    </React.Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Read role from URL query param (e.g. /dashboard?role=faculty), default to "student"
  const initialRole = (searchParams.get("role") as UserRole) || "student";
  const [role, setRole] = React.useState<UserRole>(initialRole);

  // Centralized complaints list loaded from shared store (lib/mock-data.ts)
  const [allComplaints, setAllComplaints] = React.useState<MockComplaint[]>([]);

  // 2. Load latest complaints on mount and when role changes
  React.useEffect(() => {
    setAllComplaints(getComplaints());
  }, []);

  // Sync state if URL query param changes
  React.useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam && (roleParam === "student" || roleParam === "faculty" || roleParam === "admin")) {
      setRole(roleParam);
      // Refresh complaints from shared store
      setAllComplaints(getComplaints());
    }
  }, [searchParams]);

  // 3. Find current logged-in mock user based on selected role
  const currentUser: MockUser =
    mockUsers.find((u) => u.role === role) || mockUsers[0];

  // 4. Handle logout: clear and redirect back to /login
  const handleLogout = () => {
    router.push("/login");
  };

  // 5. Filter complaints strictly according to the role from the shared store:
  // - Student: sees only complaints raised by this student
  // - Faculty: sees only complaints assigned to this faculty
  // - Admin: sees all complaints across the institution
  const roleComplaints: MockComplaint[] = React.useMemo(() => {
    if (role === "student") {
      return allComplaints.filter((c) => c.studentName === currentUser.name);
    }
    if (role === "faculty") {
      return allComplaints.filter((c) => c.assignedFaculty === currentUser.name);
    }
    return allComplaints; // Admin sees all complaints
  }, [role, currentUser.name, allComplaints]);

  // 6. Calculate statistics for summary cards (consistent with the table data)
  // Student statistics
  const studentTotal = roleComplaints.length;
  const studentUnresolved = roleComplaints.filter(
    (c) => c.status === "submitted" || c.status === "under_review"
  ).length;
  const studentResolved = roleComplaints.filter(
    (c) => c.status === "resolved"
  ).length;

  // Faculty statistics
  const facultyAssigned = roleComplaints.length;
  const facultyPending = roleComplaints.filter(
    (c) => c.status === "under_review"
  ).length;
  const facultyResolved = roleComplaints.filter(
    (c) => c.status === "resolved"
  ).length;
  const facultyUpcomingMeetings = mockMeetings.filter(
    (m) => m.facultyName === currentUser.name && m.status === "scheduled"
  ).length;

  // Admin statistics
  const adminTotal = roleComplaints.length;
  const adminSubmitted = roleComplaints.filter((c) => c.status === "submitted").length;
  const adminUnderReview = roleComplaints.filter((c) => c.status === "under_review").length;
  const adminResolved = roleComplaints.filter((c) => c.status === "resolved").length;
  const adminRejected = roleComplaints.filter((c) => c.status === "rejected").length;
  const registeredStudentsCount = 120; // Demo student count
  const registeredFacultyCount = 18;   // Demo faculty count

  // 7. Recent complaints shown in the table (matches roleComplaints exactly)
  const displayedComplaints = roleComplaints.slice(0, 5);

  // Helper function to render status badges with clear colors
  const renderStatusBadge = (status: MockComplaint["status"]) => {
    switch (status) {
      case "submitted":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Submitted
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Under Review
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      
      {/* ===================== SIDEBAR ===================== */}
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

          {/* Demo Role Switcher Banner */}
          <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-700">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>
                <strong className="font-semibold text-zinc-900">Demo Role Switcher:</strong> Switch views to inspect Student, Faculty, or Admin dashboards.
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

          {/* ===================== SUMMARY CARDS ===================== */}

          {/* 1. STUDENT SUMMARY CARDS */}
          {role === "student" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Total Complaints Raised</span>
                  <div className="p-2 bg-zinc-100 rounded-xl text-zinc-700">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-900 mt-2">{studentTotal}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Grievances registered by you</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Unresolved Complaints</span>
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-600 mt-2">{studentUnresolved}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Submitted or under review</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Resolved Complaints</span>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-600 mt-2">{studentResolved}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Successfully addressed</div>
              </div>
            </div>
          )}

          {/* 2. FACULTY SUMMARY CARDS */}
          {role === "faculty" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Assigned Complaints</span>
                  <div className="p-2 bg-zinc-100 rounded-xl text-zinc-700">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-900 mt-2">{facultyAssigned}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Complaints assigned to you</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Pending Review</span>
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-2">{facultyPending}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Awaiting your resolution</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Resolved by You</span>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-600 mt-2">{facultyResolved}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Completed investigations</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Upcoming Meetings</span>
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600 mt-2">{facultyUpcomingMeetings}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Scheduled with students</div>
              </div>
            </div>
          )}

          {/* 3. ADMIN SUMMARY CARDS */}
          {role === "admin" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-medium text-zinc-500 block">Total</span>
                <div className="text-xl font-bold text-zinc-900 mt-1">{adminTotal}</div>
                <span className="text-[10px] text-zinc-400">Complaints</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-medium text-amber-700 block">Submitted</span>
                <div className="text-xl font-bold text-amber-600 mt-1">{adminSubmitted}</div>
                <span className="text-[10px] text-zinc-400">Unassigned</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-medium text-blue-700 block">Under Review</span>
                <div className="text-xl font-bold text-blue-600 mt-1">{adminUnderReview}</div>
                <span className="text-[10px] text-zinc-400">Investigating</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-medium text-emerald-700 block">Resolved</span>
                <div className="text-xl font-bold text-emerald-600 mt-1">{adminResolved}</div>
                <span className="text-[10px] text-zinc-400">Closed</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-medium text-zinc-700 block">Rejected</span>
                <div className="text-xl font-bold text-zinc-600 mt-1">{adminRejected}</div>
                <span className="text-[10px] text-zinc-400">Invalid</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-medium text-zinc-500 block">Students</span>
                <div className="text-xl font-bold text-zinc-900 mt-1">{registeredStudentsCount}</div>
                <span className="text-[10px] text-zinc-400">Registered</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[11px] font-medium text-zinc-500 block">Faculty</span>
                <div className="text-xl font-bold text-zinc-900 mt-1">{registeredFacultyCount}</div>
                <span className="text-[10px] text-zinc-400">Registered</span>
              </div>
            </div>
          )}

          {/* ===================== RECENT COMPLAINTS TABLE ===================== */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  {role === "student" && "Your Recent Complaints (Raised by you)"}
                  {role === "faculty" && "Assigned Complaints (Under your review)"}
                  {role === "admin" && "Recent Complaints (System-wide overview)"}
                </h2>
                <p className="text-xs text-zinc-500">
                  {role === "student" && `Showing complaints submitted under your student account (${displayedComplaints.length} total)`}
                  {role === "faculty" && `Showing grievances assigned to Dr. Sarah Smith (${displayedComplaints.length} total)`}
                  {role === "admin" && `Showing the most recent complaints across the university (${displayedComplaints.length} total)`}
                </p>
              </div>
              <Link
                href={`/complaints?role=${role}`}
                className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 underline"
              >
                View all complaints &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              {displayedComplaints.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No complaints found for this role.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Subject</th>
                      {role === "admin" && <th className="py-3 px-4">Student</th>}
                      {role === "student" && <th className="py-3 px-4">Assigned To</th>}
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {displayedComplaints.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                          {item.refNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium max-w-xs truncate text-zinc-800">
                          {item.subject}
                        </td>
                        {role === "admin" && (
                          <td className="py-3 px-4 text-zinc-600">
                            {item.studentName}
                          </td>
                        )}
                        {role === "student" && (
                          <td className="py-3 px-4 text-zinc-600">
                            {item.assignedFaculty}
                          </td>
                        )}
                        <td className="py-3 px-4">
                          {renderStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                          {item.createdAt}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/complaints/${item.id}?role=${role}`}>
                            <span className="text-xs font-semibold text-zinc-900 hover:underline cursor-pointer">
                              View
                            </span>
                          </Link>
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
