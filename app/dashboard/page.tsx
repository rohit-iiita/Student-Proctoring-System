import { getDashboardDataAction } from "@/modules/dashboard/actions";
import type { TDashboardRole } from "@/modules/dashboard/types";
import { DashboardShell } from "./_components/dashboard-shell";

export const metadata = {
  title: "Dashboard - Student Proctoring System",
  description: "View complaints, meetings, and activity for students, faculty, and administrators.",
};

// Auth-gated: reads cookies() per request; opt out of prerendering
export const instant = false;

interface PageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const roleParam = resolvedParams?.role as TDashboardRole | undefined;

  // Fetch data using server action on the server
  const response = await getDashboardDataAction(roleParam);

  return <DashboardShell initialData={response.data} />;
}
