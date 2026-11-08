"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  MailIcon,
  LockIcon,
  UserIcon,
  ViewIcon,
  GraduationCapIcon,
  ShieldIcon,
  FingerprintIcon,
  ArrowRightIcon,
  Fingerprint,
  EyeIcon,
  EyeOff,
  EyeOffIcon,
} from "lucide-react";

type UserRole = "student" | "faculty" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<string>("login");
  const [role, setRole] = React.useState<UserRole>("student");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);

  // Signup form state
  const [signupName, setSignupName] = React.useState("");
  const [signupEmail, setSignupEmail] = React.useState("");
  const [signupId, setSignupId] = React.useState("");
  const [signupPassword, setSignupPassword] = React.useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = React.useState("");
  const [agreedToConsent, setAgreedToConsent] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage("Authenticated successfully! Redirecting...");
      router.push("/dashboard");
    }, 1000);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      setStatusMessage("Passwords do not match. Please verify.");
      return;
    }
    if (!agreedToConsent) {
      setStatusMessage("Please accept the attendance & proctoring policy.");
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage("Account registered successfully! Redirecting...");
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-radial from-muted/60 via-background to-background p-4 md:p-8">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card/75 shadow-2xl backdrop-blur-xl lg:grid-cols-12">
        {/* Left side: Smart Campus Showcase */}
        <div className="relative hidden flex-col justify-between border-r border-border/60 bg-gradient-to-br from-muted/50 via-muted/30 to-background p-10 lg:col-span-5 lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <FingerprintIcon className="size-6" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                  SmartCampus
                </h2>
                <p className="text-xs text-muted-foreground">
                  Attendance & Proctoring Suite
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <Badge variant="secondary" className="px-3 py-1 font-medium">
                Next-Gen Campus AI
              </Badge>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                Automated Verification & Integrity Assurance
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Secure facial liveness detection, real-time geofencing, and
                AI-supervised assessments for modern universities.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5 rounded-2xl border border-border/50 bg-background/60 p-3.5 backdrop-blur-sm">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldIcon className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">
                    Continuous AI Proctoring
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Multi-angle anomaly checks & tab switch monitoring during
                    live examinations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-border/50 bg-background/60 p-3.5 backdrop-blur-sm">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCapIcon className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">
                    Instant Attendance Sync
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Biometric & BLE beacon checks push attendance instantly to
                    the faculty portal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div className="rounded-2xl border border-border/40 bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Institutional Security:
                </span>{" "}
                All attendance records and biometric hashes are encrypted
                following ISO 27001 guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Authentication Card with Tabs */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-7">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Header */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                <FingerprintIcon className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-base font-bold text-foreground">
                  SmartCampus
                </h2>
                <p className="text-xs text-muted-foreground">
                  Attendance & Proctoring
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                {activeTab === "login"
                  ? "Sign in to your portal"
                  : "Create your campus profile"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTab === "login"
                  ? "Enter your institutional credentials to continue."
                  : "Register with your university ID for biometric attendance access."}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="mb-5">
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                Select your institutional role
              </Label>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-1">
                {(["student", "faculty", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl py-1.5 text-xs font-medium capitalize transition-all ${
                      role === r
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadcn Tabs Component */}
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val as string);
                setStatusMessage(null);
              }}
              className="w-full"
            >
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-2xl bg-muted/70 p-1">
                <TabsTrigger
                  value="login"
                  className="rounded-xl text-xs font-semibold data-active:bg-background data-active:shadow-xs"
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-xl text-xs font-semibold data-active:bg-background data-active:shadow-xs"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Status Banner */}
              {statusMessage && (
                <div
                  className={`mt-4 rounded-xl border p-3 text-xs font-medium ${
                    statusMessage.includes("successfully")
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              {/* TAB 1: LOGIN */}
              <TabsContent
                value="login"
                className="mt-4 focus-visible:outline-none"
              >
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs">
                      Institutional Email / Roll No.
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-email"
                        type="email"
                        required
                        placeholder={
                          role === "student"
                            ? "student@campus.edu"
                            : role === "faculty"
                              ? "faculty@campus.edu"
                              : "admin@campus.edu"
                        }
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-9 pr-3 rounded-2xl"
                      />
                      <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-xs">
                        Password
                      </Label>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(
                            "Password reset instructions will be sent to your institutional email.",
                          );
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-9 pr-10 rounded-2xl"
                      />
                      <LockIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-xs font-normal text-muted-foreground cursor-pointer"
                    >
                      Remember me on this institutional device
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl font-semibold shadow-md"
                  >
                    {isLoading ? (
                      "Authenticating..."
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Sign In as{" "}
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                        <ArrowRightIcon className="size-4" />
                      </span>
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/80" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or connect via
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="w-full rounded-2xl font-medium"
                  >
                    Single Sign-On (University SAML / Google)
                  </Button>
                </form>
              </TabsContent>

              {/* TAB 2: SIGNUP */}
              <TabsContent
                value="signup"
                className="mt-4 focus-visible:outline-none"
              >
                <form onSubmit={handleSignup} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-xs">
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-name"
                        type="text"
                        required
                        placeholder="Dr. Jane Doe / Alex Smith"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-9 rounded-2xl"
                      />
                      <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email" className="text-xs">
                        Campus Email
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-email"
                          type="email"
                          required
                          placeholder="user@campus.edu"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="pl-9 rounded-2xl"
                        />
                        <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-id" className="text-xs">
                        {role === "student"
                          ? "Roll / Reg Number"
                          : "Employee ID"}
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-id"
                          type="text"
                          required
                          placeholder={
                            role === "student" ? "2024CSB101" : "FAC-8821"
                          }
                          value={signupId}
                          onChange={(e) => setSignupId(e.target.value)}
                          className="pl-9 rounded-2xl"
                        />
                        <GraduationCapIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password" className="text-xs">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          placeholder="Min 8 characters"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-9 pr-8 rounded-2xl"
                        />
                        <LockIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="size-3.5" />
                          ) : (
                            <EyeIcon className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="signup-confirm-password"
                        className="text-xs"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={8}
                          placeholder="Repeat password"
                          value={signupConfirmPassword}
                          onChange={(e) =>
                            setSignupConfirmPassword(e.target.value)
                          }
                          className="pl-9 pr-8 rounded-2xl"
                        />
                        <LockIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="size-3.5" />
                          ) : (
                            <EyeIcon className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <Checkbox
                      id="terms-consent"
                      checked={agreedToConsent}
                      onCheckedChange={(checked) =>
                        setAgreedToConsent(!!checked)
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="terms-consent"
                      className="text-xs leading-normal font-normal text-muted-foreground cursor-pointer"
                    >
                      I agree to the campus attendance verification protocol &
                      automated biometric proctoring terms.
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl font-semibold shadow-md"
                  >
                    {isLoading ? (
                      "Registering Account..."
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Create {role.charAt(0).toUpperCase() + role.slice(1)}{" "}
                        Account
                        <ArrowRightIcon className="size-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              By proceeding, you verify your affiliation with the accredited
              institution.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
