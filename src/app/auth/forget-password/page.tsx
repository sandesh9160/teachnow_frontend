"use client";

import { Suspense } from "react";
import Link from "next/link";
import { GraduationCap, KeyRound } from "lucide-react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm/ResetPasswordForm";

function ForgetPasswordContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-3">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-sm md:grid md:grid-cols-[1.2fr_1.8fr]">

        {/* LEFT PANEL — Shared brand panel */}
        <div className="relative hidden flex-col items-center justify-start gap-3 overflow-hidden bg-muted/10 p-4 pt-5 md:flex border-r border-border">
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">TeachNow</h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-[180px]">
                Restoring your access to India&apos;s leading education portal.
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-xl border border-border/50 shadow-sm space-y-3">
               <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto">
                  <KeyRound className="w-4 h-4" />
               </div>
               <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">Security Check</p>
               <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                  We verify every password reset request to ensure your account security remains top priority.
               </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Reset Form */}
        <div className="p-3 md:p-6 bg-white min-h-[480px] flex flex-col">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-4 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-bold text-foreground">TeachNow</span>
          </div>

          <div className="mb-4">
            <h1 className="font-display text-xl font-bold text-foreground">Account Recovery</h1>
            <p className="mt-1 text-xs text-muted-foreground font-medium italic">Securely reset your credentials</p>
          </div>

          <div className="flex-1">
            <ResetPasswordForm />
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForgetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ForgetPasswordContent />
    </Suspense>
  );
}
