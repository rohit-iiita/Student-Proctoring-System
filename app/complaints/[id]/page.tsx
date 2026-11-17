import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import {
  getComplaintByIdAction,
  getFacultyListAction,
} from "@/modules/complaints/actions";
import type { TFacultyOption } from "@/modules/complaints/types";
import ComplaintDetailView from "./_components/complaint-detail-view";

export const metadata = {
  title: "Complaint Details - Student Proctoring System",
  description: "Review a student grievance, its attachments, and resolution status.",
};

// This route reads cookies()/params at request time (auth-gated); opt out of prerendering
export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCurrentUserService();

  // If not logged in, redirect to the sign-in page
  if (!user) {
    redirect("/login");
  }

  // Fetch the complaint and (for admins) the faculty list in parallel
  const [complaintResponse, facultyResponse] = await Promise.all([
    getComplaintByIdAction(id),
    user.role === "admin"
      ? getFacultyListAction()
      : Promise.resolve({ success: true as const, data: [] as TFacultyOption[] }),
  ]);

  return (
    <ComplaintDetailView
      complaint={complaintResponse.data ?? null}
      userRole={user.role}
      userName={user.fullName}
      userEmail={user.email ?? ""}
      facultyOptions={facultyResponse.data ?? []}
    />
  );
}
