"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import type { TAdminStudentListItem } from "@/modules/admin/types";

interface StudentsListProps {
  students: TAdminStudentListItem[];
  userName: string;
  userEmail: string;
  idNumber: string | null;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function StudentsList({
  students,
  userName,
  userEmail,
  idNumber,
}: StudentsListProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("all");

  const departments = React.useMemo(
    () =>
      Array.from(
        new Set(students.map((s) => s.department).filter((d): d is string => Boolean(d)))
      ).sort(),
    [students]
  );

  const filtered = React.useMemo(() => {
    return students.filter((s) => {
      if (departmentFilter !== "all" && s.department !== departmentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !s.fullName.toLowerCase().includes(q) &&
          !(s.email ?? "").toLowerCase().includes(q) &&
          !(s.enrollmentNo ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [students, departmentFilter, searchQuery]);

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
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <Bell className="w-4 h-4 text-zinc-400" />
              <span>Notifications</span>
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Administration
            </div>
            <Link
              href="/admin/students"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Manage Students</span>
            </Link>
            <Link
              href="/admin/faculty"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-zinc-400" />
              <span>Manage Faculty</span>
            </Link>

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
                  admin{idNumber ? ` (${idNumber})` : ""}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
            <h1 className="text-base font-bold text-zinc-900">Manage Students</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-700 capitalize border border-zinc-200">
              Admin View
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
          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Registered Students</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {students.length > 0
                ? `${students.length} student${students.length === 1 ? "" : "s"} registered, showing ${filtered.length} below.`
                : "Registered students and their enrollment details will appear here."}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Search */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name, email or enrollment no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Department */}
              <div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">No students found</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                      {searchQuery || departmentFilter !== "all"
                        ? "Try clearing your search query or changing filters."
                        : "No students are registered yet. New signups will appear here automatically."}
                    </p>
                  </div>
                  {(searchQuery || departmentFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setDepartmentFilter("all");
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
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Enrollment No</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Batch Year</th>
                      <th className="py-3 px-4 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {filtered.map((student) => (
                      <tr key={student.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-bold text-zinc-700">
                              {student.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-zinc-900">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-600">{student.email ?? "—"}</td>
                        <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                          {student.enrollmentNo ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700">
                            {student.department ?? "Unassigned"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {student.semester ? `Sem ${student.semester}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">{student.batchYear ?? "—"}</td>
                        <td className="py-3 px-4 text-zinc-400 whitespace-nowrap text-right">
                          {formatDate(student.createdAt)}
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
