"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/Modal/Modal";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Mail, Lock, User, Phone } from "lucide-react";

interface JobSeekerRegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const JobSeekerRegisterModal = ({ open, onClose, onSuccess, onSwitchToLogin }: JobSeekerRegisterModalProps) => {
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const { register, loading: authLoading } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register("jobseeker", {
        full_name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      });
      onClose();
      setTimeout(() => onSuccess(), 300);
    } catch (err: any) {
      // Error is handled in context via toast
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
              Create Job Seeker Account
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="text-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="reg-name" placeholder="Your full name" className="pl-10 h-10"
                  value={regName} onChange={(e) => setRegName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="reg-email" type="email" placeholder="you@example.com" className="pl-10 h-10"
                  value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone" className="text-foreground">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="reg-phone" type="tel" placeholder="+91 9876543210" className="pl-10 h-10"
                  value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="reg-password" type="password" placeholder="••••••••" className="pl-10 h-10"
                  value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
              </div>
            </div>
            <Button
              type="submit"
              variant="hero"
              className="w-full"
              size="lg"
              disabled={authLoading}
            >
              {authLoading ? "Creating account..." : "Create Job Seeker Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => { onClose(); setTimeout(onSwitchToLogin, 200); }}
              className="font-medium text-primary hover:underline"
            >
              Login as Job Seeker
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobSeekerRegisterModal;
