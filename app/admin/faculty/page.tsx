import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { getFacultyAction } from "@/modules/admin/actions";
import FacultyList from "./_components/faculty-list";

export const metadata = {
  title: "Manage Faculty - Student Proctoring System",
  description:
    "View the faculty roster with departments, designations, and account status.",
};

// Auth-gated: reads cookies() per request; opt out of prerendering
export const instant = false;

export default async function AdminFacultyPage() {
  const user = await getCurrentUserService();

  // If not logged in, redirect to the sign-in page
  if (!user) {
    redirect("/login");
  }

  // Admin-only module: everyone else goes back to their dashboard
  if (user.role !== "admin") {
    redirect(`/dashboard?role=${user.role}`);
  }

  // Fetch the faculty roster from the database
  const response = await getFacultyAction();

  return (
    <FacultyList
      faculty={response.data ?? []}
      userName={user.fullName}
      userEmail={user.email ?? ""}
      idNumber={user.idNumber ?? null}
    />
  );
}
