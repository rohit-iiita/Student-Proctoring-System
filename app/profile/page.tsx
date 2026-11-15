"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { mockUsers, MockUser } from "@/lib/mock-data";
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
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  Info,
  Building,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

export default function ProfilePage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading profile...</div>}>
      <ProfileContent />
    </React.Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Role state from URL query param, defaulting to "student"
  const initialRole = (searchParams.get("role") as UserRole) || "student";
  const [role, setRole] = React.useState<UserRole>(initialRole);

  React.useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam && (roleParam === "student" || roleParam === "faculty" || roleParam === "admin")) {
      setRole(roleParam);
    }
  }, [searchParams]);

  // 2. Find currently active mock user
  const currentUser = React.useMemo(() => {
    return mockUsers.find((u) => u.role === role) || mockUsers[0];
  }, [role]);

  // 3. Form input states (initialized from current user)
  const [fullName, setFullName] = React.useState(currentUser.name);
  const [phone, setPhone] = React.useState(currentUser.phone || "");
  const [department, setDepartment] = React.useState(currentUser.department || "Computer Science & Engineering");

  // Change-password states
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Toggle password visibility
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  // 4. Field-level error message states
  const [nameError, setNameError] = React.useState("");
  const [phoneError, setPhoneError] = React.useState("");
  const [departmentError, setDepartmentError] = React.useState("");
  const [currentPasswordError, setCurrentPasswordError] = React.useState("");
  const [newPasswordError, setNewPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");

  // Status feedback
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // When switching role, sync form fields to the new role's user
  React.useEffect(() => {
    setFullName(currentUser.name);
    setPhone(currentUser.phone || "");
    setDepartment(currentUser.department || "Computer Science & Engineering");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setNameError("");
    setPhoneError("");
    setDepartmentError("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setSuccessMessage("");
  }, [currentUser]);

  // Helper function to check if password has at least 8 chars, 1 letter, and 1 number
  const isValidPassword = (pass: string) => {
    if (pass.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    return hasLetter && hasNumber;
  };

  // 5. Form validation logic
  const validateForm = () => {
    let isValid = true;

    // Reset previous errors
    setNameError("");
    setPhoneError("");
    setDepartmentError("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setSuccessMessage("");

    // Validate Full Name (at least 3 characters)
    if (!fullName.trim()) {
      setNameError("Full name is required.");
      isValid = false;
    } else if (fullName.trim().length < 3) {
      setNameError("Full name must be at least 3 characters.");
      isValid = false;
    }

    // Validate Phone Number (at least 10 digits/characters)
    const cleanedPhone = phone.replace(/[^0-9]/g, "");
    if (!phone.trim()) {
      setPhoneError("Phone number is required.");
      isValid = false;
    } else if (cleanedPhone.length < 10) {
      setPhoneError("Please enter a valid phone number with at least 10 digits.");
      isValid = false;
    }

    // Validate Faculty Department
    if (role === "faculty" && !department.trim()) {
      setDepartmentError("Department is required for faculty.");
      isValid = false;
    }

    // Validate Password Change (only if the user filled in any of the password fields)
    const isChangingPassword =
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmPassword.length > 0;

    if (isChangingPassword) {
      // 1. Current password must match user's actual password
      if (!currentPassword) {
        setCurrentPasswordError("Please enter your current password.");
        isValid = false;
      } else if (currentPassword !== currentUser.password) {
        setCurrentPasswordError("Current password is incorrect (mock password is 'password123').");
        isValid = false;
      }

      // 2. New password must meet strength requirements
      if (!newPassword) {
        setNewPasswordError("Please enter a new password.");
        isValid = false;
      } else if (!isValidPassword(newPassword)) {
        setNewPasswordError("New password must be at least 8 characters, with at least one letter and one number.");
        isValid = false;
      } else if (newPassword === currentPassword) {
        setNewPasswordError("New password must be different from your current password.");
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

  // 6. Handle form save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    // NOTE: This updates mock memory state. In production, your backend partner
    // will connect this to a Supabase update call (profiles table).
    setTimeout(() => {
      // Save changes to the mock user in memory for this session
      currentUser.name = fullName.trim();
      currentUser.phone = phone.trim();
      if (role === "faculty") {
        currentUser.department = department.trim();
      }
      if (newPassword) {
        currentUser.password = newPassword;
      }

      setIsSaving(false);
      setSuccessMessage("Profile updated successfully!");

      // Clear password fields after successful change
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
            {/* Active profile link */}
            <Link
              href={`/profile?role=${role}`}
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
              Profile Settings
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-700 capitalize border border-zinc-200">
              {role} Account
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

          {/* Demo Role Switcher Banner */}
          <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-700">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>
                <strong className="font-semibold text-zinc-900">Demo Role Switcher:</strong> Switch role to view and edit profile fields for Student, Faculty, or Admin.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${role === "student"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                  }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("faculty")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${role === "faculty"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                  }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${role === "admin"
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                  }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Success banner on save */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {successMessage} (Note: Changes are saved in front-end mock state and will connect to Supabase backend in production).
              </span>
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
                  Update your contact details and campus identification
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name (Editable) */}
                <div className="space-y-1">
                  <Label htmlFor="full-name" className="text-xs font-medium text-zinc-700">
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
                    <p className="text-xs text-red-600 mt-1 font-medium">{nameError}</p>
                  )}
                </div>

                {/* Phone Number (Editable) */}
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-medium text-zinc-700">
                    Contact Phone Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      className={`pl-9 text-sm ${phoneError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{phoneError}</p>
                  )}
                </div>

                {/* Institutional Email (Read-Only) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-xs font-medium text-zinc-700">
                      Institutional Email
                    </Label>
                    <span className="text-[10px] text-zinc-400 italic">Read-only</span>
                  </div>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="pl-9 text-sm bg-zinc-50 text-zinc-500 border-zinc-200 cursor-not-allowed"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Official email addresses are managed centrally by university administration.
                  </p>
                </div>

                {/* Role-Specific Field */}
                {/* 1. Student: Roll Number */}
                {role === "student" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="roll-no" className="text-xs font-medium text-zinc-700">
                        Student Roll / Reg Number
                      </Label>
                      <span className="text-[10px] text-zinc-400 italic">Institutional Record</span>
                    </div>
                    <div className="relative">
                      <Input
                        id="roll-no"
                        type="text"
                        disabled
                        value={currentUser.idNumber}
                        className="pl-9 text-sm bg-zinc-50 text-zinc-500 border-zinc-200 cursor-not-allowed font-mono"
                      />
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Enrolled in Department of Computer Science.
                    </p>
                  </div>
                )}

                {/* 2. Faculty: Department (Editable) */}
                {role === "faculty" && (
                  <div className="space-y-1">
                    <Label htmlFor="department" className="text-xs font-medium text-zinc-700">
                      Academic Department
                    </Label>
                    <div className="relative">
                      <Input
                        id="department"
                        type="text"
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          if (departmentError) setDepartmentError("");
                        }}
                        className={`pl-9 text-sm ${departmentError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                      />
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                    {departmentError && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{departmentError}</p>
                    )}
                  </div>
                )}

                {/* 3. Admin: Employee ID */}
                {role === "admin" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="employee-id" className="text-xs font-medium text-zinc-700">
                        Administrator Employee ID
                      </Label>
                      <span className="text-[10px] text-zinc-400 italic">Institutional Record</span>
                    </div>
                    <div className="relative">
                      <Input
                        id="employee-id"
                        type="text"
                        disabled
                        value={currentUser.idNumber}
                        className="pl-9 text-sm bg-zinc-50 text-zinc-500 border-zinc-200 cursor-not-allowed font-mono"
                      />
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Assigned to Campus Administration & Disciplinary Board.
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
                  <Label htmlFor="curr-pass" className="text-xs font-medium text-zinc-700">
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
                        if (currentPasswordError) setCurrentPasswordError("");
                      }}
                      className={`pl-9 pr-9 text-sm ${currentPasswordError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {currentPasswordError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{currentPasswordError}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <Label htmlFor="new-pass" className="text-xs font-medium text-zinc-700">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPasswordError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{newPasswordError}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <Label htmlFor="confirm-new-pass" className="text-xs font-medium text-zinc-700">
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
                        if (confirmPasswordError) setConfirmPasswordError("");
                      }}
                      className={`pl-9 text-sm ${confirmPasswordError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{confirmPasswordError}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-6 py-2 rounded-xl"
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
