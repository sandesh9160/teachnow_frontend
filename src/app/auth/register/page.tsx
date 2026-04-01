"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { GraduationCap, User, Building2, Check, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { LocationPicker } from "@/shared/ui/LocationPicker/LocationPicker";
import { CaptchaField } from "@/shared/ui/CaptchaField/CaptchaField";

export default function RegisterPage() {
  const { register, loading: authLoading } = useAuth();
  const captchaRef = useRef<any>(null);
  
  // Jobseeker as default to ensure fields always show
 const [role, setRole] = useState<"jobseeker" | "employer">("jobseeker");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [mapLink, setMapLink] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    company_description: "",
    industry: "",
    website: "",
    phone: "",
    city: "",
    country: "",
    address: "",
    full_name: "",
    email: "",
  });

  const [password, setPassword] = useState("");

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      toast.error("Security verification required", {
        description: "Please complete the reCAPTCHA to continue."
      });
      return;
    }

    if (!role) {
      toast.error("Please select your role.");
      return;
    }

    if (role === "employer") {
      if (!formData.company_name) { toast.error("Company Name is required"); return; }
      if (!formData.company_description) { toast.error("Company Description is required"); return; }
      if (!formData.industry) { toast.error("Industry is required"); return; }
      if (!formData.phone) { toast.error("Phone Number is required"); return; }
      if (!mapLink) { toast.error("Please pin your institution's location on the map"); return; }
      if (!formData.city) { toast.error("City is required"); return; }
      if (!formData.country) { toast.error("Country is required"); return; }
      if (!formData.address) { toast.error("Full Address is required"); return; }
    } else if (role === "jobseeker") {
      if (!formData.full_name) { toast.error("Full Name is required"); return; }
    }

    if (!formData.email) { toast.error("Email Address is required"); return; }
    if (!formData.email.includes("@")) { toast.error("Please enter a valid email address"); return; }
    
    if (!password) { toast.error("Password is required"); return; }
    if (!isPasswordValid) {
      toast.error("Password is too weak", {
        description: "Please ensure all security requirements are met."
      });
      return;
    }

    let latitude = null;
    let longitude = null;

    if (mapLink) {
      const [lat, lng] = mapLink.split(",").map(Number);
      latitude = lat;
      longitude = lng;
    }

    const payload = {
      ...formData,
      password,
      latitude,
      longitude,
      captcha_token: captchaToken
    };

    try {
      await register(role, payload);
    } catch (err: any) {
      // Error is handled in context via toast
    }
  };

  return (
    <div className="container flex items-center justify-center py-4 md:py-5 bg-white">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-sm md:grid md:grid-cols-[1.2fr_1.8fr]">
        {/* Left - Illustration */}
        <div className="hidden flex-col items-center justify-start gap-4 bg-muted/10 p-4 pt-5 md:flex border-r border-border">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-xl font-bold text-foreground">TeachNow</h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              India's #1 education job portal
            </p>
          </div>
          <img
            src="/images/school-illustration.png"
            alt="School Illustration"
            className="w-60 drop-shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="flex flex-col gap-2 w-full">
            {["Free to join", "Verified schools & institutes", "Apply with one click"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs text-foreground font-medium shadow-sm border border-border/50">
                <span className="text-primary font-bold">✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right - Form */}
        <div className="p-3 md:p-4 bg-white">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-base font-bold text-foreground">TeachNow</span>
            </div>
            <h1 className="font-display text-base font-bold text-foreground">Create Account</h1>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Join India's #1 education job portal</p>
          </div>

          {/* Role Selection */}
          <div className="mb-2">
            <label className="mb-1 block text-xs font-semibold text-foreground">I am a</label>
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-muted/20 p-1">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setRole("jobseeker")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  role === "jobseeker" ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-3.5 w-3.5" /> Job Seeker
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setRole("employer")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  role === "employer" ? "bg-white text-secondary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" /> Employer
              </button>
            </div>
          </div>

          <form className="space-y-1.5" onSubmit={handleSignup}>
            {role === "employer" ? (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label htmlFor="company_name_reg" className="mb-1.5 block text-sm font-medium text-foreground">Company Name</label>
                  <input id="company_name_reg" name="company_name" value={formData.company_name} onChange={handleChange} type="text" suppressHydrationWarning required placeholder="Sri Chaitanya Junior College" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label htmlFor="desc_reg" className="mb-1.5 block text-sm font-medium text-foreground">Company Description</label>
                  <textarea id="desc_reg" name="company_description" value={formData.company_description} onChange={handleChange} suppressHydrationWarning required placeholder="Our school is a Tech leveraging school..." className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="industry_reg" className="mb-1.5 block text-sm font-medium text-foreground">Industry</label>
                    <input id="industry_reg" name="industry" value={formData.industry} onChange={handleChange} type="text" suppressHydrationWarning required placeholder="Education industry" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label htmlFor="web_reg" className="mb-1.5 block text-sm font-medium text-foreground">Website</label>
                    <input id="web_reg" name="website" value={formData.website} onChange={handleChange} type="text" suppressHydrationWarning placeholder="www.srichaitanya.com" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone_reg" className="mb-1.5 block text-sm font-medium text-foreground">Phone Number</label>
                  <input id="phone_reg" name="phone" value={formData.phone} onChange={handleChange} type="tel" suppressHydrationWarning required placeholder="+91 9638527410" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Pin Your Institution's Location</label>
                  <LocationPicker value={mapLink} onChange={setMapLink} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="city_reg" className="mb-1.5 block text-sm font-medium text-foreground">City</label>
                    <input id="city_reg" name="city" value={formData.city} onChange={handleChange} type="text" suppressHydrationWarning required placeholder="Hyderabad" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label htmlFor="country_reg" className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
                    <input id="country_reg" name="country" value={formData.country} onChange={handleChange} type="text" suppressHydrationWarning required placeholder="INDIA" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label htmlFor="addr_reg" className="mb-1.5 block text-sm font-medium text-foreground">Full Address</label>
                  <input id="addr_reg" name="address" value={formData.address} onChange={handleChange} type="text" suppressHydrationWarning required placeholder="Manjeera mall, JNTU" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
            ) : role === "jobseeker" ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label htmlFor="name_reg" className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
                <input id="name_reg" name="full_name" value={formData.full_name} onChange={handleChange} type="text" suppressHydrationWarning required placeholder="John Doe" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            ) : null}

            {role && (
              <>
                <div>
                  <label htmlFor="email_reg" className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
                  <input id="email_reg" name="email" value={formData.email} onChange={handleChange} type="email" suppressHydrationWarning required placeholder={role === "employer" ? "durgakishorechitturi@gmail.com" : "you@example.com"} className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label htmlFor="pw_reg" className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <input 
                      id="pw_reg"
                      type={showPassword ? "text" : "password"}
                      required
                      suppressHydrationWarning
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </div>
                  </div>
                  
                  {/* Password Validation UI */}
                  <div className="mt-3.5 space-y-3">
                    <div className="flex gap-1.5 h-1.5 w-full">
                      <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength ? "bg-green-500" : "bg-border"}`} />
                      <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength && hasUpperCase ? "bg-green-500" : "bg-border"}`} />
                      <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength && hasUpperCase && hasNumber ? "bg-green-500" : "bg-border"}`} />
                      <div className={`h-full flex-1 rounded-full transition-colors ${isPasswordValid ? "bg-green-500" : "bg-border"}`} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs">
                      <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
                        {hasMinLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                        <span>At least 8 chars</span>
                      </div>
                      <div className={`flex items-center gap-1.5 transition-colors ${hasUpperCase ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
                        {hasUpperCase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                        <span>One uppercase</span>
                      </div>
                      <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
                        {hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 transition-colors ${hasSpecialChar ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
                        {hasSpecialChar ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CaptchaField 
                  ref={captchaRef}
                  onChange={setCaptchaToken}
                  className="mt-5"
                />

                <div className="text-[11px] text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <a href="#" className={`font-medium hover:underline ${role === "jobseeker" ? "text-primary" : "text-secondary"}`}>Terms of Service</a> and{" "}
                  <a href="#" className={`font-medium hover:underline ${role === "jobseeker" ? "text-primary" : "text-secondary"}`}>Privacy Policy</a>.
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-wait ${
                    role === "jobseeker" ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "bg-secondary hover:bg-secondary/90 shadow-secondary/20"
                  }`}
                >
                  {authLoading ? "Creating Account..." : "Create Account"}
                </button>
              </>
            )}
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