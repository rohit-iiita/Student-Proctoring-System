import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { getStudentOptionsAction } from "@/modules/complaints/actions";
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

  // Fetch the student directory for the respondent multi-select picker.
  // Non-students see the access-required card anyway, so failures stay silent.
  const studentsResponse =
    user.role === "student" ? await getStudentOptionsAction() : { data: [] };

  return (
    <NewComplaintForm user={user} studentOptions={studentsResponse.data ?? []} />
  );
}
