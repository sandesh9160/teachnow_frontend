import { getSessionProfile } from "@/lib/serverAuth";
import EmployerDashboardClient from "./EmployerDashboardClient";

export default async function EmployerDashboardPage() {
  const profile = await getSessionProfile();
  return <EmployerDashboardClient welcomeName={profile?.name ?? "Member"} />;
}
