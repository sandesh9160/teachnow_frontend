"use client";

import { useState, useRef } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { fetchAPI } from "@/services/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Building2 } from "lucide-react";
import Link from "next/link";
import { CaptchaField } from "@/shared/ui/CaptchaField/CaptchaField";


const RegisterForm = () => {
  const [role, setRole] = useState<"job_seeker" | "employer">("job_seeker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const captchaRef = useRef<any>(null);


  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the security verification");
      return;
    }

    try {
      setIsLoading(true);
      const isEmployer = role === "employer";
      const endpoint = isEmployer ? "/auth/create-employer" : "/auth/register";

      const payload: any = isEmployer ? {
        company_name: name,
        email,
        password,
        password_confirmation: confirmPassword,
        role: role,
        captcha_token: captchaToken
      } : {
        name,
        email,
        password,
        role: role,
        captcha_token: captchaToken
      };

      const res = await fetchAPI<any>(endpoint, {
        method: "POST",
        body: payload,
      });

      if (res.status || res.success) {
        toast.success("Account created successfully!");
        router.push("/auth/login?message=Registration successful. Please login to continue.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
      // Reset captcha on failure
      setCaptchaToken(null);
      captchaRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Role Selection */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
        <button
          type="button"
          onClick={() => setRole("job_seeker")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${role === "job_seeker"
              ? "bg-white text-primary shadow-sm border border-slate-100"
              : "text-slate-500 hover:text-slate-700 font-semibold"
            }`}
        >
          <User className="w-4 h-4" />
          Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setRole("employer")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${role === "employer"
              ? "bg-white text-primary shadow-sm border border-slate-100"
              : "text-slate-500 hover:text-slate-700 font-semibold"
            }`}
        >
          <Building2 className="w-4 h-4" />
          Employer
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-name" className="text-slate-700 font-bold ml-1">
            {role === "job_seeker" ? "Full Name" : "Institution / Company Name"}
          </Label>

          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="reg-name"
              placeholder={role === "job_seeker" ? "Enter your full name" : "e.g. Sri Chaitanya School"}
              className="pl-12 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:bg-white transition-all font-medium"

              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email" className="text-slate-700 font-bold ml-1">Email Address</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              className="pl-12 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:bg-white transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Phone number removed */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-slate-700 font-bold ml-1 text-xs">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                className="pl-12 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:bg-white transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-slate-700 font-bold ml-1 text-xs">Confirm Password</Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="pl-12 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:bg-white transition-all font-medium"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                disabled={isLoading}
                required
              />
            </div>
          </div>
        </div>

        <div className="py-2 scale-90 origin-left">
          <CaptchaField ref={captchaRef} onChange={setCaptchaToken} />
        </div>

        <Button
          type="submit"
          variant="hero"
          className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </div>
          ) : (
            "Register Account"
          )}
        </Button>

        <div className="text-center mt-6 text-sm text-slate-500 font-medium">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-primary hover:underline underline-offset-4">
            Login here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
