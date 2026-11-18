import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { getStudentsAction } from "@/modules/admin/actions";
import StudentsList from "./_components/students-list";

export const metadata = {
  title: "Manage Students - Student Proctoring System",
  description:
    "View registered students, their enrollment details, and account status.",
};

// Auth-gated: reads cookies() per request; opt out of prerendering
export const instant = false;

export default async function AdminStudentsPage() {
  const user = await getCurrentUserService();

  // If not logged in, redirect to the sign-in page
  if (!user) {
    redirect("/login");
  }

  // Admin-only module: everyone else goes back to their dashboard
  if (user.role !== "admin") {
    redirect(`/dashboard?role=${user.role}`);
  }

  // Fetch the registered student roster from the database
  const response = await getStudentsAction();

  return (
    <StudentsList
      students={response.data ?? []}
      userName={user.fullName}
      userEmail={user.email ?? ""}
      idNumber={user.idNumber ?? null}
    />
  );
}
