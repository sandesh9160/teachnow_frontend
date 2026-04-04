import { requireSessionRole } from "@/lib/serverAuth";

export default async function JobSeekerDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSessionRole("job_seeker");
  return <>{children}</>;
}
