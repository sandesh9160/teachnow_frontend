import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruitersClient from "./RecruitersClient";

export default async function RecruitersPage() {
  const [usersRes, profileFlag] = await Promise.all([
    dashboardServerFetch("employer/users"),
    dashboardServerFetch("profile-flag")
  ]);

  return (
    <RecruitersClient 
      initialData={{
        status: usersRes?.status || false,
        total_users: usersRes?.total_users || 0,
        data: usersRes?.data || []
      }} 
      isProfileComplete={profileFlag?.is_profile_complete === 1}
    />
  );
}
