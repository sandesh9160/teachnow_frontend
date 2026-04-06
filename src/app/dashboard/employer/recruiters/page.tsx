import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import RecruitersClient from "./RecruitersClient";

export default async function RecruitersPage() {
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
