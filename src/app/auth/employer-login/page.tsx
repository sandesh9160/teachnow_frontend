"use client";

import { Button } from "@/shared/ui/Buttons/Buttons";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function EmployerLoginPage() {
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    //console.log("[handleLogin] Form submitted", { email, password });
    if (typeof document !== "undefined") {
      //console.log("[handleLogin] Cookies before login:", document.cookie);
    }

    try {
      await login("employer", { email, password });

      //console.log("[handleLogin] Login successful");
      if (typeof document !== "undefined") {
        //console.log("[handleLogin] Cookies after login:", document.cookie);
      }
    } catch (err: any) {
      //console.error("[handleLogin] Login failed", err);
      alert(err?.message || "Login failed"); // optional for quick feedback
    }
  };

  return (
    <div className="container flex items-center justify-center py-12 md:py-20">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Employer Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Post jobs and find qualified teachers</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Company Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hr@yourschool.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button
            variant="hero"
            className="w-full"
            size="lg"
            type="submit"
            disabled={authLoading}
          >
            {authLoading ? "Signing in..." : "Log In as Employer"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/auth/register" className="font-semibold text-primary hover:underline">
            Register as Employer
          </a>
        </p>
      </div>
    </div>
  );
}