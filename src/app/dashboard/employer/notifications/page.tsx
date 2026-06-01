import { Metadata } from "next";
import NotificationsList from "./NotificationsList";

export const metadata: Metadata = {
  title: "Notifications | Employer Dashboard",
  description: "View and manage your institution notifications",
};

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-3 px-3 py-4">
      <div>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-slate-500 text-[11px] font-medium">Stay updated with institution activity and recruiter updates</p>
      </div>
      
      <NotificationsList />
    </div>
  );
}
