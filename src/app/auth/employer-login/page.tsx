"use client";

import { Button } from "@/shared/ui/Buttons/Buttons";
import { Building2, Briefcase } from "lucide-react";
import { useState } from "react";
import { EmailSignInAction } from "@/lib/sign-in";
import { dashboardUrlAfterLogin } from "@/lib/postLoginRedirect";
import { toast } from "sonner";

export default function EmployerLoginPage() {
  const [authLoading, setAuthLoading] = useState(false);
  const [role, setRole] = useState<"employer" | "recruiter">("employer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      const res = await EmailSignInAction({ email, password, role });
      if (!res.status) {
        toast.error(res.message ?? "Login failed");
        return;
      }
      toast.success("Logged in!");
      const u = "user" in res ? (res as { user?: { user_type?: string } }).user : undefined;
      window.location.href = dashboardUrlAfterLogin(u);
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center py-12 md:py-20 animate-in fade-in duration-500">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary transition-transform duration-300 hover:scale-110 shadow-lg shadow-primary/20">
            {role === "employer" ? (
              <Building2 className="h-7 w-7 text-primary-foreground" />
            ) : (
              <Briefcase className="h-7 w-7 text-primary-foreground" />
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {role === "employer" ? "Employer Login" : "Recruiter Login"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === "employer" 
              ? "Post jobs and find qualified teachers" 
              : "Source candidates and manage recruitment"}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-muted/30 p-1.5 rounded-xl border border-border mb-6">
          <button
            type="button"
            onClick={() => setRole("employer")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              role === "employer" 
                ? "bg-white text-primary shadow-sm border border-border" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Employer
          </button>
          <button
            type="button"
            onClick={() => setRole("recruiter")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              role === "recruiter" 
                ? "bg-white text-primary shadow-sm border border-border" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Recruiter
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>

          <Button variant="hero" className="w-full h-11 text-sm font-bold shadow-lg shadow-primary/20 mt-2" size="lg" type="submit" disabled={authLoading}>
            {authLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
               `Log In as ${role.charAt(0).toUpperCase() + role.slice(1)}`
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/auth/register" className="font-bold text-primary hover:underline underline-offset-4 decoration-primary/30">
            Register for free
          </a>
        </p>
      </div>
    </div>
  );
}
