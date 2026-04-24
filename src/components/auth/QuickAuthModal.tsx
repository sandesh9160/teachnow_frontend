"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/Modal/Modal";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { EmailSignInAction } from "@/lib/sign-in";
import { fetchAPI } from "@/services/api/client";
import { toast } from "sonner";
import { resetSharedClientSession } from "@/hooks/useClientSession";
import { Mail, Lock, User, ArrowLeft} from "lucide-react";

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
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password is too weak", {
        description: "Please follow the complexity requirements."
      });
      return;
    }

    try {
      setLoading(true);
      await fetchAPI("/auth/register", {
        method: "POST",
        body: {
          full_name: regName,
          email,
          phone: regPhone,
          password,
          role: role,
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

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-2">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">
                    {role === "job_seeker" ? "Full Name" : "Institution"}
                  </Label>
                  <div className="relative group">
                    <Input 
                      placeholder={role === "job_seeker" ? "Full Name" : "Institution"}
                      className="pl-3 h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-semibold"
                      value={regName} 
                      onChange={(e) => setRegName(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">Phone</Label>
                  <div className="relative group">
                    <Input 
                      type="tel" 
                      placeholder="+91 98765" 
                      className="pl-3 h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-semibold"
                      value={regPhone} 
                      onChange={(e) => setRegPhone(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">Email Address</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-50 rounded-lg border border-slate-100 group-focus-within:bg-primary/5 group-focus-within:border-primary/20 transition-all">
                  <Mail className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                  type="email" 
                  placeholder="you@email.com" 
                  className="pl-12 h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-semibold"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className={`${mode === "register" ? "grid grid-cols-2 gap-2" : "space-y-1"} animate-in fade-in slide-in-from-top-1 duration-300`}>
              <div className="space-y-1">
                <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">Password</Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-50 rounded-lg border border-slate-100 group-focus-within:bg-primary/5 group-focus-within:border-primary/20 transition-all">
                    <Lock className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input 
                    type="password" 
                    placeholder="••••" 
                    className="pl-12 h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-semibold"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {mode === "register" && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                  <Label className="text-slate-700 font-bold ml-0.5 text-[9px] tracking-wide uppercase opacity-70">Confirm</Label>
                   <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-50 rounded-lg border border-slate-100 group-focus-within:bg-primary/5 group-focus-within:border-primary/20 transition-all">
                      <Lock className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input 
                      type="password" 
                      placeholder="••••" 
                      className="pl-12 h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-semibold"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              )}
            </div>

            {mode === "register" && (
              <div className="mt-1 space-y-1 px-1">
                <div className="flex gap-0.5 h-1 w-full">
                  <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength ? "bg-green-500" : "bg-slate-200"}`} />
                  <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength && hasUpperCase ? "bg-green-500" : "bg-slate-200"}`} />
                  <div className={`h-full flex-1 rounded-full transition-colors ${hasMinLength && hasUpperCase && hasNumber ? "bg-green-500" : "bg-slate-200"}`} />
                  <div className={`h-full flex-1 rounded-full transition-colors ${isPasswordValid ? "bg-green-500" : "bg-slate-200"}`} />
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 opacity-80 leading-none">
                  <div className={`flex items-center gap-0.5 text-[7.5px] uppercase tracking-tighter ${hasMinLength ? "text-green-600 font-bold" : "text-slate-400"}`}>8+ CHARS</div>
                  <div className={`flex items-center gap-0.5 text-[7.5px] uppercase tracking-tighter ${hasUpperCase ? "text-green-600 font-bold" : "text-slate-400"}`}>UPPERCASE</div>
                  <div className={`flex items-center gap-0.5 text-[7.5px] uppercase tracking-tighter ${hasNumber ? "text-green-600 font-bold" : "text-slate-400"}`}>NUMBER</div>
                  <div className={`flex items-center gap-0.5 text-[7.5px] uppercase tracking-tighter ${hasSpecialChar ? "text-green-600 font-bold" : "text-slate-400"}`}>SPECIAL</div>
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
