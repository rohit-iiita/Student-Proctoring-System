"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { mockUsers, MockUser } from "@/lib/mock-data";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, Info } from "lucide-react";

export default function ForgotPasswordPage() {
  // 1. Form state variables
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Helper function to check if email has @ and a dot (.)
  const isValidEmail = (emailStr: string) => {
    const atPosition = emailStr.indexOf("@");
    const dotPosition = emailStr.lastIndexOf(".");
    return (
      atPosition > 0 &&
      dotPosition > atPosition + 1 &&
      dotPosition < emailStr.length - 1
    );
  };

  // 2. Validate email and check against mockUsers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    const trimmedEmail = email.trim();

    // Check 1: Required
    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }

    // Check 2: Valid format
    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address with @ and a domain (e.g. user@campus.edu).");
      return;
    }

    // Check 3: Mock check against existing mockUsers
    // NOTE: In the real application, password reset verification and email dispatch
    // will be performed securely by the backend (Supabase Auth / Resend service).
    const foundUser = mockUsers.find(
      (u: MockUser) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (!foundUser) {
      setEmailError("No account found with this email.");
      return;
    }

    setIsLoading(true);

    // Simulate sending recovery email
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-sm p-8">
        
        {/* Header icon and title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Forgot Password?
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Enter your campus email to receive password recovery instructions.
          </p>
        </div>

        {/* If submitted and found in mockUsers, show friendly success card */}
        {isSubmitted ? (
          <div className="text-center space-y-4 py-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Reset Link Sent!
              </h2>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                A reset link has been sent to your email (
                <span className="font-semibold text-zinc-800">{email}</span>
                ). Please check your inbox.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/login" className="w-full block">
                <Button className="w-full font-medium bg-zinc-900 hover:bg-zinc-800 text-white">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Forgot Password Form */
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Email input field */}
            <div className="space-y-1">
              <Label htmlFor="reset-email" className="text-xs font-medium text-zinc-700">
                Institutional Email Address
              </Label>
              <div className="relative">
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="e.g. student@campus.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className={`pl-9 text-sm ${emailError ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
              {/* Red error message shown directly under the email field */}
              {emailError && (
                <p className="text-xs text-red-600 mt-1 font-medium">{emailError}</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 font-medium bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              {isLoading ? "Checking email..." : "Send Reset Link"}
            </Button>

            {/* Back to login link */}
            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>

            {/* Demo Helper Box */}
            <div className="mt-6 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-800 mb-1">
                <Info className="w-3.5 h-3.5 text-zinc-500" />
                <span>Test with registered mock emails:</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">
                student@campus.edu, faculty@campus.edu, or admin@campus.edu
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
