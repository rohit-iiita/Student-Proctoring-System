import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { SignupForm } from "./_components/signup-form";

export const metadata = {
  title: "Create an Account - Student Proctoring System",
  description: "Register for the student proctoring and complaint management system.",
};

// Auth-gated: reads cookies() per request; opt out of prerendering
export const instant = false;

export default async function SignupPage() {
  const user = await getCurrentUserService();

  // If already logged in, redirect directly to dashboard
  if (user) {
    redirect(`/dashboard?role=${user.role}`);
  }

  return <SignupForm />;
}
