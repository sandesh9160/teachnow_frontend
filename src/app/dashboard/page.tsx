// import { redirect } from "next/navigation";
// import { getSessionProfile } from "@/lib/serverAuth";




// export default async function DashboardIndexPage() {
//   const profile = await getSessionProfile();
//   if (!profile) {

//     redirect("/auth/login?message=" + encodeURIComponent("Please login to access this page"));
//   }
//   if (profile.role === "employer") {
//     redirect("/dashboard/employer");
//   }
//   if (profile.role === "recruiter") {
//     redirect("/dashboard/recruiter");
//   }
//   redirect("/dashboard/jobseeker");
// }


import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/serverAuth";
import { clearAuthCookies } from "@/lib/clearAuthCookies";

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