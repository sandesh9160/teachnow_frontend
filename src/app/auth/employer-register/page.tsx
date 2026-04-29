"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Building2, Check, X, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/services/api/client";
import { CaptchaField } from "@/shared/ui/CaptchaField/CaptchaField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employerRegisterSchema, type EmployerRegisterValues } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

export default function EmployerRegisterPage() {
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();
  const captchaRef = useRef<any>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployerRegisterValues>({
    resolver: zodResolver(employerRegisterSchema),
    defaultValues: {
      company_name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
      captchaToken: "",
    },
  });

  const password = watch("password") || "";

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

  const onSubmit = async (data: EmployerRegisterValues) => {
    try {
      setAuthLoading(true);
      await fetchAPI("/auth/create-employer", {
        method: "POST",
        body: {
          company_name: data.company_name,
          phone: data.phone,
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword,
          captcha_token: data.captchaToken,
          role: "employer",
        },
      });
      toast.success("Employer account created!");
      router.push("/auth/login?role=employer_recruiter");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center py-6 md:py-10 bg-white min-h-[90vh]">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-white shadow-xl md:grid md:grid-cols-[0.8fr_1.2fr]">
        {/* Left - Branding / Info */}
        <div className="hidden flex-col items-center justify-center gap-6 bg-slate-50 p-8 md:flex border-r border-border text-center">
          <div className="flex flex-col items-center gap-4 mb-4">
            <img 
              src="/images/school-illustration.png" 
              alt="Institutional Branding" 
              className="w-48 h-auto drop-shadow-xl animate-float-slow"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100">
              <Building2 className="h-6 w-6 text-secondary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight">Post Your Jobs</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[240px]">
              Join thousands of schools hiring top teaching talent across India.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full max-w-[240px]">
            {[
              "Verified applicant pool",
              "Quick candidate tracking",
              "Direct recruitment tools"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs text-slate-700 font-bold shadow-sm border border-slate-100">
                <Check className="h-3.5 w-3.5 text-secondary" /> {item} 
              </div>
            ))}
          </div>
          
          <div className="pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Institutional Partner
          </div>
        </div>

        {/* Right - Dense Form */}
        <div className="p-6 md:p-10">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 md:hidden">
               <Building2 className="h-5 w-5 text-secondary" />
               <span className="font-bold text-lg">TeachNow</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Account</h1>
            <p className="text-sm text-slate-500 font-medium">Streamlined registration for organizations.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                <input
                  {...register("company_name")}
                  placeholder="Sri Chaitanya School"
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-secondary/10 outline-none",
                    errors.company_name ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-secondary"
                  )}
                  suppressHydrationWarning={true}
                />
                {errors.company_name && (
                  <p className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={10} /> {errors.company_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input
                  {...register("phone")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    e.target.value = value;
                    register("phone").onChange(e);
                  }}
                  type="tel"
                  placeholder="9876543210"
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-secondary/10 outline-none",
                    errors.phone ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-secondary"
                  )}
                  suppressHydrationWarning={true}
                />
                {errors.phone && (
                  <p className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={10} /> {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="hr@institution.com"
                className={cn(
                  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-secondary/10 outline-none",
                  errors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-secondary"
                )}
                suppressHydrationWarning={true}
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle size={10} /> {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm font-medium transition-all focus:ring-2 focus:ring-secondary/10 outline-none",
                      errors.password ? "border-red-500 focus:border-red-500" : (password && !isPasswordValid ? "border-amber-300" : "border-slate-200 focus:border-secondary")
                    )}
                    suppressHydrationWarning={true}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    suppressHydrationWarning={true}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={10} /> {errors.password.message}
                  </p>
                )}
                
                {/* Password Strength Checklist */}
                {password && (
                   <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex gap-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-500 ${hasMinLength ? "bg-secondary w-1/4" : "w-0"}`} />
                         <div className={`h-full transition-all duration-500 ${hasUpperCase ? "bg-secondary w-1/4" : "w-0"}`} />
                         <div className={`h-full transition-all duration-500 ${hasNumber ? "bg-secondary w-1/4" : "w-0"}`} />
                         <div className={`h-full transition-all duration-500 ${hasSpecialChar ? "bg-secondary w-1/4" : "w-0"}`} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                         <div className={`flex items-center gap-1.5 text-[10px] font-bold ${hasMinLength ? "text-secondary" : "text-slate-400"}`}>
                            {hasMinLength ? <Check size={10} /> : <X size={10} />} 8+ Characters
                         </div>
                         <div className={`flex items-center gap-1.5 text-[10px] font-bold ${hasUpperCase ? "text-secondary" : "text-slate-400"}`}>
                            {hasUpperCase ? <Check size={10} /> : <X size={10} />} One Uppercase
                         </div>
                         <div className={`flex items-center gap-1.5 text-[10px] font-bold ${hasNumber ? "text-secondary" : "text-slate-400"}`}>
                            {hasNumber ? <Check size={10} /> : <X size={10} />} One Number
                         </div>
                         <div className={`flex items-center gap-1.5 text-[10px] font-bold ${hasSpecialChar ? "text-secondary" : "text-slate-400"}`}>
                            {hasSpecialChar ? <Check size={10} /> : <X size={10} />} Special Char
                         </div>
                      </div>
                   </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm font-medium transition-all focus:ring-2 focus:ring-secondary/10 outline-none",
                      errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-secondary"
                    )}
                    suppressHydrationWarning={true}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    suppressHydrationWarning={true}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={10} /> {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 py-1 mt-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms_employer"
                  {...register("acceptedTerms")}
                  className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-secondary focus:ring-secondary"
                />
                <label htmlFor="terms_employer" className="text-[11px] text-slate-500 font-medium leading-tight">
                  I agree to the{" "}
                  <a href="/terms-and-conditions" className="font-bold text-secondary hover:underline">Terms of Service</a> and{" "}
                  <a href="/privacy-policy" className="font-bold text-secondary hover:underline">Privacy Policy</a>.
                </label>
              </div>
              {errors.acceptedTerms && (
                <p className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle size={10} /> {errors.acceptedTerms.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <CaptchaField 
                ref={captchaRef} 
                onChange={(token) => setValue("captchaToken", token || "", { shouldValidate: true })} 
                className="mt-2" 
              />
              {errors.captchaToken && (
                <p className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle size={10} /> {errors.captchaToken.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-12 bg-secondary hover:bg-[#209c8d] text-white font-bold rounded-xl shadow-lg shadow-secondary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-[0.98]"
              suppressHydrationWarning={true}
            >
              {authLoading ? "Creating Account..." : "Create Employer Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Already have institutional access?{" "}
            <Link href="/auth/login?role=employer_recruiter" className="font-bold text-secondary hover:underline underline-offset-4 decoration-secondary/30">
              Account Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
