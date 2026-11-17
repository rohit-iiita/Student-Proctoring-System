import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { getNotificationsAction } from "@/modules/notifications/actions";
import NotificationsList from "./_components/notifications-list";

export const metadata = {
  title: "Notifications - Student Proctoring System",
  description:
    "View your in-app notifications, including new complaints and complaint assignments.",
};

// Auth-gated: reads cookies() per request; opt out of prerendering
export const instant = false;

export default async function NotificationsPage() {
  const user = await getCurrentUserService();

  // If not logged in, redirect to the sign-in page
  if (!user) {
    redirect("/login");
  }

  // Fetch the signed-in user's notifications from the database
  const response = await getNotificationsAction();

  return (
    <NotificationsList
      notifications={response.data ?? []}
      userRole={user.role}
      userName={user.fullName}
      userEmail={user.email ?? ""}
      idNumber={user.idNumber ?? null}
    />
  );
}
