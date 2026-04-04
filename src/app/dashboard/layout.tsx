import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { getSessionProfile } from "@/lib/serverAuth";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/auth/login?message=" + encodeURIComponent("Please login to access this page"));
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans antialiased text-gray-900 selection:bg-primary/10 selection:text-primary">
      <DashboardSidebar userRole={profile.role} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto min-h-full">{children}</div>
      </main>
    </div>
  );
}
