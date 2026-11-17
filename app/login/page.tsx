import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { LoginForm } from "./_components/login-form";

export const metadata = {
  title: "Sign In - Student Proctoring System",
  description: "Sign in to access your student, faculty, or admin proctoring dashboard.",
};

// Auth-gated: reads cookies() per request; opt out of prerendering
export const instant = false;

export default async function LoginPage() {
  const user = await getCurrentUserService();

  // If already logged in, redirect straight to dashboard
  if (user) {
    redirect(`/dashboard?role=${user.role}`);
  }

  return <LoginForm />;
}
