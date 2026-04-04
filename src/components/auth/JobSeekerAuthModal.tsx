"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/Modal/Modal";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { EmailSignInAction } from "@/lib/sign-in";
import { toast } from "sonner";
import { resetSharedClientSession } from "@/hooks/useClientSession";
import { GraduationCap, Mail, Lock } from "lucide-react";

interface JobSeekerAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

const JobSeekerAuthModal = ({ open, onClose, onSuccess, onSwitchToRegister }: JobSeekerAuthModalProps) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setAuthLoading(true);
      const res = await EmailSignInAction({ email: loginEmail, password: loginPassword });
      if (!res.status) {
        toast.error(res.message ?? "Login failed");
        return;
      }
      resetSharedClientSession();
      toast.success("Logged in!");
      onClose();
      setTimeout(() => onSuccess(), 300);
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md border-border bg-card p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-lg font-bold text-foreground">
              Apply for this Job
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="login-email" type="email" placeholder="you@example.com" className="pl-10 h-10"
                  value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="login-password" type="password" placeholder="••••••••" className="pl-10 h-10"
                  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
            </div>
            <Button
              type="submit"
              variant="hero"
              className="w-full"
              size="lg"
              disabled={authLoading}
            >
              {authLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => { onClose(); setTimeout(onSwitchToRegister, 200); }}
              className="font-medium text-primary hover:underline"
            >
              Register as Job Seeker
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobSeekerAuthModal;
