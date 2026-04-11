import { Metadata } from "next";
import NotificationsList from "./NotificationsList";

export const metadata: Metadata = {
  title: "Notifications | Recruiter Dashboard",
  description: "View and manage your job notifications",
};

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 py-6 sm:py-8">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Notifications</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Stay updated with your job applications and account activity</p>
      </div>
      
      <NotificationsList />
    </div>
  );
}
