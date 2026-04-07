import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruitersClient from "../../employer/recruiters/RecruitersClient";

export default async function RecruiterUsersPage() {
  const usersRes = await dashboardServerFetch("employer/users");

  return (
    <RecruitersClient 
      initialData={{
        status: usersRes?.status || false,
        total_users: usersRes?.total_users || 0,
        data: usersRes?.data || []
      }} 
    />
  );
}
