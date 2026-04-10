import { redirect } from "next/navigation";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { getSessionProfile } from "@/lib/serverAuth";
import ProfileFormClient from "./ProfileFormClient";

export default async function JobSeekerProfilePage() {
  const [res, sessionProfile] = await Promise.all([
    dashboardServerFetch<Record<string, unknown>>("jobseeker/profile", { method: "GET" }),
    getSessionProfile(),
  ]);

  // Only redirect to login on a genuine auth failure (null response or explicit auth error).
  // A "not found" response means the user hasn't created a profile yet — still authenticated.
  const isAuthFailure = !res || (
    typeof res === "object" &&
    "status" in res &&
    res.status === false &&
    !String((res as any)?.message ?? "").toLowerCase().includes("not found")
  );

  if (isAuthFailure) {
    redirect("/auth/login?message=" + encodeURIComponent("Please login to access this page"));
  }

  const raw = res as Record<string, unknown>;
  
  // A profile DOES NOT exist if we explicitly got a "not found" result. Otherwise, it exists.
  const hasProfile = !(
    raw && 'status' in raw && raw.status === false && 
    String(raw.message || "").toLowerCase().includes("not found")
  );

  // For new users: seed form with signup data (name, email) from the session cookie
  const profileResponse = hasProfile
    ? raw
    : {
        data: {
          name: sessionProfile?.name ?? "",
          email: sessionProfile?.email ?? "",
        },
      };

  return <ProfileFormClient initialResponse={profileResponse} isNewProfile={!hasProfile} />;
}

