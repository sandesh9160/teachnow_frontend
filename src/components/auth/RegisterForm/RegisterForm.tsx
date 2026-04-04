"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { fetchAPI } from "@/services/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone } from "lucide-react";
import Link from "next/link";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await fetchAPI("/auth/register", {
        method: "POST",
        body: {
          full_name: name,
          email,
          phone,
          password,
          role: "jobseeker",
        },
      });
      toast.success("Account created!");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-name" className="text-foreground font-medium">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reg-name"
            placeholder="Your full name"
            className="pl-10 h-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email" className="text-foreground font-medium">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            className="pl-10 h-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-phone" className="text-foreground font-medium">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reg-phone"
            type="tel"
            placeholder="+91 9876543210"
            className="pl-10 h-10"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password" className="text-foreground font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reg-password"
            type="password"
            placeholder="••••••••"
            className="pl-10 h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Register"}
      </Button>

      <div className="text-center mt-4 text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Login here
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
