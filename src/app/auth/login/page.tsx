"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GraduationCap, User, Building2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth, UserRole } from "@/context/AuthContext";

function LoginContent() {
  const searchParams = useSearchParams();
  const { login, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>("jobseeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const redirectMessage = searchParams.get("message");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loginRole = role === "employer" ? "employer" : "jobseeker";
      await login(loginRole, { email, password });
    } catch (err: any) {
      // Error handled in context/toast
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-3">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-sm md:grid md:grid-cols-[1.2fr_1.8fr]">

        {/* LEFT PANEL — White + brand */}
        <div className="relative hidden flex-col items-center justify-start gap-3 overflow-hidden bg-muted/10 p-4 pt-5 md:flex border-r border-border">
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">TeachNow</h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-[180px]">
                India's #1 education job portal
              </p>
            </div>
            <img
              src="/images/teacher-illustration.png"
              alt="Teacher"
              className="w-56 drop-shadow-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="flex flex-col gap-2 w-full">
              {["12,000+ active jobs", "3,500+ verified schools", "Trusted by educators"].map((t) => (
                <div key={t} className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs text-foreground font-medium shadow-sm border border-border/50">
                  <span className="text-primary font-bold">✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — form */}
        <div className="p-3 md:p-4 bg-white">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-bold text-foreground">TeachNow</span>
          </div>

          <div className="mb-2">
            <h1 className="font-display text-base font-bold text-foreground">Welcome back</h1>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {redirectMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {redirectMessage}
            </div>
          )}

          {/* Role toggle */}
          <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-muted/20 p-1">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setRole("jobseeker")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${role === "jobseeker" ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <User className="h-3.5 w-3.5" /> Job Seeker
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setRole("employer")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${role === "employer" ? "bg-white text-secondary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Building2 className="h-3.5 w-3.5" /> Employer
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login_email" className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
              <input
                id="login_email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login_password" className="block text-sm font-medium text-foreground">Password</label>
                <Link href="/auth/forget-password" className="px-0 text-[10px] text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login_password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  suppressHydrationWarning
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              suppressHydrationWarning
              className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all shadow-lg mt-5 disabled:opacity-50 disabled:cursor-wait ${role === "jobseeker" ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "bg-secondary hover:bg-secondary/90 shadow-secondary/20"
                }`}
            >
              {authLoading ? "Signing in..." : `Log In as ${role === "jobseeker" ? "Job Seeker" : "Employer"}`}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-primary hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
