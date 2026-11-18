import { redirect } from "next/navigation";
import { getCurrentUserService } from "@/modules/auth/services";
import { ProfileSettings } from "./_components/profile-settings";

export const metadata = {
  title: "Profile Settings - Student Proctoring System",
  description:
    "View and update your personal information and account password.",
};

// Auth-gated: reads cookies() per request; opt out of prerendering
export const instant = false;

export default async function ProfilePage() {
  const user = await getCurrentUserService();

  // If not logged in, redirect to the sign-in page
  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileSettings
      user={{
        userId: user.userId,
        email: user.email ?? "",
        fullName: user.fullName,
        role: user.role,
        idNumber: user.idNumber ?? null,
      }}
    />
  );
}
