"use client";
import { useState, useRef} from "react";
import Link from "next/link";
import { GraduationCap, User, Building2, Check, X, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/services/api/client";
import { CaptchaField } from "@/shared/ui/CaptchaField/CaptchaField";
import { useBranding } from "@/hooks/useBranding";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();
  const captchaRef = useRef<any>(null);

  const { companyName, companyLogo, brandSecondaryPart, brandPrimaryPart } = useBranding();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Email verification state
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "job_seeker",
      name: "",
      company_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
      captchaToken: "",
    },
  });

  const role = watch("role");
  const password = watch("password") || "";

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

  const sendEmail = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;
    
    const email = watch("email");
    const role = watch("role");
    
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
    const email = watch("email");
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

  const onSubmit = async (data: RegisterValues) => {
    if (!emailVerified) {
      toast.error("Please verify your email address first");
      return;
    }
    const isEmployer = data.role === "employer";
    const endpoint = isEmployer ? "/auth/create-employer" : "/auth/register";

    const payload = isEmployer ? {
      company_name: data.company_name,
      email: data.email,
      password: data.password,
      password_confirmation: data.confirmPassword,
      captcha_token: data.captchaToken,
      role: data.role === "employer" ? null : data.role,
    } : {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role === "job_seeker" ? data.role : null,
      captcha_token: data.captchaToken
    };

    try {
      setAuthLoading(true);
      await fetchAPI(endpoint, {
        method: "POST",
        body: payload,
      });
      toast.success("Account created!");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-4 md:py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-sm md:grid md:grid-cols-[1.2fr_1.8fr]">
        {/* Left - Illustration */}
        <div className="hidden flex-col items-center justify-center gap-8 bg-muted/10 p-8 md:flex border-r border-border">
          {companyLogo ? (
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white shadow-2xl overflow-hidden p-4 transition-transform hover:scale-110 duration-500">
              <img src={companyLogo} alt={companyName} className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white shadow-2xl transition-transform hover:scale-110 duration-500">
              <GraduationCap className="h-14 w-14 text-primary" />
            </div>
          )}
          <div className="text-center">
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

        {/* Right - Form */}
        <div className="p-5 md:p-6 bg-white">
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
            
            <h1 className="font-display text-2xl font-bold text-foreground">Create Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Fill in the details below to get started</p>
          </div>

          {/* Role Selection */}
          <div className="mb-5">
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/20 p-1">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setValue("role", "job_seeker")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${role === "job_seeker" ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <User className="h-3.5 w-3.5" /> Job Seeker
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setValue("role", "employer")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${role === "employer" ? "bg-white text-secondary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Building2 className="h-3.5 w-3.5" /> Employer
              </button>
            </div>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <label htmlFor="email_reg" className="block text-sm font-medium text-foreground">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input 
                  id="email_reg" 
                  {...register("email", {
                    onChange: () => {
                      setEmailVerified(false);
                      setEmailSent(false);
                    }
                  })} 
                  type="email" 
                  required
                  placeholder={role === "employer" ? "hr@institution.com" : "you@example.com"} 
                  className={cn(
                    "flex-1 rounded-xl border bg-white px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                    errors.email ? "border-red-500" : "border-border focus:border-primary",
                    emailVerified && "bg-green-50/50 border-green-500 ring-green-500/20"
                  )}
                  suppressHydrationWarning
                />
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={sendEmail}
                    disabled={sendingEmail || !watch("email") || !!errors.email}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50 shrink-0",
                      role === "job_seeker" ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"
                    )}
                  >
                    {sendingEmail ? <Loader2 className="h-3 w-3 animate-spin" /> : (emailSent ? "Resend" : "Verify")}
                  </button>
                )}
                {emailVerified && (
                  <div className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-200 shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                  <AlertCircle size={10} /> {errors.email.message}
                </p>
              )}
            </div>

            {emailSent && !emailVerified && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label htmlFor="otp_reg" className="block text-sm font-medium text-foreground">Verification OTP</label>
                <div className="flex gap-2">
                  <input
                    id="otp_reg"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-white px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={verifyingOtp || otp.length < 4}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50 shrink-0",
                      role === "job_seeker" ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"
                    )}
                  >
                    {verifyingOtp ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify OTP"}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">Please check your email for the verification code.</p>
              </div>
            )}

            <div 
              onClickCapture={(e) => {
                if (!emailVerified) {
                  e.stopPropagation();
                  toast.error("Please verify your email address first", { id: "verify-email-toast" });
                  document.getElementById("email_reg")?.focus();
                  const emailInput = document.getElementById("email_reg");
                  emailInput?.classList.add("ring-2", "ring-primary/50", "border-primary");
                  setTimeout(() => {
                    emailInput?.classList.remove("ring-2", "ring-primary/50", "border-primary");
                  }, 2000);
                }
              }}
              className={cn(
                "space-y-3 animate-in fade-in slide-in-from-top-4 duration-500",
                !emailVerified && "opacity-60 cursor-not-allowed grayscale-[0.5]"
              )}
            >
              {role === "employer" ? (
                <div className="space-y-1.5">
                  <label htmlFor="company_name_reg" className="block text-sm font-medium text-foreground">Company Name</label>
                  <input 
                    id="company_name_reg" 
                    {...register("company_name")} 
                    type="text" 
                    disabled={!emailVerified}
                    placeholder="Sri Chaitanya Junior College" 
                    className={cn(
                      "w-full rounded-xl border bg-white px-4 py-2 text-sm text-foreground focus:outline-none transition-all",
                      errors.company_name 
                        ? "border-red-500 bg-red-50/30 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" 
                        : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                    suppressHydrationWarning
                  />
                  {errors.company_name && (
                    <p className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                      <AlertCircle size={10} /> {errors.company_name.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label htmlFor="name_reg" className="block text-sm font-medium text-foreground">Full Name</label>
                  <input 
                    id="name_reg" 
                    {...register("name")} 
                    type="text" 
                    disabled={!emailVerified}
                    placeholder="John Doe" 
                    className={cn(
                      "w-full rounded-xl border bg-white px-4 py-2 text-sm text-foreground focus:outline-none transition-all",
                      errors.name 
                        ? "border-red-500 bg-red-50/30 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" 
                        : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                    suppressHydrationWarning
                  />
                  {errors.name && (
                    <p className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                      <AlertCircle size={10} /> {errors.name.message}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div 
              onClickCapture={(e) => {
                if (!emailVerified) {
                  e.stopPropagation();
                  toast.error("Please verify your email address first", { id: "verify-email-toast" });
                  document.getElementById("email_reg")?.focus();
                  const emailInput = document.getElementById("email_reg");
                  emailInput?.classList.add("ring-2", "ring-primary/50", "border-primary");
                  setTimeout(() => {
                    emailInput?.classList.remove("ring-2", "ring-primary/50", "border-primary");
                  }, 2000);
                }
              }}
              className={cn(
                "space-y-3 animate-in fade-in slide-in-from-top-2 duration-300",
                !emailVerified && "opacity-60 cursor-not-allowed grayscale-[0.5]"
              )}
            >
              <div className="space-y-1.5">
                <label htmlFor="pw_reg" className="block text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <input
                    id="pw_reg"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    disabled={!emailVerified}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={(e) => {
                      register("password").onBlur(e);
                      !password && setPasswordFocused(false);
                    }}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-lg border bg-white px-4 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      errors.password ? "border-red-500" : "border-border focus:border-primary"
                    )}
                    suppressHydrationWarning
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                    <AlertCircle size={10} /> {errors.password.message}
                  </p>
                )}

                {/* Password Validation UI */}
                {password && passwordFocused && (
                  <div className="mt-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-1.5 h-1.5 w-full">
                      <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength ? "bg-green-500" : "bg-border"}`} />
                      <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength && hasUpperCase ? "bg-green-500" : "bg-border"}`} />
                      <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength && hasUpperCase && hasNumber ? "bg-green-500" : "bg-border"}`} />
                      <div className={`h-full flex-1 rounded-full transition-colors ${isPasswordValid ? "bg-green-500" : "bg-border"}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[10px]">
                      <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? "text-green-600 font-bold" : "text-muted-foreground"}`}>
                        {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-50" />}
                        <span>At least 8 chars</span>
                      </div>
                      <div className={`flex items-center gap-1.5 transition-colors ${hasUpperCase ? "text-green-600 font-bold" : "text-muted-foreground"}`}>
                        {hasUpperCase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                        <span>One uppercase</span>
                      </div>
                      <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? "text-green-600 font-bold" : "text-muted-foreground"}`}>
                        {hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 transition-colors ${hasSpecialChar ? "text-green-600 font-bold" : "text-muted-foreground"}`}>
                        {hasSpecialChar ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm_pw_reg" className="block text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirm_pw_reg"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    disabled={!emailVerified}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-lg border bg-white px-4 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      errors.confirmPassword ? "border-red-500" : "border-border focus:border-primary"
                    )}
                    suppressHydrationWarning
                  />
                  <div
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                    <AlertCircle size={10} /> {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <CaptchaField
                  ref={captchaRef}
                  onChange={(token) => setValue("captchaToken", token || "", { shouldValidate: true })}
                  className="mt-4"
                />
                {errors.captchaToken && (
                  <p className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                    <AlertCircle size={10} /> {errors.captchaToken.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1 py-1">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    {...register("acceptedTerms")}
                    disabled={!emailVerified}
                    className="mt-1 h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-[11px] text-muted-foreground leading-tight">
                    I agree to the{" "}
                    <a href="/terms-and-conditions" className={`font-medium hover:underline ${role === "job_seeker" ? "text-primary" : "text-secondary"}`}>Terms of Service</a> and{" "}
                    <a href="/privacy-policy" className={`font-medium hover:underline ${role === "job_seeker" ? "text-primary" : "text-secondary"}`}>Privacy Policy</a>.
                  </label>
                </div>
                {errors.acceptedTerms && (
                  <p className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                    <AlertCircle size={10} /> {errors.acceptedTerms.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={authLoading || !emailVerified}
                className={cn(
                  "w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all shadow-lg disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
                  role === "job_seeker" ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "bg-secondary hover:bg-secondary/90 shadow-secondary/20"
                )}
              >
                {authLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}