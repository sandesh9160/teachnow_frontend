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

  // Handle explicit server errors
  if (raw && raw.status === false && Number(raw.statusCode) === 500) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Profile Unavailable</h1>
        <p className="text-slate-500 max-w-md text-center">
          We encountered a server error while loading your profile. This might be due to a missing jobseeker record. 
          Please contact support if this persists.
        </p>
        <p className="text-xs text-slate-400 bg-slate-100 p-2 rounded">Error: {String(raw.message || "Unknown Server Error")}</p>
      </div>
    );
  }

  // A profile DOES NOT exist if we explicitly got a "not found" result or if the request failed.
  // We only consider a profile to exist if status is not false and we have data.
  const hasProfile = Boolean(raw && raw.status !== false && (raw.data || raw.id));

  // For new users: seed form with signup data (name, email) from the session cookie
  const profileResponse = hasProfile
    ? raw
    : {
      data: {
        name: sessionProfile?.name || "",
        email: sessionProfile?.email || "",
        user: {
          name: sessionProfile?.name || "",
          email: sessionProfile?.email || ""
        }
      }
    };

  return <ProfileFormClient initialResponse={profileResponse} isNewProfile={!hasProfile} />;
}
