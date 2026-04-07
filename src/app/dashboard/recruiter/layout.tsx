import { requireSessionRole } from "@/lib/serverAuth";

export default async function RecruiterDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSessionRole("recruiter");
  return <>{children}</>;
}

