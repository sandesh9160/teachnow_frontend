import * as z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Please enter a valid phone number");

export const jobSeekerRegisterSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters").max(100, "Full name cannot exceed 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptedTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  captchaToken: z.string().min(1, "Please complete the security verification"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const employerRegisterSchema = z.object({
  company_name: z.string()
    .min(3, "Company name must be at least 3 characters")
    .max(100, "Company name cannot exceed 100 characters"),
  phone: phoneSchema,
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptedTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  captchaToken: z.string().min(1, "Please complete the security verification"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const registerSchema = z.object({
  role: z.enum(["job_seeker", "employer"]),
  name: z.string().optional(),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptedTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  captchaToken: z.string().min(1, "Please complete the security verification"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "job_seeker") {
    return !!data.name && data.name.length >= 3 && data.name.length <= 100;
  }
  return true;
}, {
  message: "Full name (3-100 characters) is required",
  path: ["name"],
}).refine((data) => {
  if (data.role === "job_seeker") {
    return /^[6-9]\d{9}$/.test(data.phone || "");
  }
  return true;
}, {
  message: "Valid 10-digit Indian phone number is required",
  path: ["phone"],
}).refine((data) => {
  if (data.role === "employer") {
    return !!data.company_name && data.company_name.length >= 3 && data.company_name.length <= 100;
  }
  return true;
}, {
  message: "Company name (3-100 characters) is required",
  path: ["company_name"],
}).refine((data) => {
  if (data.role === "employer") {
    return /^[6-9]\d{9}$/.test(data.phone || "");
  }
  return true;
}, {
  message: "Valid 10-digit Indian phone number is required",
  path: ["phone"],
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type JobSeekerRegisterValues = z.infer<typeof jobSeekerRegisterSchema>;
export type EmployerRegisterValues = z.infer<typeof employerRegisterSchema>;
