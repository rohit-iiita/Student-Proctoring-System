"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  mockUsers,
  mockComplaints,
  complaintCategories,
  MockUser,
  MockComplaint,
} from "@/lib/mock-data";
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
  PlusCircle,
  Search,
  Filter,
  Eye,
  Info,
  Inbox,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

export default function ComplaintsListPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading complaints...</div>}>
      <ComplaintsListContent />
    </React.Suspense>
  );
}

function ComplaintsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Read role from URL query param, default to "student"
  const initialRole = (searchParams.get("role") as UserRole) || "student";
  const [role, setRole] = React.useState<UserRole>(initialRole);

  React.useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam && (roleParam === "student" || roleParam === "faculty" || roleParam === "admin")) {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Current logged-in mock user
  const currentUser: MockUser =
    mockUsers.find((u) => u.role === role) || mockUsers[0];

  // 2. Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  // 3. Filter complaints based on user's role:
  // - Student: sees only their own complaints
  // - Faculty: sees only complaints assigned to them
  // - Admin: sees all complaints
  const baseComplaints: MockComplaint[] = React.useMemo(() => {
    if (role === "student") {
      return mockComplaints.filter((c) => c.studentName === currentUser.name);
    }
    if (role === "faculty") {
      return mockComplaints.filter((c) => c.assignedFaculty === currentUser.name);
    }
    return mockComplaints;
  }, [role, currentUser.name]);

  // 4. Apply search query, status filter, and category filter
  const filteredComplaints = React.useMemo(() => {
    return baseComplaints.filter((c) => {
      // Status filter
      if (statusFilter !== "all" && c.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== "all" && c.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      // Search query (matches reference number or subject)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesRef = c.refNumber.toLowerCase().includes(query);
        const matchesSubject = c.subject.toLowerCase().includes(query);
        if (!matchesRef && !matchesSubject) {
          return false;
        }
      }
      return true;
    });
  }, [baseComplaints, statusFilter, categoryFilter, searchQuery]);

  const handleLogout = () => {
    router.push("/login");
  };

  // Helper to render colored status badge
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

            {/* Active Link: Complaints */}
            <Link
              href={`/complaints?role=${role}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white transition-colors"
            >
              <FileText className="w-4 h-4" />
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
              Complaints Management
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

          {/* Demo Role Switcher Banner */}
          <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-700">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>
                <strong className="font-semibold text-zinc-900">Demo Role Switcher:</strong> Switch views to see Student, Faculty, or Admin complaint lists.
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

          {/* Header Action: Title & Student "Raise New Complaint" Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                {role === "student" && "My Complaints & Grievances"}
                {role === "faculty" && "Complaints Assigned for Review"}
                {role === "admin" && "All University Complaints"}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {role === "student" && "Track the progress and review outcomes of grievances you submitted."}
                {role === "faculty" && "Investigate student grievances assigned to you and provide resolutions."}
                {role === "admin" && "Oversee all student grievances and assign them to faculty members."}
              </p>
            </div>

            {/* "Raise New Complaint" button - STUDENTS ONLY */}
            {role === "student" && (
              <Link href={`/complaints/new?role=${role}`}>
                <Button className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs">
                  <PlusCircle className="w-4 h-4" />
                  <span>Raise New Complaint</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Filter Bar (Search, Status Filter, Category Filter) */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Search Box */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search ref # or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {complaintCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              {filteredComplaints.length === 0 ? (
                /* Friendly empty state */
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                      No complaints found
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                      {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                        ? "Try clearing your search query or changing filters."
                        : role === "student"
                        ? "You have not raised any complaints yet. Click 'Raise New Complaint' above if you need help."
                        : "No complaints assigned to this role currently."}
                    </p>
                  </div>
                  {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setCategoryFilter("all");
                      }}
                      className="text-xs mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                /* Complaints Table Rows */
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Subject</th>
                      {role === "admin" && <th className="py-3 px-4">Student</th>}
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {filteredComplaints.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                          {item.refNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium max-w-xs truncate text-zinc-900">
                          {item.subject}
                        </td>
                        {role === "admin" && (
                          <td className="py-3 px-4 text-zinc-600">
                            {item.studentName}
                          </td>
                        )}
                        <td className="py-3 px-4 text-zinc-600">
                          {item.assignedFaculty}
                        </td>
                        <td className="py-3 px-4">
                          {renderStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                          {item.createdAt}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/complaints/${item.id}?role=${role}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2.5 rounded-lg text-zinc-700 hover:text-zinc-900"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
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
