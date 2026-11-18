"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { signupAction } from "@/modules/auth/actions";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

type SignupRole = "student" | "faculty";

export function SignupForm() {
  // 1. Form state variables
  const [role, setRole] = React.useState<SignupRole>("student");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [idNumber, setIdNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);

  // Toggle visibility of passwords
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // 2. Field-level error messages
  const [fullNameError, setFullNameError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [idNumberError, setIdNumberError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");
  const [termsError, setTermsError] = React.useState("");
  const [generalError, setGeneralError] = React.useState("");

  // 3. Status states
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Helper function to check if email contains @ and a dot
  const isValidEmail = (emailStr: string) => {
    const atPosition = emailStr.indexOf("@");
    const dotPosition = emailStr.lastIndexOf(".");
    return (
      atPosition > 0 &&
      dotPosition > atPosition + 1 &&
      dotPosition < emailStr.length - 1
    );
  };

  // Helper function to check password strength
  const isValidPassword = (pass: string) => {
    if (pass.length < 6) return false;
    return true;
  };

  // 4. Validate all fields
  const validateForm = () => {
    let isValid = true;

    setFullNameError("");
    setEmailError("");
    setIdNumberError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");
    setGeneralError("");

    if (!fullName.trim()) {
      setFullNameError("Full name is required.");
      isValid = false;
    } else if (fullName.trim().length < 2) {
      setFullNameError("Full name must be at least 2 characters.");
      isValid = false;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError(
        "Please enter a valid email address with @ and a domain (e.g. user@campus.edu).",
      );
      isValid = false;
    }

    if (!idNumber.trim()) {
      setIdNumberError(
        role === "student"
          ? "Student Roll / Reg Number is required."
          : "Faculty Employee ID is required.",
      );
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (!isValidPassword(password)) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (!agreedToTerms) {
      setTermsError("You must agree to the guidelines to create an account.");
      isValid = false;
    }

    return isValid;
  };

  // 5. Handle signup form submission with server action
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError("");

    try {
      const response = await signupAction({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        idNumber: idNumber.trim(),
      });

      if (!response.success) {
        if (response.message.toLowerCase().includes("email")) {
          setEmailError(response.message);
        } else {
          setGeneralError(response.message);
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      setGeneralError(
        err?.message || "An error occurred while creating your account.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-sm p-8">
        {/* Header with Project Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Create an Account
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Register for the Student Proctoring & Complaint Management System
          </p>
        </div>
        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {generalError}
          </div>
        )}

        {/* Signup Form  */}
        <>
          {/* Role Selector Tabs (Student or Faculty only) */}
          <div className="mb-6">
            <Label className="block text-xs font-semibold text-zinc-500 mb-2">
              Select Your Role (Student or Faculty)
            </Label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                  role === "student"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("faculty")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                  role === "faculty"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Faculty
              </button>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            {/* Full Name Field */}
            <div className="space-y-1">
              <Label
                htmlFor="fullName"
                className="text-xs font-medium text-zinc-700"
              >
                Full Name
              </Label>
              <div className="relative">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fullNameError) setFullNameError("");
                  }}
                  className={`pl-9 text-sm ${fullNameError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
              {fullNameError && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  {fullNameError}
                </p>
              )}
            </div>

            {/* Email and ID Number in a 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email Field */}
              <div className="space-y-1">
                <Label
                  htmlFor="signup-email"
                  className="text-xs font-medium text-zinc-700"
                >
                  Campus Email
                </Label>
                <div className="relative">
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="user@campus.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    className={`pl-9 text-sm ${emailError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
                {emailError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {emailError}
                  </p>
                )}
              </div>

              {/* ID Number Field */}
              <div className="space-y-1">
                <Label
                  htmlFor="idNumber"
                  className="text-xs font-medium text-zinc-700"
                >
                  {role === "student" ? "Roll / Reg Number" : "Employee ID"}
                </Label>
                <div className="relative">
                  <Input
                    id="idNumber"
                    type="text"
                    placeholder={role === "student" ? "2024CS101" : "FAC-404"}
                    value={idNumber}
                    onChange={(e) => {
                      setIdNumber(e.target.value);
                      if (idNumberError) setIdNumberError("");
                    }}
                    className={`pl-9 text-sm ${idNumberError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
                {idNumberError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {idNumberError}
                  </p>
                )}
              </div>
            </div>

            {/* Password and Confirm Password in a 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Password Field */}
              <div className="space-y-1">
                <Label
                  htmlFor="signup-password"
                  className="text-xs font-medium text-zinc-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    className={`pl-9 pr-8 text-sm ${passwordError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <Label
                  htmlFor="confirm-password"
                  className="text-xs font-medium text-zinc-700"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError("");
                    }}
                    className={`pl-9 pr-8 text-sm ${confirmPasswordError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {confirmPasswordError}
                  </p>
                )}
              </div>
            </div>

            {/* Agreement checkbox */}
            <div className="pt-1">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => {
                    setAgreedToTerms(!!checked);
                    if (termsError) setTermsError("");
                  }}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="terms"
                  className="text-xs leading-relaxed font-normal text-zinc-600 cursor-pointer"
                >
                  I agree to the guidelines and campus complaint management code
                  of conduct.
                </Label>
              </div>
              {termsError && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  {termsError}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 font-medium bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              {isLoading ? (
                "Creating account..."
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Register as {role.charAt(0).toUpperCase() + role.slice(1)}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Link to Login page */}
          <div className="mt-6 text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-900 underline hover:text-zinc-700"
            >
              Sign in
            </Link>
          </div>
        </>
      </div>
    </div>
  );
}
