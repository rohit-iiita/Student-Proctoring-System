"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";import { Label } from "@/components/ui/label";
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
  ArrowLeft,
  CheckCircle2,
  Paperclip,
  CheckCheck,
  MessageSquare,
  AlertCircle,
  FileIcon,
  ImageIcon,
  CalendarPlus,
} from "lucide-react";
import type { TComplaintDetail, TComplaintStatus, TFacultyOption } from "@/modules/complaints/types";
import type { TUserRole } from "@/modules/auth/types";
import {
  assignComplaintAction,
  updateComplaintAction,
} from "@/modules/complaints/actions";
import { createComplaintMeetingAction } from "@/modules/meetings/actions";

interface ComplaintDetailViewProps {
  complaint: TComplaintDetail | null;
  userRole: TUserRole;
  userName: string;
  userEmail: string;
  facultyOptions: TFacultyOption[];
}

function formatCategory(cat: string): string {
  const categories: Record<string, string> = {
    ragging_and_harassment: "Ragging & Harassment",
    ta: "TA",
    hostel: "Hostel",
    mess_and_food: "Mess & Food",
    discrimination_and_misconduct: "Discrimination & Misconduct",
  };
  return categories[cat] ?? cat;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileNameFromPath(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

function StatusBadge({ status }: { status: TComplaintStatus }) {
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
}

export default function ComplaintDetailView({
  complaint,
  userRole,
  userName,
  userEmail,
  facultyOptions,
}: ComplaintDetailViewProps) {
  const router = useRouter();

  // Admin Assignment State
  const [selectedFaculty, setSelectedFaculty] = React.useState<string>(
    facultyOptions[0]?.id ?? ""
  );
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [assignMessage, setAssignMessage] = React.useState("");
  const [assignError, setAssignError] = React.useState(false);

  // Faculty Review State (initialized from the server-provided complaint)
  const [reviewStatus, setReviewStatus] = React.useState<TComplaintStatus>(
    complaint
      ? complaint.status === "submitted"
        ? "under_review"
        : complaint.status
      : "under_review"
  );
  const [reviewNotes, setReviewNotes] = React.useState(
    complaint?.resolution ?? ""
  );
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateMessage, setUpdateMessage] = React.useState("");
  const [updateError, setUpdateError] = React.useState(false);

  // Admin: Schedule Meeting State
  const [meetingTitle, setMeetingTitle] = React.useState("");
  const [meetingDescription, setMeetingDescription] = React.useState("");
  const [meetingDate, setMeetingDate] = React.useState("");
  const [meetingStartTime, setMeetingStartTime] = React.useState("");
  const [meetingEndTime, setMeetingEndTime] = React.useState("");
  const [meetingLocation, setMeetingLocation] = React.useState("");
  const [meetingUrl, setMeetingUrl] = React.useState("");
  const [isSchedulingMeeting, setIsSchedulingMeeting] = React.useState(false);
  const [meetingMessage, setMeetingMessage] = React.useState("");
  const [meetingError, setMeetingError] = React.useState(false);

  const handleLogout = () => router.push("/login");

  // Admin: assign faculty
  const handleAdminAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedFaculty) return;

    setIsAssigning(true);
    setAssignMessage("");
    setAssignError(false);

    const response = await assignComplaintAction({
      complaintId: complaint.id,
      facultyId: selectedFaculty,
    });

    if (response.success) {
      setAssignMessage(
        `${response.message ?? "Complaint assigned successfully."}`
      );
      router.refresh();
    } else {
      setAssignError(true);
      setAssignMessage(response.message ?? "Failed to assign complaint.");
    }
    setIsAssigning(false);
  };

  // Faculty: update status & notes
  const handleFacultyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setUpdateMessage("");
    setUpdateError(false);

    const response = await updateComplaintAction({
      complaintId: complaint.id,
      status: reviewStatus,
      resolution: reviewNotes.trim() || null,
    });

    if (response.success) {
      setUpdateMessage(response.message ?? "Complaint updated successfully.");
      router.refresh();
    } else {
      setUpdateError(true);
      setUpdateMessage(response.message ?? "Failed to update complaint.");
    }
    setIsUpdating(false);
  };

  // Admin: schedule a meeting for this complaint
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setMeetingMessage("");
    setMeetingError(false);

    setIsSchedulingMeeting(true);

    const response = await createComplaintMeetingAction({
      complaintId: complaint.id,
      title: meetingTitle.trim(),
      description: meetingDescription.trim() || undefined,
      startsAt: new Date(`${meetingDate}T${meetingStartTime}`).toISOString(),
      endsAt: new Date(`${meetingDate}T${meetingEndTime}`).toISOString(),
      location: meetingLocation.trim() || undefined,
      meetingUrl: meetingUrl.trim() || undefined,
    });

    if (response.success) {
      setMeetingMessage(response.message ?? "Meeting scheduled successfully.");
      setMeetingTitle("");
      setMeetingDescription("");
      setMeetingDate("");
      setMeetingStartTime("");
      setMeetingEndTime("");
      setMeetingLocation("");
      setMeetingUrl("");
      router.refresh();
    } else {
      setMeetingError(true);
      setMeetingMessage(response.message ?? "Failed to schedule the meeting.");
    }
    setIsSchedulingMeeting(false);
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
                Complaint &amp; Exam System
              </div>
            </div>
          </div>

          {/* Navigation Links */}
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
              href="/complaints"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-base font-bold text-zinc-900">
              Complaint Details
            </h1>
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

        {/* Page Body */}
        <main className="p-6 max-w-4xl space-y-6">
          {/* If complaint not found */}
          {!complaint ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-zinc-900">
                Complaint Not Found
              </h2>
              <p className="text-xs text-zinc-500">
                The requested complaint could not be found in our records.
              </p>
              <Link href="/complaints">
                <Button variant="outline" className="text-xs mt-2">
                  Return to Complaints List
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Success / Error Notification */}
              {(assignMessage || updateMessage || meetingMessage) && (
                <div
                  className={`p-3.5 text-xs rounded-xl flex items-center gap-2 font-medium border ${
                    assignError || updateError || meetingError
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}
                >
                  {assignError || updateError || meetingError ? (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{assignMessage || updateMessage || meetingMessage}</span>
                </div>
              )}

              {/* Complaint Header Card */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-zinc-900">
                        {complaint.referenceId}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700">
                        {formatCategory(complaint.category)}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-zinc-900 mt-1">
                      {complaint.subject}
                    </h2>
                  </div>
                  <div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">
                      Submitted By
                    </span>
                    <span className="font-semibold text-zinc-800">
                      {complaint.studentName ?? "Unknown Student"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">
                      Date Submitted
                    </span>
                    <span className="font-semibold text-zinc-800">
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">
                      Assigned Faculty
                    </span>
                    <span className="font-semibold text-zinc-800">
                      {complaint.assignedFacultyName ?? "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">
                      {complaint.resolvedAt ? "Resolved On" : "Last Updated"}
                    </span>
                    <span className="font-semibold text-zinc-800">
                      {complaint.resolvedAt
                        ? formatDate(complaint.resolvedAt)
                        : "—"}
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

                {/* Attachments Section */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-zinc-500" />
                    Attached Evidence Files
                  </span>

                  {complaint.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {complaint.attachments.map((att) => {
                        const name = fileNameFromPath(att.filePath);
                        const isPdf = name.toLowerCase().endsWith(".pdf");
                        return (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {isPdf ? (
                                <FileIcon className="w-4 h-4 text-red-500 shrink-0" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                              )}
                              <span className="font-medium text-zinc-900 truncate">
                                {name}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-md font-mono shrink-0">
                              {formatBytes(att.fileSize)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs text-zinc-400 italic">
                      No attachments were uploaded with this complaint.
                    </div>
                  )}
                </div>

                {/* Existing Resolution Notes */}
                {complaint.resolution && (
                  <div className="pt-2 border-t border-zinc-100">
                    <span className="text-xs font-semibold text-zinc-900 block mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                      Resolution &amp; Review Notes
                    </span>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                      {complaint.resolution}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= ROLE-BASED ACTION PANELS ================= */}

              {/* 1. ADMIN PANEL: Assign to Faculty */}
              {userRole === "admin" && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <Briefcase className="w-4 h-4 text-zinc-700" />
                    <h3 className="text-sm font-bold text-zinc-900">
                      Administrative Action: Assign Faculty
                    </h3>
                  </div>

                  {facultyOptions.length === 0 ? (
                    <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs text-zinc-400 italic">
                      No faculty members are registered yet. Add faculty accounts
                      before assigning complaints.
                    </div>
                  ) : (
                    <form onSubmit={handleAdminAssign} className="space-y-4 max-w-md">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="assign-faculty"
                          className="text-xs font-medium text-zinc-700"
                        >
                          Select Investigating Faculty Member
                        </Label>
                        <select
                          id="assign-faculty"
                          value={selectedFaculty}
                          onChange={(e) => setSelectedFaculty(e.target.value)}
                          className="w-full h-9 rounded-lg border border-input bg-white px-3 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer"
                        >
                          {facultyOptions.map((fac) => (
                            <option key={fac.id} value={fac.id}>
                              {fac.fullName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        type="submit"
                        disabled={isAssigning}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-5 py-2 rounded-xl"
                      >
                        {isAssigning ? "Saving Assignment..." : "Save Faculty Assignment"}
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* 2. ADMIN PANEL: Schedule Meeting */}
              {userRole === "admin" && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <CalendarPlus className="w-4 h-4 text-zinc-700" />
                    <h3 className="text-sm font-bold text-zinc-900">
                      Administrative Action: Schedule Meeting
                    </h3>
                  </div>

                  {complaint.status === "resolved" || complaint.status === "rejected" ? (
                    <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs text-zinc-400 italic">
                      This complaint is {complaint.status}. Meetings can only be
                      scheduled for open complaints.
                    </div>
                  ) : (
                    <form onSubmit={handleScheduleMeeting} className="space-y-4 max-w-lg">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="meeting-title"
                          className="text-xs font-medium text-zinc-700"
                        >
                          Meeting Title
                        </Label>
                        <Input
                          id="meeting-title"
                          type="text"
                          placeholder="e.g. Complaint Discussion — Hostel Issue"
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                          required
                          minLength={3}
                          maxLength={120}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="meeting-description"
                          className="text-xs font-medium text-zinc-700"
                        >
                          Agenda / Description (optional)
                        </Label>
                        <textarea
                          id="meeting-description"
                          rows={3}
                          placeholder="What will be discussed in this meeting..."
                          value={meetingDescription}
                          onChange={(e) => setMeetingDescription(e.target.value)}
                          maxLength={1000}
                          className="w-full rounded-lg border border-input bg-transparent p-3 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="meeting-date"
                            className="text-xs font-medium text-zinc-700"
                          >
                            Date
                          </Label>
                          <Input
                            id="meeting-date"
                            type="date"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                            required
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="meeting-start"
                            className="text-xs font-medium text-zinc-700"
                          >
                            Starts At
                          </Label>
                          <Input
                            id="meeting-start"
                            type="time"
                            value={meetingStartTime}
                            onChange={(e) => setMeetingStartTime(e.target.value)}
                            required
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="meeting-end"
                            className="text-xs font-medium text-zinc-700"
                          >
                            Ends At
                          </Label>
                          <Input
                            id="meeting-end"
                            type="time"
                            value={meetingEndTime}
                            onChange={(e) => setMeetingEndTime(e.target.value)}
                            required
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="meeting-location"
                            className="text-xs font-medium text-zinc-700"
                          >
                            Location (if in-person)
                          </Label>
                          <Input
                            id="meeting-location"
                            type="text"
                            placeholder="e.g. Conference Room 1"
                            value={meetingLocation}
                            onChange={(e) => setMeetingLocation(e.target.value)}
                            maxLength={200}
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="meeting-url"
                            className="text-xs font-medium text-zinc-700"
                          >
                            Meeting Link (if online)
                          </Label>
                          <Input
                            id="meeting-url"
                            type="url"
                            placeholder="https://meet.google.com/..."
                            value={meetingUrl}
                            onChange={(e) => setMeetingUrl(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-500">
                        All related parties — the complaint creator, students
                        against whom the complaint was filed, the assigned
                        faculty, and other admins — will be added as
                        participants and notified by email and in-app
                        notification.
                      </p>

                      <Button
                        type="submit"
                        disabled={isSchedulingMeeting}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-5 py-2 rounded-xl"
                      >
                        {isSchedulingMeeting
                          ? "Scheduling Meeting..."
                          : "Schedule Meeting & Notify"}
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* 3. FACULTY PANEL: Update Status & Resolution Notes */}
              {userRole === "faculty" && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <CheckCheck className="w-4 h-4 text-zinc-700" />
                    <h3 className="text-sm font-bold text-zinc-900">
                      Faculty Investigation &amp; Resolution
                    </h3>
                  </div>

                  <form onSubmit={handleFacultyUpdate} className="space-y-4 max-w-lg">
                    {/* Status Dropdown */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="review-status"
                        className="text-xs font-medium text-zinc-700"
                      >
                        Update Status
                      </Label>
                      <select
                        id="review-status"
                        value={reviewStatus}
                        onChange={(e) =>
                          setReviewStatus(e.target.value as TComplaintStatus)
                        }
                        className="w-full h-9 rounded-lg border border-input bg-white px-3 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer"
                      >
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Resolution / Rejection Notes */}
                    <div className="space-y-1">
                      <Label
                        htmlFor="review-notes"
                        className="text-xs font-medium text-zinc-700"
                      >
                        Investigation Findings &amp; Resolution Notes
                      </Label>
                      <textarea
                        id="review-notes"
                        rows={4}
                        placeholder="Explain steps taken, hearing outcomes, or reason for resolution/rejection..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="w-full rounded-lg border border-input bg-transparent p-3 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400"
                      />
                      {(reviewStatus === "resolved" ||
                        reviewStatus === "rejected") && (
                        <p className="text-[11px] text-zinc-500">
                          A resolution note or rejection reason is required to
                          save this status.
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-5 py-2 rounded-xl"
                    >
                      {isUpdating ? "Updating Complaint..." : "Save Status & Notes"}
                    </Button>
                  </form>
                </div>
              )}

              {/* 4. STUDENT VIEW: Read-Only message */}
              {userRole === "student" && (
                <div className="p-4 bg-zinc-100 rounded-xl text-xs text-zinc-600 flex items-center justify-between gap-3">
                  <span>
                    This complaint is under review by campus administration. You
                    will be notified when the assigned faculty updates this case.
                  </span>
                  <Link href="/complaints">
                    <Button variant="outline" size="sm" className="text-xs shrink-0">
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
