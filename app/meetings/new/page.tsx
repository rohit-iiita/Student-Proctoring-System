"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  mockUsers,
  getComplaints,
  addMeeting,
  getUnreadNotificationCount,
  MockUser,
  MockComplaint,
  MockMeeting,
  MeetingParticipant,
} from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertTriangle,
  Clock,
  MapPin,
  Video,
  Users,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

export default function NewMeetingPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading form...</div>}>
      <NewMeetingContent />
    </React.Suspense>
  );
}

function NewMeetingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Role state from URL query, default to "faculty"
  const role = (searchParams.get("role") as UserRole) || "faculty";
  const currentUser: MockUser =
    mockUsers.find((u) => u.role === role) || mockUsers[1];

  // 2. Complaints list for dropdown
  const [complaints, setComplaints] = React.useState<MockComplaint[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    setComplaints(getComplaints());
    setUnreadCount(getUnreadNotificationCount(currentUser.email));
  }, [currentUser]);

  // Filter for open complaints only:
  // - Only complaints with status "submitted" or "under_review" are eligible.
  // - Resolved and Rejected complaints are excluded.
  // - Faculty sees only open complaints assigned to them.
  // - Admin sees all open complaints.
  const openComplaints = React.useMemo(() => {
    return complaints.filter((c) => {
      const isOpen = c.status === "submitted" || c.status === "under_review";
      if (!isOpen) return false;
      if (role === "faculty") {
        return c.assignedFaculty === currentUser.name;
      }
      return true; // Admin sees all open complaints
    });
  }, [complaints, role, currentUser.name]);

  const hasNoOpenComplaints = openComplaints.length === 0;

  // 3. Form input states
  const [selectedComplaintRef, setSelectedComplaintRef] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [selectedParticipantEmails, setSelectedParticipantEmails] = React.useState<string[]>([]);
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [meetingUrl, setMeetingUrl] = React.useState("");

  // 4. Field-level error states
  const [complaintError, setComplaintError] = React.useState("");
  const [titleError, setTitleError] = React.useState("");
  const [participantsError, setParticipantsError] = React.useState("");
  const [dateError, setDateError] = React.useState("");
  const [startTimeError, setStartTimeError] = React.useState("");
  const [endTimeError, setEndTimeError] = React.useState("");
  const [locationError, setLocationError] = React.useState("");
  const [urlError, setUrlError] = React.useState("");

  // 5. Status states
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [createdMeetingTitle, setCreatedMeetingTitle] = React.useState("");

  // Available participants list (students and other faculty)
  const candidateParticipants = React.useMemo(() => {
    return mockUsers.filter((u) => u.email !== currentUser.email);
  }, [currentUser.email]);

  // Toggle participant checkbox
  const handleToggleParticipant = (email: string) => {
    setSelectedParticipantEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
    if (participantsError) setParticipantsError("");
  };

  // 6. Form validation logic
  const validateForm = () => {
    let isValid = true;

    // Reset all field errors first
    setComplaintError("");
    setTitleError("");
    setParticipantsError("");
    setDateError("");
    setStartTimeError("");
    setEndTimeError("");
    setLocationError("");
    setUrlError("");

    // Validate Complaint selection
    if (!selectedComplaintRef.trim()) {
      setComplaintError("Please link this meeting to a complaint.");
      isValid = false;
    } else {
      // Second check on submit: Ensure the selected complaint is still open (Submitted or Under Review)
      // NOTE: In production, the backend API / database trigger must repeat this validation check later to prevent race conditions.
      const freshComplaints = getComplaints();
      const linkedComplaint = freshComplaints.find(
        (c) => c.refNumber === selectedComplaintRef
      );

      if (!linkedComplaint) {
        setComplaintError("Selected complaint not found.");
        isValid = false;
      } else if (
        linkedComplaint.status !== "submitted" &&
        linkedComplaint.status !== "under_review"
      ) {
        setComplaintError(
          "This complaint is no longer open. Meetings can only be scheduled for complaints that are Submitted or Under Review."
        );
        isValid = false;
      } else if (
        role === "faculty" &&
        linkedComplaint.assignedFaculty !== currentUser.name
      ) {
        setComplaintError(
          "You can only schedule meetings for complaints assigned to you."
        );
        isValid = false;
      }
    }

    // Validate Title (at least 5 characters)
    if (!title.trim()) {
      setTitleError("Meeting title is required.");
      isValid = false;
    } else if (title.trim().length < 5) {
      setTitleError("Title must be at least 5 characters.");
      isValid = false;
    }

    // Validate Participants (at least one)
    if (selectedParticipantEmails.length === 0) {
      setParticipantsError("Please select at least one participant.");
      isValid = false;
    }

    // Validate Date and Start Time together
    if (!date) {
      setDateError("Meeting date is required.");
      isValid = false;
    }

    if (!startTime) {
      setStartTimeError("Start time is required.");
      isValid = false;
    }

    // Build one date-time from the chosen date and start time and compare with now
    if (date && startTime) {
      const [year, month, day] = date.split("-").map(Number);
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const meetingStartDateTime = new Date(year, month - 1, day, startHours, startMinutes, 0);

      const now = new Date();
      // Allow current time or later (buffer of 60 seconds to avoid sub-second boundary failure)
      const bufferTime = new Date(now.getTime() - 60 * 1000);

      if (meetingStartDateTime < bufferTime) {
        setStartTimeError("Meeting time cannot be in the past. Please choose the current time or a later time.");
        isValid = false;
      }
    }

    // Validate End Time (must be after start time)
    if (!endTime) {
      setEndTimeError("End time is required.");
      isValid = false;
    } else if (startTime && endTime <= startTime) {
      setEndTimeError("End time must be after start time.");
      isValid = false;
    }

    // Validate Location
    if (!location.trim()) {
      setLocationError("Location or room number is required.");
      isValid = false;
    }

    // Validate Online Meeting Link (if provided, must start with https://)
    if (meetingUrl.trim() && !meetingUrl.trim().startsWith("https://")) {
      setUrlError("Online meeting link must start with https://");
      isValid = false;
    }

    return isValid;
  };

  // 7. Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Build participants array with status "pending"
    const participantsList: MeetingParticipant[] = selectedParticipantEmails.map((email) => {
      const user = mockUsers.find((u) => u.email === email);
      return {
        name: user ? user.name : email,
        email: email,
        role: (user?.role as "student" | "faculty") || "student",
        response: "pending",
      };
    });

    // NOTE: Real email invitations and calendar invites will be sent by the backend Resend service later.
    setTimeout(() => {
      const newMeeting: MockMeeting = {
        id: "m" + Date.now(),
        title: title.trim(),
        complaintRef: selectedComplaintRef,
        date: date,
        startTime: startTime,
        endTime: endTime,
        location: location.trim(),
        meetingUrl: meetingUrl.trim() || undefined,
        organizerName: currentUser.name,
        organizerEmail: currentUser.email,
        organizerRole: (currentUser.role as "faculty" | "admin") || "faculty",
        participants: participantsList,
        status: "scheduled",
      };

      // Add to shared store
      addMeeting(newMeeting);

      setIsSubmitting(false);
      setCreatedMeetingTitle(newMeeting.title);
      setIsSuccess(true);
    }, 600);
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
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Meetings</span>
            </Link>

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
            <Link
              href={`/meetings?role=${role}`}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-base font-bold text-zinc-900">
              Schedule Inquiry Meeting
            </h1>
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
        <main className="p-6 max-w-3xl space-y-6">

          {/* Role Check: Faculty & Admin only */}
          {role === "student" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900">
                Faculty / Admin Access Required
              </h2>
              <p className="text-xs text-zinc-600 max-w-md mx-auto">
                Students cannot schedule inquiry meetings. Only faculty and administrators can initiate hearings.
              </p>
              <div className="pt-2">
                <Link href={`/meetings?role=faculty`}>
                  <Button className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs">
                    Switch to Faculty View
                  </Button>
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* Success confirmation card */
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Meeting Scheduled Successfully!
                </h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
                  <strong>&quot;{createdMeetingTitle}&quot;</strong> has been created. All invited participants have received in-app notifications and their statuses are set to <strong>Pending</strong>.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <Link href={`/meetings?role=${role}`}>
                  <Button className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium">
                    View in Meetings List
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setTitle("");
                    setDate("");
                    setStartTime("");
                    setEndTime("");
                    setLocation("");
                    setMeetingUrl("");
                    setSelectedParticipantEmails([]);
                  }}
                  className="text-xs font-medium"
                >
                  Schedule Another Meeting
                </Button>
              </div>
            </div>
          ) : (
            /* Meeting Creation Form */
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  Schedule Hearing / Inquiry Session
                </h2>
                <p className="text-xs text-zinc-500">
                  Organize an in-person or virtual hearing session to review an active student grievance.
                </p>
              </div>

              {/* Friendly warning when no open complaints exist */}
              {hasNoOpenComplaints && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-zinc-900">
                      No open complaints available for scheduling
                    </div>
                    <div className="text-zinc-600">
                      Only grievances with status <strong>Submitted</strong> or <strong>Under Review</strong> can have inquiry meetings scheduled. Resolved and rejected complaints cannot be selected.
                      {role === "faculty" && (
                        <span> There are currently no open complaints assigned to you ({currentUser.name}).</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <fieldset disabled={hasNoOpenComplaints} className="space-y-4">
                
                {/* Linked Complaint Dropdown - Open complaints only */}
                <div className="space-y-1">
                  <Label htmlFor="complaint-ref" className="text-xs font-medium text-zinc-700">
                    Linked Complaint <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="complaint-ref"
                    value={selectedComplaintRef}
                    disabled={hasNoOpenComplaints}
                    onChange={(e) => {
                      setSelectedComplaintRef(e.target.value);
                      if (complaintError) setComplaintError("");
                    }}
                    className={`w-full h-9 rounded-lg border bg-white px-3 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer disabled:bg-zinc-100 disabled:cursor-not-allowed ${
                      complaintError ? "border-red-500" : "border-input"
                    }`}
                  >
                    <option value="">
                      {hasNoOpenComplaints
                        ? "-- No open complaints available --"
                        : "-- Select Linked Open Complaint --"}
                    </option>
                    {openComplaints.map((c) => (
                      <option key={c.id} value={c.refNumber}>
                        {c.refNumber} - {c.subject} ({c.studentName}) [{c.status === "submitted" ? "Submitted" : "Under Review"}]
                      </option>
                    ))}
                  </select>
                  {complaintError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{complaintError}</p>
                  )}
                </div>

                {/* Meeting Title */}
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-xs font-medium text-zinc-700">
                    Meeting Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g. Committee Hearing on Hostel Water Outage"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) setTitleError("");
                    }}
                    className={`text-xs ${titleError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  {titleError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{titleError}</p>
                  )}
                </div>

                {/* Participants Checkboxes */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-medium text-zinc-700 block">
                    Invite Participants <span className="text-red-500">*</span>
                  </Label>
                  <div className="border border-zinc-200 rounded-xl p-3 bg-zinc-50/50 space-y-2">
                    {candidateParticipants.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-2.5 text-xs text-zinc-700 cursor-pointer hover:bg-zinc-100/60 p-1.5 rounded-lg transition-colors"
                      >
                        <Checkbox
                          checked={selectedParticipantEmails.includes(user.email)}
                          onCheckedChange={() => handleToggleParticipant(user.email)}
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900">{user.name}</span>
                          <span className="text-[10px] text-zinc-500 bg-white border border-zinc-200 px-1.5 py-0.5 rounded capitalize">
                            {user.role} ({user.idNumber})
                          </span>
                          <span className="text-[11px] text-zinc-400">({user.email})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {participantsError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{participantsError}</p>
                  )}
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Date */}
                  <div className="space-y-1">
                    <Label htmlFor="date" className="text-xs font-medium text-zinc-700">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (dateError) setDateError("");
                      }}
                      className={`text-xs ${dateError ? "border-red-500" : ""}`}
                    />
                    {dateError && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{dateError}</p>
                    )}
                  </div>

                  {/* Start Time */}
                  <div className="space-y-1">
                    <Label htmlFor="start-time" className="text-xs font-medium text-zinc-700">
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        if (startTimeError) setStartTimeError("");
                      }}
                      className={`text-xs ${startTimeError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    {startTimeError && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{startTimeError}</p>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="space-y-1">
                    <Label htmlFor="end-time" className="text-xs font-medium text-zinc-700">
                      End Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        if (endTimeError) setEndTimeError("");
                      }}
                      className={`text-xs ${endTimeError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    {endTimeError && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{endTimeError}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <Label htmlFor="location" className="text-xs font-medium text-zinc-700">
                    Meeting Location / Room <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g. Faculty Lounge Room 204 or Dean's Conference Hall"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        if (locationError) setLocationError("");
                      }}
                      className={`pl-9 text-xs ${locationError ? "border-red-500" : ""}`}
                    />
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {locationError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{locationError}</p>
                  )}
                </div>

                {/* Optional Online Link */}
                <div className="space-y-1">
                  <Label htmlFor="meeting-url" className="text-xs font-medium text-zinc-700">
                    Online Meeting Link <span className="text-zinc-400 font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="meeting-url"
                      type="url"
                      placeholder="https://meet.google.com/xyz-abcd-efg"
                      value={meetingUrl}
                      onChange={(e) => {
                        setMeetingUrl(e.target.value);
                        if (urlError) setUrlError("");
                      }}
                      className={`pl-9 text-xs ${urlError ? "border-red-500" : ""}`}
                    />
                    <Video className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {urlError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{urlError}</p>
                  )}
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    If this hearing is virtual or hybrid, paste a link starting with https://.
                  </p>
                </div>
                </fieldset>

                {/* Form Buttons */}
                <div className="pt-3 flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || hasNoOpenComplaints}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Scheduling Meeting..." : "Schedule Meeting"}
                  </Button>

                  <Link href={`/meetings?role=${role}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs font-medium rounded-xl"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>

              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
