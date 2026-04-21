"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployerLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login?role=employer_recruiter");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
