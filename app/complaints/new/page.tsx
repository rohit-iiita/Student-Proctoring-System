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
  AlertTriangle,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

export default function NewComplaintPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading form...</div>}>
      <NewComplaintContent />
    </React.Suspense>
  );
}

function NewComplaintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Role from URL, default to "student"
  const role = (searchParams.get("role") as UserRole) || "student";
  const currentUser: MockUser =
    mockUsers.find((u) => u.role === role) || mockUsers[0];

  // 2. Form state variables
  const [category, setCategory] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [respondents, setRespondents] = React.useState("");
  const [attachmentName, setAttachmentName] = React.useState("");

  // 3. Field-level error messages
  const [categoryError, setCategoryError] = React.useState("");
  const [subjectError, setSubjectError] = React.useState("");
  const [descriptionError, setDescriptionError] = React.useState("");

  // 4. Submission status states
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedComplaint, setSubmittedComplaint] = React.useState<MockComplaint | null>(null);

  // 5. Form validation logic
  const validateForm = () => {
    let isValid = true;

    // Reset previous errors
    setCategoryError("");
    setSubjectError("");
    setDescriptionError("");

    // Validate Category
    if (!category.trim()) {
      setCategoryError("Please select a grievance category.");
      isValid = false;
    }

    // Validate Subject (at least 5 characters)
    if (!subject.trim()) {
      setSubjectError("Subject is required.");
      isValid = false;
    } else if (subject.trim().length < 5) {
      setSubjectError("Subject must be at least 5 characters.");
      isValid = false;
    }

    // Validate Description (at least 20 characters)
    if (!description.trim()) {
      setDescriptionError("Description is required.");
      isValid = false;
    } else if (description.trim().length < 20) {
      setDescriptionError("Please provide more detail (at least 20 characters).");
      isValid = false;
    }

    return isValid;
  };

  // 6. Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // NOTE: In the real application, your partner will insert this into the Supabase 'complaints' table.
    // For now, we simulate saving by appending to our mockComplaints array in memory:
    setTimeout(() => {
      const newRefNumber = `CMP-2026-00${mockComplaints.length + 1}`;
      const newComplaint: MockComplaint = {
        id: `c${mockComplaints.length + 1}`,
        refNumber: newRefNumber,
        studentName: currentUser.name,
        category: category.trim(),
        subject: subject.trim(),
        description: description.trim(),
        status: "submitted",
        assignedFaculty: "Unassigned",
        createdAt: new Date().toISOString().split("T")[0],
        respondents: respondents.trim() || undefined,
        attachmentName: attachmentName.trim() || undefined,
        notes: "",
      };

      // Push to mock array so it appears in the list and dashboard immediately
      mockComplaints.unshift(newComplaint);

      setIsSubmitting(false);
      setSubmittedComplaint(newComplaint);
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
              Raise a Complaint
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

          {/* Role Check: Only students can raise complaints */}
          {role !== "student" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900">
                Student Access Required
              </h2>
              <p className="text-xs text-zinc-600 max-w-md mx-auto">
                Only students are permitted to raise complaints through this form. As a {role}, your role is to review or administer submitted complaints.
              </p>
              <div className="pt-2">
                <Link href={`/complaints?role=student`}>
                  <Button className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs">
                    Switch to Student View
                  </Button>
                </Link>
              </div>
            </div>
          ) : submittedComplaint ? (
            /* Success confirmation card */
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Complaint Submitted Successfully!
                </h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Your grievance has been logged with reference number{" "}
                  <span className="font-mono font-bold text-zinc-900">
                    {submittedComplaint.refNumber}
                  </span>
                  . The administration and assigned faculty will review your submission.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <Link href={`/complaints/${submittedComplaint.id}?role=student`}>
                  <Button className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium">
                    View Complaint Details
                  </Button>
                </Link>
                <Link href="/complaints?role=student">
                  <Button variant="outline" className="text-xs font-medium">
                    Back to Complaints List
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Complaint Submission Form */
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  Submit a Grievance
                </h2>
                <p className="text-xs text-zinc-500">
                  Please provide detailed information so faculty and administrators can review your issue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                
                {/* Category Dropdown */}
                <div className="space-y-1">
                  <Label htmlFor="category" className="text-xs font-medium text-zinc-700">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (categoryError) setCategoryError("");
                    }}
                    className={`w-full h-9 rounded-lg border bg-white px-3 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer ${
                      categoryError ? "border-red-500" : "border-input"
                    }`}
                  >
                    <option value="">-- Select a Category --</option>
                    {complaintCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {categoryError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{categoryError}</p>
                  )}
                </div>

                {/* Subject Field */}
                <div className="space-y-1">
                  <Label htmlFor="subject" className="text-xs font-medium text-zinc-700">
                    Subject / Summary <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Brief 1-line summary of the issue (min 5 characters)"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (subjectError) setSubjectError("");
                    }}
                    className={`text-xs ${subjectError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  {subjectError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{subjectError}</p>
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-medium text-zinc-700">
                    Detailed Description <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="description"
                    rows={5}
                    placeholder="Provide full context, dates, locations, and details (at least 20 characters)..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (descriptionError) setDescriptionError("");
                    }}
                    className={`w-full rounded-lg border bg-transparent p-3 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 ${
                      descriptionError ? "border-red-500" : "border-input"
                    }`}
                  />
                  {descriptionError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{descriptionError}</p>
                  )}
                </div>

                {/* Optional Respondents Field */}
                <div className="space-y-1">
                  <Label htmlFor="respondents" className="text-xs font-medium text-zinc-700">
                    Respondent Name(s) <span className="text-zinc-400 font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="respondents"
                      type="text"
                      placeholder="e.g. Person, room number, or cafeteria vendor involved"
                      value={respondents}
                      onChange={(e) => setRespondents(e.target.value)}
                      className="pl-9 text-xs"
                    />
                    <Users className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Leave blank if this is a general facility or infrastructure complaint.
                  </p>
                </div>

                {/* Optional Attachment Field */}
                <div className="space-y-1">
                  <Label htmlFor="attachment" className="text-xs font-medium text-zinc-700">
                    Attachment / Evidence File <span className="text-zinc-400 font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="attachment"
                      type="text"
                      placeholder="e.g. photo_evidence.jpg, medical_cert.pdf"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      className="pl-9 text-xs"
                    />
                    <Paperclip className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    For this front-end demo, you can enter any sample file name (e.g. photo.png). Real uploads will use Supabase Storage later.
                  </p>
                </div>

                {/* Buttons */}
                <div className="pt-3 flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-6 py-2 rounded-xl"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Complaint"}
                  </Button>

                  <Link href={`/complaints?role=${role}`}>
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
