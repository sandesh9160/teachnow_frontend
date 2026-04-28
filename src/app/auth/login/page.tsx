"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GraduationCap, User, Building2, Eye, EyeOff } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { EmailSignInAction } from "@/lib/sign-in";
import { dashboardUrlAfterLogin } from "@/lib/postLoginRedirect";
import { toast } from "sonner";

type LoginRole = "job_seeker" | "employer" | "recruiter";

function LoginContent() {
  const searchParams = useSearchParams();
  const [authLoading, setAuthLoading] = useState(false);
  const initialRole = searchParams?.get("role") as LoginRole | "employer_recruiter";
  const [role, setRole] = useState<LoginRole | "employer_recruiter">(initialRole || "job_seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const redirectMessage = searchParams?.get("message");

  const { companyName, companyLogo, brandSecondaryPart, brandPrimaryPart } = useBranding();

  // Show redirect message or session expired as toast if present
  useState(() => {
    if (typeof window !== "undefined") {
      const isSessionExpired = searchParams?.get("session_expired");
      if (isSessionExpired || redirectMessage) {
        setTimeout(() => {
          if (isSessionExpired) {
            toast.error("Session expired. Please login again.", {
              description: "Your session has timed out due to inactivity.",
              duration: 5000,
            });
          } else if (redirectMessage) {
            toast.error(redirectMessage, {
              description: "Please sign in to continue your session.",
              duration: 5000,
            });
          }

          // Clean URL to remove params
          const url = new URL(window.location.href);
          url.searchParams.delete("message");
          url.searchParams.delete("session_expired");
          window.history.replaceState({}, "", url.toString());
        }, 100);
      }
    }
    return null;
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      const res = await EmailSignInAction({
        email,
        password,
        role: role === "employer_recruiter" ? "employer" : role
      });

      if (!res.status) {
        toast.error(res.message);
      } else {
        toast.success("Logged in!");
        const u = "user" in res ? (res as { user?: { user_type?: string } }).user : undefined;
        
        // Priority: Check for explicit redirect parameter
        const redirectUrl = searchParams?.get("redirect");
        if (redirectUrl && redirectUrl.startsWith("/")) {
          // Strip any trailing # fragment that may have been appended
          window.location.href = redirectUrl.split("#")[0];
        } else {
          window.location.href = dashboardUrlAfterLogin(u);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during login.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-4 md:py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-sm md:grid md:grid-cols-2">

        {/* LEFT PANEL — White + brand */}
        <div className="relative hidden flex-col items-center justify-center gap-8 overflow-hidden bg-muted/5 p-8 md:flex border-r border-border">
          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            {companyLogo ? (
              <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white shadow-2xl overflow-hidden p-4 transition-transform hover:scale-110 duration-500">
                <img src={companyLogo} alt={companyName} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white shadow-2xl transition-transform hover:scale-110 duration-500">
                <GraduationCap className="h-14 w-14 text-primary" />
              </div>
            )}
            <div>
              <h2 className="font-display text-4xl font-black text-foreground tracking-tighter">
                {brandSecondaryPart}<span className="text-primary">{brandPrimaryPart}</span>
              </h2>
            </div>
            <div className="relative mt-6 w-full max-w-[300px] overflow-hidden rounded-2xl drop-shadow-xl transition-transform duration-500 hover:scale-105">
              <img
                src="/images/auth-illustrator.png"
                alt="Teaching Illustration"
                className="w-full h-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — form */}
        <div className="p-5 md:p-6 bg-white min-h-[400px] flex flex-col">
          <div className="mb-4">
            {/* Mobile Brand - only visible on small screens */}
            <div className="flex items-center gap-2 mb-4 md:hidden">
              {companyLogo ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md overflow-hidden p-1.5 border border-border">
                  <img src={companyLogo} alt={companyName} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <span className="font-display text-xl font-bold text-foreground">
                {brandSecondaryPart}<span className="text-primary">{brandPrimaryPart}</span>
              </span>
            </div>
            
            <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/20 p-1">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setRole("job_seeker")}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition-all ${role === "job_seeker" ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <User className="h-3 w-3" /> Job Seeker
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setRole("employer_recruiter")}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition-all ${role === "employer_recruiter" ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Building2 className="h-3 w-3" /> Employer
            </button>
          </div>

          <form className="space-y-3 flex-1" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login_email" className="mb-1.5 block text-[11px] font-bold text-slate-700 uppercase tracking-tight opacity-70">Email Address</label>
              <input
                id="login_email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-slate-50 px-4 py-1.5 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login_password" className="block text-[11px] font-bold text-slate-700 uppercase tracking-tight opacity-70">Password</label>
                <Link href="/auth/forget-password" className="px-0 text-[10px] text-primary font-bold hover:underline">
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
                  className="w-full rounded-xl border border-border bg-slate-50 px-4 py-1.5 pr-10 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
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
              className={`w-full rounded-xl py-2 text-xs font-bold text-white transition-all shadow-lg mt-2 disabled:opacity-50 disabled:cursor-wait bg-primary hover:bg-primary/90 shadow-primary/20 active:scale-[0.98]
                }`}
            >
              {authLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                `Log In as ${role === "job_seeker" ? "Job Seeker" : "Employer"}`
              )}
            </button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-semibold text-primary hover:underline">Create an account</Link>
            </p>
          </form>
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
