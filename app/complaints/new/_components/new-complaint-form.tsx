"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createComplaintAction } from "@/modules/complaints/actions";
import {
  COMPLAINT_CATEGORY_OPTIONS,
} from "@/modules/complaints/schemas";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TUser } from "@/modules/auth/types";
import type { TStudentOption } from "@/modules/complaints/types";
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Calendar,
  Bell,
  User,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  FileIcon,
  ImageIcon,
} from "lucide-react";
import { logoutAction } from "@/modules/auth/actions";
import { RespondentPicker } from "./respondent-picker";

interface SubmittedComplaint {
  id: string;
  refNumber: string;
}

interface NewComplaintFormProps {
  user: TUser;
  studentOptions: TStudentOption[];
}

export function NewComplaintForm({ user, studentOptions }: NewComplaintFormProps) {
  const router = useRouter();

  const currentUser = {
    name: user?.fullName || "Student",
    email: user?.email || "",
    idNumber: user?.idNumber || "",
  };

  // 1. Form state variables
  const [category, setCategory] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [respondentIds, setRespondentIds] = React.useState<string[]>([]);

  // Attachments state: file metadata for the picker + raw files for upload
  const [attachments, setAttachments] = React.useState<
    Array<{ name: string; size: string }>
  >([]);
  const [fileObjects, setFileObjects] = React.useState<File[]>([]);
  const [attachmentError, setAttachmentError] = React.useState("");

  // 2. Field-level error messages
  const [categoryError, setCategoryError] = React.useState("");
  const [subjectError, setSubjectError] = React.useState("");
  const [descriptionError, setDescriptionError] = React.useState("");

  // 3. Submission status states
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedComplaint, setSubmittedComplaint] =
    React.useState<SubmittedComplaint | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError("");
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files);
    const validAttachments: Array<{ name: string; size: string }> = [];
    const newFiles: File[] = [];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB maximum limit

    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

    for (const file of filesArray) {
      const fileNameLower = file.name.toLowerCase();
      const hasValidExt = allowedExtensions.some((ext) =>
        fileNameLower.endsWith(ext)
      );

      if (!hasValidExt) {
        setAttachmentError(
          `"${file.name}" is not supported. Only PDF, JPG, and PNG files are allowed.`
        );
        return;
      }

      if (file.size > maxSizeBytes) {
        setAttachmentError(
          `"${file.name}" exceeds the 5 MB file size limit.`
        );
        return;
      }

      validAttachments.push({
        name: file.name,
        size: formatFileSize(file.size),
      });
      newFiles.push(file);
    }

    setAttachments((prev) => [...prev, ...validAttachments]);
    setFileObjects((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setFileObjects((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const validateForm = () => {
    let isValid = true;

    setCategoryError("");
    setSubjectError("");
    setDescriptionError("");

    if (!category.trim()) {
      setCategoryError("Please select a grievance category.");
      isValid = false;
    }

    if (!subject.trim()) {
      setSubjectError("Subject is required.");
      isValid = false;
    } else if (subject.trim().length < 5) {
      setSubjectError("Subject must be at least 5 characters.");
      isValid = false;
    }

    if (!description.trim()) {
      setDescriptionError("Description is required.");
      isValid = false;
    } else if (description.trim().length < 20) {
      setDescriptionError("Please provide more detail (at least 20 characters).");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("category", category.trim());
      formData.append("subject", subject.trim());
      formData.append("description", description.trim());
      respondentIds.forEach((id) => formData.append("respondentIds", id));

      fileObjects.forEach((file) => {
        formData.append("files", file);
      });

      const response = await createComplaintAction(formData);

      if (!response.success || !response.data) {
        toast.error(response.message || "Failed to submit grievance.");
        setIsSubmitting(false);
        return;
      }

      setSubmittedComplaint({
        id: response.data.id,
        refNumber: response.data.refNumber,
      });
    } catch (err: unknown) {
      console.error("Submission error:", err);
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (e) {
      console.error(e);
    } finally {
      router.push("/login");
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
              href={`/dashboard?role=${user.role}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href={`/complaints?role=${user.role}`}
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
              href={`/profile?role=${user.role}`}
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
                  {user.role}
                  {currentUser.idNumber ? ` (${currentUser.idNumber})` : ""}
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
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/complaints?role=${user.role}`}
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-zinc-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-6 max-w-3xl space-y-6">
          {/* Student Access Check */}
          {user.role !== "student" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900">
                Student Access Required
              </h2>
              <p className="text-xs text-zinc-600 max-w-md mx-auto">
                Only students are permitted to raise complaints through this
                form. As a {user.role}, your role is to review or administer
                submitted complaints.
              </p>
              <div className="pt-2">
                <Link href={`/complaints?role=${user.role}`}>
                  <Button className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs">
                    Back to Complaints
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
                  . The administration and assigned faculty will review your
                  submission.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <Link href={`/complaints/${submittedComplaint.refNumber}?role=student`}>
                  <Button className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium">
                    View Complaint Details
                  </Button>
                </Link>
                <Link href={`/complaints?role=student`}>
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
                  Please provide detailed information so faculty and
                  administrators can review your issue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Category Dropdown */}
                <div className="space-y-1">
                  <Label
                    htmlFor="category"
                    className="text-xs font-medium text-zinc-700"
                  >
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
                    {COMPLAINT_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {categoryError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {categoryError}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div className="space-y-1">
                  <Label
                    htmlFor="subject"
                    className="text-xs font-medium text-zinc-700"
                  >
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
                    className={`text-xs ${
                      subjectError
                        ? "border-red-500 focus-visible:ring-red-400"
                        : ""
                    }`}
                  />
                  {subjectError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {subjectError}
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-1">
                  <Label
                    htmlFor="description"
                    className="text-xs font-medium text-zinc-700"
                  >
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
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {descriptionError}
                    </p>
                  )}
                </div>

                {/* Respondents: searchable student multi-select */}
                <RespondentPicker
                  studentOptions={studentOptions}
                  selectedIds={respondentIds}
                  onChange={setRespondentIds}
                />

                {/* Multi-File Attachment Picker */}
                <div className="space-y-2 pt-1">
                  <Label
                    htmlFor="file-upload"
                    className="text-xs font-medium text-zinc-700 block"
                  >
                    Attachments / Evidence Files{" "}
                    <span className="text-zinc-400 font-normal">(Optional)</span>
                  </Label>

                  {/* Upload Drop Zone / Picker */}
                  <div className="border border-dashed border-zinc-200 rounded-xl p-4 bg-zinc-50/50 hover:bg-zinc-50 transition-colors text-center">
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-xs">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-zinc-900">
                        Click to select files
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Supports multiple files: <strong>PDF, JPG, PNG</strong>{" "}
                        (up to 5 MB each)
                      </p>
                    </label>
                  </div>

                  {attachmentError && (
                    <p className="text-xs text-red-600 font-medium">
                      {attachmentError}
                    </p>
                  )}

                  {/* Chosen Files List */}
                  {attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-zinc-600">
                        Selected Files ({attachments.length}):
                      </span>
                      <div className="space-y-1">
                        {attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-white border border-zinc-200 rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {att.name.toLowerCase().endsWith(".pdf") ? (
                                <FileIcon className="w-4 h-4 text-red-500 shrink-0" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                              )}
                              <span className="font-medium text-zinc-800 truncate">
                                {att.name}
                              </span>
                              <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0">
                                {att.size}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="text-zinc-400 hover:text-red-600 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                              title="Remove file"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="pt-3 flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-6 py-2 rounded-xl cursor-pointer"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Complaint"}
                  </Button>

                  <Link href={`/complaints?role=${user.role}`}>
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
