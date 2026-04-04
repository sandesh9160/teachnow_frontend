import { requireSessionRole } from "@/lib/serverAuth";

export default async function EmployerDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSessionRole("employer");
  return <>{children}</>;
}
