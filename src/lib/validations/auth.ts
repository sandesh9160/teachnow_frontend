import * as z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

export const jobSeekerRegisterSchema = z.object({
  name: z.string()
    .min(1, "Full name is required")
    .min(3, "Full name must be at least 3 characters")
    .max(70, "Full name cannot exceed 70 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
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
    .min(1, "Company name is required")
    .min(3, "Company name must be at least 3 characters")
    .max(70, "Company name cannot exceed 70 characters")
    .regex(/^[a-zA-Z\s]+$/, "Company name can only contain letters and spaces"),
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
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
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptedTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  captchaToken: z.string().min(1, "Please complete the security verification"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "job_seeker") {
    return (data.name || "").length >= 1;
  }
  return true;
}, {
  message: "Full name is required",
  path: ["name"],
}).refine((data) => {
  if (data.role === "job_seeker") {
    const name = data.name || "";
    if (name.length === 0) return true;
    return name.length >= 3 && name.length <= 70 && /^[a-zA-Z\s]+$/.test(name);
  }
  return true;
}, {
  message: "Full name must be 3-70 characters and contains only letters/spaces",
  path: ["name"],
}).refine((data) => {
  if (data.role === "employer") {
    return (data.company_name || "").length >= 1;
  }
  return true;
}, {
  message: "Company name is required",
  path: ["company_name"],
}).refine((data) => {
  if (data.role === "employer") {
    const companyName = data.company_name || "";
    if (companyName.length === 0) return true;
    return companyName.length >= 3 && companyName.length <= 70 && /^[a-zA-Z\s]+$/.test(companyName);
  }
  return true;
}, {
  message: "Company name must be 3-70 characters and contains only letters/spaces",
  path: ["company_name"],
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type JobSeekerRegisterValues = z.infer<typeof jobSeekerRegisterSchema>;
export type EmployerRegisterValues = z.infer<typeof employerRegisterSchema>;
