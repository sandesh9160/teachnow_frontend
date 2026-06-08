"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/Modal/Modal";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { EmailSignInAction } from "@/lib/sign-in";
import { fetchAPI } from "@/services/api/client";
import { toast } from "sonner";
import { resetSharedClientSession } from "@/hooks/useClientSession";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Check, Loader2, X, AlertCircle } from "lucide-react";
import { CaptchaField } from "@/shared/ui/CaptchaField/CaptchaField";
interface QuickAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subTitle?: string;
  submitText?: string;
  initialMode?: "login" | "register";
}

/**
 * A specialized, lightweight authentication modal for platform gates (Jobs & Resources).
 * Designed for speed and minimal distraction, handling both login and registration locally.
 */
export default function QuickAuthModal({
  open,
  onClose,
  onSuccess,
  title = "Authentication Required",
  subTitle,
  submitText = "Continue",
  initialMode = "login"
}: QuickAuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [role] = useState<"job_seeker" | "employer">("job_seeker");
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [regName, setRegName] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const captchaRef = useRef<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Email verification state
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email Address is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setFormErrors({});

    try {
      setLoading(true);
      const res = await EmailSignInAction({ email, password, role });
      if (!res.status) {
        toast.error(res.message ?? "Login failed");
        return;
      }
      resetSharedClientSession();
      toast.success("Welcome back!");
      onClose();
      // Small delay to ensure modal close animation finishes before triggering success action
      setTimeout(onSuccess, 150);
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!email) return;
    try {
      setSendingEmail(true);
      await fetchAPI("/auth/send-email", {
        method: "POST",
        body: { 
          email, 
          role: role === "job_seeker" ? role : null 
        },
      });
      setEmailSent(true);
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setVerifyingOtp(true);
      await fetchAPI("/auth/verify-email", {
        method: "POST",
        body: { email, otp },
      });
      setEmailVerified(true);
      toast.success("Email verified successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!regName.trim()) errors.regName = "Full Name is required";
    if (!email.trim()) errors.email = "Email Address is required";
    if (!password) errors.password = "Password is required";
    if (!confirmPassword) errors.confirmPassword = "Confirm Password is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setFormErrors({});

    if (!emailVerified) {
      toast.error("Please verify your email address");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password is too weak", {
        description: "Please follow the complexity requirements."
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the captcha verification");
      return;
    }

    try {
      setLoading(true);
      await fetchAPI("/auth/register", {
        method: "POST",
        body: {
          name: regName,
          email,
          password,
          role: role === "job_seeker" ? role : null,
          captcha_token: captchaToken,
        },
      });
      toast.success("Account created! Logging you in...");
      
      // Auto-login after registration for seamless UX
      const res = await EmailSignInAction({ email, password, role });
      if (res.status) {
        resetSharedClientSession();
        onClose();
        setTimeout(onSuccess, 150);
      } else {
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {/* 
        Ultra-compact layout: reduced width (380px) and minimal internal padding.
      */}
      <DialogContent className="sm:max-w-[400px] w-[95vw] max-h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-[0_30px_100px_rgba(0,0,0,0.25)] bg-white rounded-2xl transition-all duration-300 ease-out">
        <DialogHeader className="p-5 py-4 sm:p-7 sm:pb-4 bg-slate-50/80 border-b border-slate-100/50">
          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {mode === "login" ? title : "Join TeachNow"}
          </DialogTitle>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
            {mode === "login" 
              ? (subTitle || "Sign in to access your account.") 
              : `Create your free account.`}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 pt-3 sm:pt-3 scrollbar-hide">
          <div className="flex bg-slate-100/80 p-1 rounded-xl mb-4 border border-slate-200/60">
            <div className="flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-primary bg-white rounded-lg shadow-sm border border-slate-100">
              <User className="h-3.5 w-3.5" />
               Login
            </div>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-2" noValidate>
            {mode === "register" && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">
                  {role === "job_seeker" ? "Full Name" : "Institution"} <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <Input 
                    placeholder={role === "job_seeker" ? "Full Name" : "Institution"}
                    className={`pl-3 h-11 bg-white rounded-xl transition-all text-[13px] font-semibold ${
                      formErrors.regName 
                        ? "border border-red-500 bg-red-50/30 ring-2 ring-red-500/20" 
                        : "border border-slate-200 focus:ring-4 focus:ring-primary/5"
                    }`}
                    value={regName} 
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (formErrors.regName) setFormErrors({ ...formErrors, regName: "" });
                    }} 
                    required 
                  />
                  {formErrors.regName && (
                    <p className="flex items-center gap-1 mt-1 text-[10px] font-bold text-red-500">
                      <AlertCircle size={10} /> {formErrors.regName}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">Email Address <span className="text-red-500">*</span></Label>
              <div className="flex gap-1.5">
                <div className="relative group flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-50 rounded-lg border border-slate-100 group-focus-within:bg-primary/5 group-focus-within:border-primary/20 transition-all">
                    <Mail className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input 
                    type="email" 
                    placeholder="you@email.com" 
                    className={`pl-12 h-11 bg-white rounded-xl transition-all text-[13px] font-semibold w-full ${
                      formErrors.email 
                        ? "border border-red-500 bg-red-50/30 ring-2 ring-red-500/20" 
                        : "border border-slate-200 focus:ring-4 focus:ring-primary/5"
                    }`}
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                      if (mode === "register") {
                        setEmailVerified(false);
                        setEmailSent(false);
                      }
                    }} 
                    required 
                  />
                  {formErrors.email && (
                    <p className="flex items-center gap-1 mt-1 text-[10px] font-bold text-red-500">
                      <AlertCircle size={10} /> {formErrors.email}
                    </p>
                  )}
                </div>
                {mode === "register" && !emailVerified && (
                  <button
                    type="button"
                    onClick={sendEmail}
                    disabled={sendingEmail || !email}
                    className="px-3 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm disabled:opacity-50 transition-all shrink-0 w-[70px] flex items-center justify-center"
                  >
                    {sendingEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (emailSent ? "Resend" : "Verify")}
                  </button>
                )}
                {mode === "register" && emailVerified && (
                  <div className="px-3 h-11 rounded-xl bg-green-50 border border-green-200 text-green-600 flex items-center justify-center shrink-0 w-[70px]">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>

            {mode === "register" && emailSent && !emailVerified && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">Verification OTP</Label>
                <div className="flex gap-1.5">
                  <div className="relative group flex-1">
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-3 h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-semibold w-full"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={verifyingOtp || otp.length < 4}
                    className="px-3 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm disabled:opacity-50 transition-all shrink-0 w-[80px] flex items-center justify-center"
                  >
                    {verifyingOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verify OTP"}
                  </button>
                </div>
              </div>
            )}

            <div className={`${mode === "register" ? "grid grid-cols-2 gap-2" : "space-y-1"} animate-in fade-in slide-in-from-top-1 duration-300`}>
              <div className="space-y-1">
                <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">Password <span className="text-red-500">*</span></Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-50 rounded-lg border border-slate-100 group-focus-within:bg-primary/5 group-focus-within:border-primary/20 transition-all">
                    <Lock className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••" 
                    className={`pl-12 pr-10 h-11 bg-white rounded-xl transition-all text-[13px] font-semibold ${
                      formErrors.password 
                        ? "border border-red-500 bg-red-50/30 ring-2 ring-red-500/20" 
                        : "border border-slate-200 focus:ring-4 focus:ring-primary/5"
                    }`}
                    value={password} 
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                    }} 
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => {
                      if (!password) setPasswordFocused(false);
                    }}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {formErrors.password && (
                    <p className="flex items-center gap-1 mt-1 absolute -bottom-5 text-[10px] font-bold text-red-500">
                      <AlertCircle size={10} /> {formErrors.password}
                    </p>
                  )}
                </div>
              </div>

              {mode === "register" && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                  <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">Confirm Password <span className="text-red-500">*</span></Label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-50 rounded-lg border border-slate-100 group-focus-within:bg-primary/5 group-focus-within:border-primary/20 transition-all">
                      <Lock className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••" 
                      className={`pl-12 pr-10 h-11 bg-white rounded-xl transition-all text-[13px] font-semibold ${
                        formErrors.confirmPassword 
                          ? "border border-red-500 bg-red-50/30 ring-2 ring-red-500/20" 
                          : "border border-slate-200 focus:ring-4 focus:ring-primary/5"
                      }`}
                      value={confirmPassword} 
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: "" });
                      }} 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {formErrors.confirmPassword && (
                      <p className="flex items-center gap-1 mt-1 absolute -bottom-5 text-[10px] font-bold text-red-500">
                        <AlertCircle size={10} /> {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {mode === "register" && password && passwordFocused && (
                <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex gap-1.5 h-1.5 w-full">
                    <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength ? "bg-green-500" : "bg-slate-200"}`} />
                    <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength && hasUpperCase ? "bg-green-500" : "bg-slate-200"}`} />
                    <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength && hasUpperCase && hasNumber ? "bg-green-500" : "bg-slate-200"}`} />
                    <div className={`h-full flex-1 rounded-full transition-colors ${isPasswordValid ? "bg-green-500" : "bg-slate-200"}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[10px]">
                    <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? "text-green-600 font-bold" : "text-slate-400"}`}>
                      {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-50" />}
                      <span>At least 8 chars</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${hasUpperCase ? "text-green-600 font-bold" : "text-slate-400"}`}>
                      {hasUpperCase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                      <span>One uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? "text-green-600 font-bold" : "text-slate-400"}`}>
                      {hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${hasSpecialChar ? "text-green-600 font-bold" : "text-slate-400"}`}>
                      {hasSpecialChar ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                      <span>Special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {mode === "register" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300 mt-2">
                <div className="space-y-1">
                  <CaptchaField
                    ref={captchaRef}
                    onChange={(token) => setCaptchaToken(token || "")}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary"
                    required
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-500 leading-tight">
                    I agree to the{" "}
                    <a href="/terms-and-conditions" className="font-medium hover:underline text-primary">Terms of Service</a> and{" "}
                    <a href="/privacy-policy" className="font-medium hover:underline text-primary">Privacy Policy</a>.
                  </label>
                </div>
              </div>
            )}

            <Button 
              variant="hero" 
              className="w-full h-10 rounded-lg text-sm font-bold shadow-lg shadow-primary/10 mt-2 active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                mode === "login" ? submitText : "Create Account & Continue"
              )}
            </Button>

            <div className="text-center pt-2">
              {mode === "login" ? (
                <button type="button" onClick={() => setMode("register")} className="text-[11px] font-bold text-slate-500 hover:text-primary transition-all">
                  Don&apos;t have an account? <span className="text-primary underline-offset-2 hover:underline">Create one free</span>
                </button>
              ) : (
                <button type="button" onClick={() => setMode("login")} className="text-[11px] font-bold text-slate-500 hover:text-primary transition-all flex items-center justify-center gap-1.5 mx-auto">
                  <ArrowLeft className="h-3 w-3" /> Already have an account? <span className="text-primary underline-offset-2 hover:underline">Log in</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
