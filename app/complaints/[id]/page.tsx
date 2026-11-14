"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  mockUsers,
  mockComplaints,
  availableFaculty,
  MockUser,
  MockComplaint,
} from "@/lib/mock-data";
import { Label } from "@/components/ui/label";
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
  ArrowLeft,
  CheckCircle2,
  Paperclip,
  Users,
  Building,
  CalendarDays,
  FileClock,
  CheckCheck,
  MessageSquare,
  AlertCircle,
  Info,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

export default function ComplaintDetailsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading complaint...</div>}>
      <ComplaintDetailsContent />
    </React.Suspense>
  );
}

function ComplaintDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  // 1. Read role from URL query, default to "student"
  const initialRole = (searchParams.get("role") as UserRole) || "student";
  const [role, setRole] = React.useState<UserRole>(initialRole);

  React.useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam && (roleParam === "student" || roleParam === "faculty" || roleParam === "admin")) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const currentUser: MockUser =
    mockUsers.find((u) => u.role === role) || mockUsers[0];

  // 2. Locate complaint from route param id (e.g. "c1", "c2")
  const complaintId = params?.id as string;
  const initialComplaint = mockComplaints.find(
    (c) => c.id === complaintId || c.refNumber.toLowerCase() === complaintId?.toLowerCase()
  );

  // 3. Complaint state (for updates by Faculty or Admin)
  const [complaint, setComplaint] = React.useState<MockComplaint | undefined>(initialComplaint);

  // Admin Assignment State
  const [selectedFaculty, setSelectedFaculty] = React.useState(
    complaint?.assignedFaculty === "Unassigned" ? availableFaculty[0] : complaint?.assignedFaculty || availableFaculty[0]
  );

  // Faculty Review State
  const [reviewStatus, setReviewStatus] = React.useState<MockComplaint["status"]>(
    complaint?.status === "submitted" ? "under_review" : complaint?.status || "under_review"
  );
  const [reviewNotes, setReviewNotes] = React.useState(complaint?.notes || "");

  // Feedback states
  const [notesError, setNotesError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // 4. Handle Admin faculty assignment
  const handleAdminAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setIsSaving(true);
    setSuccessMessage("");

    // Simulate saving assignment to database
    setTimeout(() => {
      complaint.assignedFaculty = selectedFaculty;
      // If status was submitted, move it to under review
      if (complaint.status === "submitted") {
        complaint.status = "under_review";
      }

      setComplaint({ ...complaint });
      setIsSaving(false);
      setSuccessMessage(`Complaint assigned to ${selectedFaculty} successfully!`);
    }, 500);
  };

  // 5. Handle Faculty status update & notes
  const handleFacultyUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setNotesError("");
    setSuccessMessage("");

    // Validation: Resolution note or rejection reason required when closing complaint
    if ((reviewStatus === "resolved" || reviewStatus === "rejected") && !reviewNotes.trim()) {
      setNotesError("A resolution note or rejection reason is required when choosing Resolved or Rejected.");
      return;
    }

    setIsSaving(true);

    // Simulate updating complaint in database
    setTimeout(() => {
      complaint.status = reviewStatus;
      complaint.notes = reviewNotes.trim();

      setComplaint({ ...complaint });
      setIsSaving(false);
      setSuccessMessage(`Complaint status updated to "${reviewStatus.replace('_', ' ').toUpperCase()}" successfully!`);
    }, 500);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  // Helper for status badge
  const renderStatusBadge = (status: MockComplaint["status"]) => {
    switch (status) {
      case "submitted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Submitted
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Under Review
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
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
            <Link
              href={`/complaints?role=${role}`}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-base font-bold text-zinc-900">
              Complaint Details
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
                <strong className="font-semibold text-zinc-900">Demo Role Switcher:</strong> Switch role to test Student (read-only), Admin (assign faculty), or Faculty (update status & notes).
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

          {/* If complaint not found */}
          {!complaint ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-zinc-900">Complaint Not Found</h2>
              <p className="text-xs text-zinc-500">
                The requested complaint could not be found in our records.
              </p>
              <Link href={`/complaints?role=${role}`}>
                <Button variant="outline" className="text-xs mt-2">
                  Return to Complaints List
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Success Notification */}
              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Complaint Header Card */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-zinc-900">
                        {complaint.refNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700">
                        {complaint.category}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-zinc-900 mt-1">
                      {complaint.subject}
                    </h2>
                  </div>
                  <div>{renderStatusBadge(complaint.status)}</div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Submitted By</span>
                    <span className="font-semibold text-zinc-800">{complaint.studentName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Date Submitted</span>
                    <span className="font-semibold text-zinc-800">{complaint.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Assigned Faculty</span>
                    <span className="font-semibold text-zinc-800">{complaint.assignedFaculty}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Respondent(s)</span>
                    <span className="font-semibold text-zinc-800">
                      {complaint.respondents || "None specified"}
                    </span>
                  </div>
                </div>

                {/* Description Box */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-700 block mb-1">
                    Grievance Description
                  </span>
                  <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {complaint.description}
                  </div>
                </div>

                {/* Attachment Section */}
                <div className="pt-1 flex items-center gap-2 text-xs text-zinc-600">
                  <Paperclip className="w-4 h-4 text-zinc-400" />
                  <span className="font-medium text-zinc-700">Attachment:</span>
                  {complaint.attachmentName ? (
                    <span className="font-mono text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
                      {complaint.attachmentName}
                    </span>
                  ) : (
                    <span className="text-zinc-400 italic">No attachment provided</span>
                  )}
                </div>

                {/* Existing Resolution Notes */}
                {complaint.notes && (
                  <div className="pt-2 border-t border-zinc-100">
                    <span className="text-xs font-semibold text-zinc-900 block mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                      Resolution & Review Notes
                    </span>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 leading-relaxed">
                      {complaint.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= ROLE-BASED ACTION PANELS ================= */}

              {/* 1. ADMIN PANEL: Assign to Faculty */}
              {role === "admin" && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <Briefcase className="w-4 h-4 text-zinc-700" />
                    <h3 className="text-sm font-bold text-zinc-900">
                      Administrative Action: Assign Faculty
                    </h3>
                  </div>

                  <form onSubmit={handleAdminAssign} className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <Label htmlFor="assign-faculty" className="text-xs font-medium text-zinc-700">
                        Select Investigating Faculty Member
                      </Label>
                      <select
                        id="assign-faculty"
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        className="w-full h-9 rounded-lg border border-input bg-white px-3 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer"
                      >
                        {availableFaculty.map((fac) => (
                          <option key={fac} value={fac}>
                            {fac}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-5 py-2 rounded-xl"
                    >
                      {isSaving ? "Saving Assignment..." : "Save Faculty Assignment"}
                    </Button>
                  </form>
                </div>
              )}

              {/* 2. FACULTY PANEL: Update Status & Resolution Notes */}
              {role === "faculty" && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <CheckCheck className="w-4 h-4 text-zinc-700" />
                    <h3 className="text-sm font-bold text-zinc-900">
                      Faculty Investigation & Resolution
                    </h3>
                  </div>

                  <form onSubmit={handleFacultyUpdate} className="space-y-4 max-w-lg">
                    {/* Status Dropdown */}
                    <div className="space-y-1.5">
                      <Label htmlFor="review-status" className="text-xs font-medium text-zinc-700">
                        Update Status
                      </Label>
                      <select
                        id="review-status"
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value as MockComplaint["status"])}
                        className="w-full h-9 rounded-lg border border-input bg-white px-3 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer"
                      >
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Resolution / Rejection Notes */}
                    <div className="space-y-1">
                      <Label htmlFor="review-notes" className="text-xs font-medium text-zinc-700">
                        Investigation Findings & Resolution Notes
                      </Label>
                      <textarea
                        id="review-notes"
                        rows={4}
                        placeholder="Explain steps taken, hearing outcomes, or reason for resolution/rejection..."
                        value={reviewNotes}
                        onChange={(e) => {
                          setReviewNotes(e.target.value);
                          if (notesError) setNotesError("");
                        }}
                        className={`w-full rounded-lg border bg-transparent p-3 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 ${
                          notesError ? "border-red-500" : "border-input"
                        }`}
                      />
                      {notesError && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{notesError}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-5 py-2 rounded-xl"
                    >
                      {isSaving ? "Updating Complaint..." : "Save Status & Notes"}
                    </Button>
                  </form>
                </div>
              )}

              {/* 3. STUDENT VIEW: Read-Only message */}
              {role === "student" && (
                <div className="p-4 bg-zinc-100 rounded-xl text-xs text-zinc-600 flex items-center justify-between">
                  <span>
                    This complaint is under review by campus administration. You will be notified when the assigned faculty updates this case.
                  </span>
                  <Link href={`/complaints?role=student`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Back to Complaints
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
