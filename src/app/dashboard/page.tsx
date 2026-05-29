import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/serverAuth";
import { cookies } from "next/headers";

async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("laravel-session");
  cookieStore.delete("laravel_session");
  cookieStore.delete("XSRF-TOKEN");
}

export default async function DashboardIndexPage() {
  const profile = await getSessionProfile();

  if (!profile) {
    await clearAuthCookies();

    redirect(
      "/auth/login?message=" +
      encodeURIComponent("Please login to access this page")
    );
  }

  if (profile.role === "employer") {
    redirect("/dashboard/employer");
  }

  if (profile.role === "recruiter") {
    redirect("/dashboard/recruiter");
  }

  redirect("/dashboard/jobseeker");
}