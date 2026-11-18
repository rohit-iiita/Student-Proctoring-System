import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { getMyMeetingsAction } from "@/modules/meetings/actions";
import MeetingsList from "./_components/meetings-list";

export const metadata = {
  title: "Meetings - Student Proctoring System",
  description:
    "View complaint inquiry meetings you are invited to, with schedules, locations and your invitation response.",
};

// Auth-gated: reads cookies() per request; opt out of prerendering
export const instant = false;

export default async function MeetingsPage() {
  const user = await getCurrentUserService();

  // If not logged in, redirect to the sign-in page
  if (!user) {
    redirect("/login");
  }

  // Fetch role-scoped meetings from the database via the meetings module actions
  const response = await getMyMeetingsAction();

  return (
    <MeetingsList
      meetings={response.data ?? []}
      userRole={user.role}
      userName={user.fullName}
      userEmail={user.email ?? ""}
      idNumber={user.idNumber ?? null}
    />
  );
}
