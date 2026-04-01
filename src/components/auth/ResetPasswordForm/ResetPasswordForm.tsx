"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Password reset link sent to your email!");
      setIsLoading(false);
      setEmail("");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-foreground">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            id="reset-email" 
            type="email" 
            placeholder="you@example.com" 
            className="pl-10"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={isLoading}
            required
          />
        </div>
      </div>
      
      <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>

      <div className="text-center mt-4 text-sm">
        <span className="text-muted-foreground">Remember your password? </span>
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
