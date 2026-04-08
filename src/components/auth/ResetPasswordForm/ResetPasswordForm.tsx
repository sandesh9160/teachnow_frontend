"use client";
import { useState } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { Mail, Lock, KeyRound, ChevronLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { fetchAPI } from "@/services/api/client";
import { useRouter } from "next/navigation";

const ResetPasswordForm = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      await fetchAPI("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      toast.success("OTP has been sent to your email!");
      setStep(2);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      setIsLoading(true);
      await fetchAPI("/auth/verify-otp", {
        method: "POST",
        body: { email, otp: Number(otp) },
      });
      toast.success("Verification successful!");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setIsLoading(true);
      await fetchAPI("/auth/reset-password", {
        method: "POST",
        body: { 
          email, 
          otp: Number(otp),
          password,
          password_confirmation: confirmPassword
        },
      });
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              step === s ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : 
              step > s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 mx-2 rounded-full ${step > s ? "bg-emerald-500" : "bg-slate-100"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div className="space-y-1 mb-4">
             <h2 className="text-lg font-bold text-slate-900 tracking-tight">Forgot Password?</h2>
             <p className="text-xs text-slate-500 font-medium">Enter your email and we'll send you a recovery code.</p>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="reset-email" className="text-[11px] font-bold text-slate-700 uppercase tracking-tight opacity-70">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="you@example.com" 
                className="pl-12 h-11 bg-slate-50 border-slate-100 rounded-xl focus:bg-white transition-all font-medium text-sm"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <Button type="submit" variant="hero" className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
            {isLoading ? "Sending Code..." : "Send Verification Code"}
            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="text-center space-y-1 mb-4">
             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2 border border-indigo-100">
                <KeyRound className="w-5 h-5" />
             </div>
             <h2 className="text-lg font-bold text-slate-900 tracking-tight">Verify Code</h2>
             <p className="text-xs text-slate-500 font-medium">We've sent code to <span className="text-primary font-bold">{email}</span></p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-[11px] font-bold text-slate-700 uppercase tracking-tight opacity-70">Enter OTP Code</Label>
            <div className="relative group text-center">
              <Input 
                id="otp" 
                type="text" 
                maxLength={6}
                placeholder="000000" 
                className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:bg-white transition-all font-black text-center text-xl tracking-[0.5em] placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-200"
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <Button type="submit" variant="hero" className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="w-full py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" /> Back to Email
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1 mb-4">
             <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create New Password</h2>
             <p className="text-xs text-slate-500 font-medium">Please enter a strong, unique password.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-[11px] font-bold text-slate-700 uppercase tracking-tight opacity-70">New Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="new-password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-11 bg-slate-50 border-slate-100 rounded-xl focus:bg-white transition-all font-medium text-sm"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password" className="text-[11px] font-bold text-slate-700 uppercase tracking-tight opacity-70">Confirm New Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="confirm-new-password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-11 bg-slate-50 border-slate-100 rounded-xl focus:bg-white transition-all font-medium text-sm"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>
          
          <Button type="submit" variant="hero" className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 pt-2" disabled={isLoading}>
            {isLoading ? "Updating..." : "Reset Password"}
          </Button>
        </form>
      )}

      <div className="text-center mt-6 text-[11px] text-slate-500 font-medium">
        <Link href="/auth/login" className="font-bold text-primary hover:underline underline-offset-2">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
