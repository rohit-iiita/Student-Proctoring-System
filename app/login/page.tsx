"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { mockUsers, MockUser } from "@/lib/mock-data";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Briefcase,
  UserCheck,
  Info,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

export default function LoginPage() {
  const router = useRouter();

  // 1. Form state variables (values entered by the user)
  const [role, setRole] = React.useState<UserRole>("student");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  // 2. Field-specific error message states (shown directly under each field)
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [generalError, setGeneralError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // 3. Helper function to check if an email has @ and a dot (.)
  const isValidEmail = (emailStr: string) => {
    const atPosition = emailStr.indexOf("@");
    const dotPosition = emailStr.lastIndexOf(".");
    return (
      atPosition > 0 &&
      dotPosition > atPosition + 1 &&
      dotPosition < emailStr.length - 1
    );
  };

  // 4. Validate the inputs on form submit
  const validateForm = () => {
    let isValid = true;

    // Reset previous errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    // Email validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address containing @ and a domain (e.g. user@campus.edu).");
      isValid = false;
    }

    // Password validation (at least 6 characters)
    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    return isValid;
  };

  // 5. Handle form submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Do not continue if inputs fail basic validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // NOTE: This mock check will be replaced by the real Supabase Auth backend login later.
    // We check against the mockUsers list in lib/mock-data.ts:
    const matchedUser = mockUsers.find(
      (user: MockUser) =>
        user.email.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password &&
        user.role === role
    );

    setTimeout(() => {
      setIsLoading(false);

      if (!matchedUser) {
        // Show general error if email, password, or role do not match any mock user
        setGeneralError("Invalid email, password or role. Please verify your credentials.");
        return;
      }

      // Successful mock login
      setSuccessMessage(`Welcome back, ${matchedUser.name}! Redirecting to dashboard...`);

      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-sm p-8">
        
        {/* Header with Project Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Student Proctoring & Complaint Management System
          </p>
        </div>

        {/* Role Selector Tabs (Student, Faculty, Admin) */}
        <div className="mb-6">
          <Label className="block text-xs font-semibold text-zinc-500 mb-2">
            Select Your Role
          </Label>
          <div className="grid grid-cols-3 gap-2 bg-zinc-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setRole("student");
                setGeneralError("");
              }}
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
              onClick={() => {
                setRole("faculty");
                setGeneralError("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                role === "faculty"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Faculty
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setGeneralError("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                role === "admin"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>

        {/* General Error Banner (e.g. Invalid credentials) */}
        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {generalError}
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
            {successMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          {/* Email input field */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-medium text-zinc-700">
              Institutional Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder={
                  role === "student"
                    ? "student@campus.edu"
                    : role === "faculty"
                    ? "faculty@campus.edu"
                    : "admin@campus.edu"
                }
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className={`pl-9 text-sm ${emailError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
            {/* Red error message under email field */}
            {emailError && (
              <p className="text-xs text-red-600 mt-1 font-medium">{emailError}</p>
            )}
          </div>

          {/* Password input field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-zinc-700"
              >
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-zinc-500 hover:text-zinc-900 underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className={`pl-9 pr-9 text-sm ${passwordError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* Red error message under password field */}
            {passwordError && (
              <p className="text-xs text-red-600 mt-1 font-medium">{passwordError}</p>
            )}
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
            />
            <Label
              htmlFor="remember"
              className="text-xs font-normal text-zinc-600 cursor-pointer"
            >
              Remember me on this device
            </Label>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 font-medium bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            {isLoading ? (
              "Checking credentials..."
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Link to Signup page */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-zinc-900 underline hover:text-zinc-700"
          >
            Create an account
          </Link>
        </div>

        {/* Demo Helper Box: Shows sample credentials so you and your teacher know what to test */}
        <div className="mt-6 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-800 mb-1">
            <Info className="w-3.5 h-3.5 text-zinc-500" />
            <span>Demo Test Credentials (from mock-data.ts):</span>
          </div>
          <ul className="space-y-0.5 text-[11px] text-zinc-500 font-mono">
            <li>Student: <span className="text-zinc-800">student@campus.edu</span> / <span className="text-zinc-800">password123</span></li>
            <li>Faculty: <span className="text-zinc-800">faculty@campus.edu</span> / <span className="text-zinc-800">password123</span></li>
            <li>Admin: <span className="text-zinc-800">admin@campus.edu</span> / <span className="text-zinc-800">password123</span></li>
          </ul>
        </div>

      </div>
    </div>
  );
}
