"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/modules/auth/actions";
import { updateProfileAction } from "@/modules/profile/actions";
import type { TUserRole } from "@/modules/auth/types";
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
  Lock,
  Mail,
  CheckCircle2,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

interface ProfileUser {
  userId: string;
  email: string;
  fullName: string;
  role: TUserRole;
  idNumber: string | null;
}

interface ProfileSettingsProps {
  user: ProfileUser;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const role = user.role;

  // Sidebar nav links depend on the real role, not a URL param
  const isAdmin = role === "admin";

  // 1. Form input states (initialized from the real logged-in user)
  const [fullName, setFullName] = React.useState(user.fullName);

  // Change-password states
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Toggle password visibility
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  // 2. Field-level error message states
  const [nameError, setNameError] = React.useState("");
  const [currentPasswordError, setCurrentPasswordError] = React.useState("");
  const [newPasswordError, setNewPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");

  // Status feedback
  const [successMessage, setSuccessMessage] = React.useState("");
  const [generalError, setGeneralError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Helper function to check if password has at least 8 chars, 1 letter, and 1 number
  const isValidPassword = (pass: string) => {
    if (pass.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    return hasLetter && hasNumber;
  };

  // 3. Client-side validation (server re-validates with the same rules)
  const validateForm = () => {
    let isValid = true;

    // Reset previous errors
    setNameError("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setSuccessMessage("");
    setGeneralError("");

    // Validate Full Name (at least 3 characters)
    if (!fullName.trim()) {
      setNameError("Full name is required.");
      isValid = false;
    } else if (fullName.trim().length < 3) {
      setNameError("Full name must be at least 3 characters.");
      isValid = false;
    }

    // Validate Password Change (only if the user filled in any of the password fields)
    const isChangingPassword =
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmPassword.length > 0;

    if (isChangingPassword) {
      // 1. Current password must be provided
      if (!currentPassword) {
        setCurrentPasswordError("Please enter your current password.");
        isValid = false;
      }

      // 2. New password must meet strength requirements
      if (!newPassword) {
        setNewPasswordError("Please enter a new password.");
        isValid = false;
      } else if (!isValidPassword(newPassword)) {
        setNewPasswordError(
          "New password must be at least 8 characters, with at least one letter and one number.",
        );
        isValid = false;
      } else if (newPassword === currentPassword) {
        setNewPasswordError(
          "New password must be different from your current password.",
        );
        isValid = false;
      }

      // 3. Confirm password must match
      if (!confirmPassword) {
        setConfirmPasswordError("Please confirm your new password.");
        isValid = false;
      } else if (newPassword !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
        isValid = false;
      }
    }

    return isValid;
  };

  // 4. Handle form save via the profile server action
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateProfileAction({
        fullName: fullName.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined,
      });

      if (!response.success) {
        // Map known server messages onto the matching field
        if (response.message.toLowerCase().includes("current password")) {
          setCurrentPasswordError(response.message);
        } else if (response.message.toLowerCase().includes("password")) {
          setNewPasswordError(response.message);
        } else {
          setGeneralError(response.message);
        }
        setIsSaving(false);
        return;
      }

      setSuccessMessage("Profile updated successfully!");

      // Clear password fields after successful change
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Profile save error:", err);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
      // revalidatePath in the action refreshes server data; refresh the
      // client router so header/sidebar names update immediately too
      router.refresh();
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.push("/login");
      router.refresh();
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

            {isAdmin && (
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
            {/* Active profile link */}
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900 line-clamp-1">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-zinc-500 capitalize">
                  {role}
                  {user.idNumber ? ` (${user.idNumber})` : ""}
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
            <h1 className="text-base font-bold text-zinc-900">
              Profile Settings
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-700 capitalize border border-zinc-200">
              {role} Account
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-zinc-900">
                {user.fullName}
              </div>
              <div className="text-[11px] text-zinc-500">{user.email}</div>
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
        <main className="p-6 max-w-4xl space-y-6">
          {/* Success banner on save */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* General error banner */}
          {generalError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6" noValidate>
            {/* ================= SECTION 1: PERSONAL INFORMATION ================= */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  Personal Information
                </h2>
                <p className="text-xs text-zinc-500">
                  Update your display name; contact details are managed by the
                  university
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name (Editable) */}
                <div className="space-y-1">
                  <Label
                    htmlFor="full-name"
                    className="text-xs font-medium text-zinc-700"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      className={`pl-9 text-sm ${nameError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  {nameError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {nameError}
                    </p>
                  )}
                </div>

                {/* Institutional Email (Read-Only) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="email"
                      className="text-xs font-medium text-zinc-700"
                    >
                      Institutional Email
                    </Label>
                    <span className="text-[10px] text-zinc-400 italic">
                      Read-only
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      disabled
                      value={user.email}
                      className="pl-9 text-sm bg-zinc-50 text-zinc-500 border-zinc-200 cursor-not-allowed"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Official email addresses are managed centrally by university
                    administration.
                  </p>
                </div>

                {/* Role-Specific Identifier (Read-Only) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="id-number"
                      className="text-xs font-medium text-zinc-700"
                    >
                      {role === "student"
                        ? "Student Roll / Reg Number"
                        : role === "faculty"
                          ? "Faculty Employee ID"
                          : "Administrator Employee ID"}
                    </Label>
                    <span className="text-[10px] text-zinc-400 italic">
                      Institutional Record
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="id-number"
                      type="text"
                      disabled
                      value={user.idNumber || "Not assigned"}
                      className="pl-9 text-sm bg-zinc-50 text-zinc-500 border-zinc-200 cursor-not-allowed font-mono"
                    />
                    {role === "student" ? (
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    ) : (
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {role === "student" &&
                      "Issued by the academics office at enrollment."}
                    {role === "faculty" &&
                      "Assigned by the human resources department."}
                    {role === "admin" &&
                      "Assigned to Campus Administration & Disciplinary Board."}
                  </p>
                </div>

                {/* Department (Read-Only context card for faculty) */}
                {role === "faculty" && (
                  <div className="space-y-1">
                    <Label
                      htmlFor="department-display"
                      className="text-xs font-medium text-zinc-700"
                    >
                      Academic Department
                    </Label>
                    <div className="relative">
                      <Input
                        id="department-display"
                        type="text"
                        disabled
                        value="As per institutional records"
                        className="pl-9 text-sm bg-zinc-50 text-zinc-500 border-zinc-200 cursor-not-allowed"
                      />
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Department changes are handled by the administration
                      office.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ================= SECTION 2: CHANGE PASSWORD ================= */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  Change Password
                </h2>
                <p className="text-xs text-zinc-500">
                  Leave blank if you do not want to change your password
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                {/* Current Password */}
                <div className="space-y-1">
                  <Label
                    htmlFor="curr-pass"
                    className="text-xs font-medium text-zinc-700"
                  >
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="curr-pass"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (currentPasswordError)
                          setCurrentPasswordError("");
                      }}
                      className={`pl-9 pr-9 text-sm ${currentPasswordError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {currentPasswordError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {currentPasswordError}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <Label
                    htmlFor="new-pass"
                    className="text-xs font-medium text-zinc-700"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-pass"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Min 8 chars, letter & number"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (newPasswordError) setNewPasswordError("");
                      }}
                      className={`pl-9 pr-9 text-sm ${newPasswordError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {newPasswordError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {newPasswordError}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <Label
                    htmlFor="confirm-new-pass"
                    className="text-xs font-medium text-zinc-700"
                  >
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-new-pass"
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError)
                          setConfirmPasswordError("");
                      }}
                      className={`pl-9 text-sm ${confirmPasswordError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-6 py-2 rounded-xl cursor-pointer"
              >
                {isSaving ? "Saving changes..." : "Save Profile Changes"}
              </Button>

              <Link href={`/dashboard?role=${role}`}>
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
        </main>
      </div>
    </div>
  );
}
