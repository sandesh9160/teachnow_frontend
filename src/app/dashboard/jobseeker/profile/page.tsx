import { redirect } from "next/navigation";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import ProfileFormClient from "./ProfileFormClient";

export default async function JobSeekerProfilePage() {
  const res = await dashboardServerFetch<Record<string, unknown>>("jobseeker/profile", {
    method: "GET",
  });

  if (res && typeof res === "object" && "status" in res && res.status === false) {
    redirect("/auth/login?message=" + encodeURIComponent("Please login to access this page"));
  }

  const raw = res as Record<string, unknown>;
  const profile = (raw?.data as Record<string, unknown>) ?? raw ?? {};

  return <ProfileFormClient initialProfile={profile} />;
}
