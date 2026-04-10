import { Metadata } from "next";
import NotificationsList from "./NotificationsList";

export const metadata: Metadata = {
  title: "Notifications | Employer Dashboard",
  description: "View and manage your institution notifications",
};

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-slate-500 text-sm font-medium">Stay updated with institution activity and recruiter updates</p>
      </div>
      
      <NotificationsList />
    </div>
  );
}
