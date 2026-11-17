import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { NewComplaintForm } from "./_components/new-complaint-form";

export const metadata = {
  title: "Raise a Complaint - Student Proctoring System",
  description:
    "Submit a student grievance or incident complaint for institutional review.",
};

// Auth-gated page using cookies() — render per request instead of prerendering
export const instant = false;

export default async function NewComplaintPage() {
  const user = await getCurrentUserService();

  // If not logged in, redirect to the sign-in page
  if (!user) {
    redirect("/login");
  }

  return <NewComplaintForm user={user} />;
}
