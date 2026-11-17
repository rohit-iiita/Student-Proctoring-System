import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { getComplaintsAction } from "@/modules/complaints/actions";
import ComplaintsList from "./_components/complaints-list";

export const metadata = {
  title: "Complaints - Student Proctoring System",
  description:
    "View and track student grievances across submitted, under review, resolved, and rejected cases.",
};

// Auth-gated: reads cookies() per request; opt out of prerendering
export const instant = false;

export default async function ComplaintsPage() {
  const user = await getCurrentUserService();

  // If not logged in, redirect to the sign-in page
  if (!user) {
    redirect("/login");
  }

  // Fetch role-scoped complaints from the database
  const response = await getComplaintsAction();

  return (
    <ComplaintsList
      complaints={response.data ?? []}
      userRole={user.role}
      userName={user.fullName}
      userEmail={user.email ?? ""}
      idNumber={user.idNumber ?? null}
    />
  );
}
