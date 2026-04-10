import { Metadata } from "next";
import NotificationsList from "./NotificationsList";

export const metadata: Metadata = {
  title: "Notifications | JobSeeker Dashboard",
  description: "View and manage your notifications",
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500 text-sm">Stay updated with your job applications and account activity</p>
      </div>
      
      <NotificationsList />
    </div>
  );
}
