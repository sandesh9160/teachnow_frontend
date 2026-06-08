"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResumeManagerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/jobseeker/resume?tab=uploaded");
  }, [router]);

  return null;
}
