"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";
import type { EducationPayload, EducationRecord } from "@/types/education";
import type { ExperiencePayload, ExperienceRecord } from "@/types/experience";
import {
  Loader2, Mail, MapPin, Briefcase, GraduationCap,
  Camera, Trash2, Edit2, CheckSquare, Square,
  X, BookOpen, Award, UserCircle,
  Globe, Search, PlusCircle, Phone
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { toast } from "sonner";
import { DatePicker } from "@/shared/ui/DatePicker/DatePicker";
import { format, parseISO, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

function toEducationPayload(form: any): EducationPayload {
  return {
    degree: form.degree,
    institution: form.institution,
    field_of_study: form.field_of_study ?? "",
    start_year: form.start_date ? String(new Date(form.start_date).getFullYear()) : "",
    end_year: form.is_current ? "" : (form.end_date ? String(new Date(form.end_date).getFullYear()) : ""),
    grade: form.grade?.trim() ?? "",
    // description: form.description ?? "",
    is_current: form.is_current ? 1 : 0,
  };
}

function recordToFormDates(edu: EducationRecord) {
  const start = edu.start_date ?? (edu.start_year ? `${String(edu.start_year).slice(0, 4)}-01-01` : "");
  const end = edu.end_date ?? (edu.end_year ? `${String(edu.end_year).slice(0, 4)}-01-01` : "");
  return { start_date: start, end_date: end };
}

function toExperiencePayload(form: any): ExperiencePayload {
  return {
    job_title: form.job_title,
    company_name: form.company_name,
    location: form.location ?? "",
    start_date: form.start_date,
    end_date: form.is_current ? undefined : form.end_date,
    is_current: form.is_current ? 1 : 0,
    description: form.description ?? "",
  };
}

function mapServerProfile(initial: Record<string, any>) {
  const data = initial?.data || initial || {};
  return {
    name: String(data.user?.name || data.name || data.full_name || ""),
    email: String(data.user?.email || data.email || ""),
    phone: String(data.phone || ""),
    location: String(data.location || ""),
    title: String(data.title || data.job_title || data.headline || ""),
    bio: String(data.bio || data.about || data.summary || ""),
    experience_years: Number(data.experience_years || 0),
    availability: String(data.availability || "open"),
    dob: data.dob ? String(data.dob).split("T")[0] : "",
    portfolio_website: String(data.portfolio_website || ""),
    profile_photo: String(data.profile_photo || ""),
    gender: String(data.gender || ""),
    // open_to_work: String(data.open_to_work || "Actively Looking"),
    notice_period: String(data.notice_period || ""),
    // expected_salary: String(data.expected_salary || ""),
    // preferred_location: String(data.preferred_location || ""),
    // teaching_mode: String(data.teaching_mode || ""),
    skills: Array.isArray(data.skills) ? data.skills.map((s: any) => {
      if (typeof s === 'object' && s !== null) return s.name || s.id || "";
      return String(s);
    }) : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
  };
}

export default function ProfileFormClient({
  initialResponse,
  isNewProfile = false,
}: {
  initialResponse: Record<string, unknown>;
  isNewProfile?: boolean;
}) {
  const router = useRouter();
  const { updateProfile, createProfile } = useProfile();
  const {
    data: education,
    // loading: eduLoading,
    createEducation,
    updateEducation,
    deleteEducation,
  } = useEducation();

  const {
    data: experiences,
    // loading: expLoading,
    createExperience,
    updateExperience,
    deleteExperience,
  } = useExperience();

  const [mode, setMode] = useState<"view" | "edit">(isNewProfile ? "edit" : "view");
  const [saving, setSaving] = useState(false);
  const [isNew] = useState(isNewProfile);

  const [showEduForm, setShowEduForm] = useState(false);
  const [editingEduId, setEditingEduId] = useState<number | string | null>(null);

  const [showExpForm, setShowExpForm] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | string | null>(null);

  const [profileData, setProfileData] = useState(() => mapServerProfile(initialResponse));
  const [availableSkills] = useState<any[]>(
    Array.isArray(initialResponse.skills) ? (initialResponse.skills as any[]) : []
  );

  const [eduFormData, setEduFormData] = useState({
    institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", grade: "", description: "",
    is_current: false,
    grade_type: "Percentage" as "Percentage" | "CGPA"
  });

  const [expFormData, setExpFormData] = useState({
    job_title: "", company_name: "", location: "", start_date: "", end_date: "", is_current: false, description: ""
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [localEduList, setLocalEduList] = useState<EducationRecord[]>([]);
  const [localExpList, setLocalExpList] = useState<ExperienceRecord[]>([]);

  const [skillInput, setSkillInput] = useState("");
  // const [langInput, setLangInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certIssuedAt, setCertIssuedAt] = useState("");
  const [certExpiresAt, setCertExpiresAt] = useState("");

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSug, setShowLocationSug] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [eduErrors, setEduErrors] = useState<Record<string, string>>({});
  const [expErrors, setExpErrors] = useState<Record<string, string>>({});
  const [searchType, setSearchType] = useState<"location" | "preferred_location" | "exp_location">("location");

  const [certSuggestions, setCertSuggestions] = useState<string[]>([]);
  const [showCertSug, setShowCertSug] = useState(false);

  useEffect(() => {
    if (education) setLocalEduList(education);
  }, [education]);

  useEffect(() => {
    if (experiences) setLocalExpList(experiences);
  }, [experiences]);

  const fetchLocations = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
      const res = await fetch(`${baseUrl}/api/open/locations?search=${query}`);
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setLocationSuggestions(data.data.map((l: any) => l.name));
      }
    } catch (err) {
      console.error("Location fetch error", err);
    }
  };

  const fetchCertifications = async (query: string) => {
    if (query.length < 1) {
      setCertSuggestions([]);
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
      const res = await fetch(`${baseUrl}/api/open/certifications?search=${query}`);
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setCertSuggestions(data.data.map((c: any) => c.name));
      } else {
        // Fallback or static list if API not ready
        const commonCert = ["CTET", "STET", "NET", "SET", "B.Ed", "M.Ed", "Montessori Training", "TEFL", "TESOL"];
        setCertSuggestions(commonCert.filter(c => c.toLowerCase().includes(query.toLowerCase())));
      }
    } catch (err) {
      setCertSuggestions([]);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>, type: "location" | "preferred_location" | "exp_location") => {
    const val = e.target.value;
    setSearchType(type);
    if (type === "exp_location") {
      setExpFormData(prev => ({ ...prev, location: val }));
    } else {
      setProfileData(prev => ({ ...prev, [type]: val }));
    }
    fetchLocations(val);
    setShowLocationSug(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ["svg", "jpg", "jpeg", "png", "webp"];
      const fileExt = file.name.split(".").pop()?.toLowerCase();

      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        toast.error("Unsupported file format", {
          description: `Please upload only ${allowedExtensions.join(", ").toUpperCase()} files.`,
          style: { borderLeft: '4px solid #ef4444' }
        });
        e.target.value = "";
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        toast.error("File is too large", {
          description: "Please upload an image smaller than 4MB.",
          style: { borderLeft: '4px solid #ef4444' }
        });
        e.target.value = "";
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getFullImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
    return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const handleAddCustomSkill = () => {
    const val = skillInput.trim();
    if (!val) return;
    if (!profileData.skills.includes(val)) {
      setProfileData(prev => ({ ...prev, skills: [...prev.skills, val] }));
    }
    setSkillInput("");
  };

  const handleAddCertification = () => {
    const name = certInput.trim();
    if (!name) return;
    
    setProfileData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { 
        name, 
        issuer: certIssuer, 
        issued_at: certIssuedAt, 
        expires_at: certExpiresAt 
      }]
    }));

    // Reset fields
    setCertInput("");
    setCertIssuer("");
    setCertIssuedAt("");
    setCertExpiresAt("");
  };

  const handleEduSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrs: Record<string, string> = {};
    if (!eduFormData.institution.trim()) newErrs.institution = "Institution name is required";
    if (!eduFormData.degree.trim()) newErrs.degree = "Degree is required";
    if (!eduFormData.start_date) newErrs.start_date = "Start date is required";
    if (!eduFormData.is_current && eduFormData.end_date && isAfter(parseISO(eduFormData.start_date), parseISO(eduFormData.end_date))) {
      newErrs.dates = "End date cannot be before start date";
    }

    setEduErrors(newErrs);
    const firstErr = Object.values(newErrs)[0];
    if (firstErr) {
      toast.error(firstErr, { style: { borderLeft: '4px solid #ef4444' } });
      return;
    }

    const newRecord = {
      ...eduFormData,
      grade: `${eduFormData.grade_type}: ${eduFormData.grade}`,
      id: editingEduId || `new_${Date.now()}`,
      is_new: !editingEduId,
      is_dirty: true
    } as any;

    if (editingEduId) {
      setLocalEduList(prev => prev.map(edu => edu.id === editingEduId ? { ...newRecord, is_dirty: true } : edu));
    } else {
      setLocalEduList(prev => [...prev, { ...newRecord, is_new: true }]);
    }
    setEduFormData({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", grade: "", description: "", is_current: false, grade_type: "Percentage" });
    setEduErrors({});
    setShowEduForm(false);
    setEditingEduId(null);
  };

  const handleEduEdit = (edu: EducationRecord) => {
    const { start_date, end_date } = recordToFormDates(edu);
    const rawGrade = edu.grade ?? "";
    const isCGPA = rawGrade.toLowerCase().includes("cgpa");
    setEduFormData({
      institution: edu.institution ?? "",
      degree: edu.degree ?? "",
      field_of_study: edu.field_of_study ?? "",
      start_date,
      end_date,
      grade: rawGrade.replace(/Percentage:|CGPA:/i, "").trim(),
      grade_type: isCGPA ? "CGPA" : "Percentage",
      description: edu.description ?? "",
      is_current: !!edu.is_current,
    });
    setEditingEduId(edu.id);
    setShowEduForm(true);
  };

  const handleEduDelete = (id: number | string) => {
    toast.error("Remove this education record?", {
      action: {
        label: "Remove",
        onClick: () => {
          setLocalEduList(prev => prev.map(edu => edu.id === id ? { ...edu, is_deleted: true } : edu));
          toast.success("Record marked for removal", { style: { borderLeft: '4px solid #10b981' } });
        },
      },
      style: { borderLeft: '4px solid #ef4444' },
      duration: 5000
    });
  };

  const handleExpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrs: Record<string, string> = {};
    if (!expFormData.job_title.trim()) newErrs.job_title = "Job title is required";
    const companyName = expFormData.company_name.trim();
    if (!companyName) {
      newErrs.company_name = "Organization name is required";
    } else if (companyName.length < 3) {
      newErrs.company_name = "Organization name must be at least 3 characters";
    } else if (companyName.length > 100) {
      newErrs.company_name = "Organization name cannot exceed 100 characters";
    }
    if (!expFormData.start_date) newErrs.start_date = "Start date is required";
    if (!expFormData.is_current && expFormData.end_date && isAfter(parseISO(expFormData.start_date), parseISO(expFormData.end_date))) {
      newErrs.dates = "End date cannot be before start date";
    }

    setExpErrors(newErrs);
    const firstErr = Object.values(newErrs)[0];
    if (firstErr) {
      toast.error(firstErr, { style: { borderLeft: '4px solid #ef4444' } });
      return;
    }

    const newRecord = {
      ...expFormData,
      id: editingExpId || `new_${Date.now()}`,
      is_new: !editingExpId,
      is_dirty: true
    } as any;

    if (editingExpId) {
      setLocalExpList(prev => prev.map(exp => exp.id === editingExpId ? { ...newRecord, is_dirty: true } : exp));
    } else {
      setLocalExpList(prev => [...prev, { ...newRecord, is_new: true }]);
    }
    setExpFormData({ job_title: "", company_name: "", location: "", start_date: "", end_date: "", is_current: false, description: "" });
    setExpErrors({});
    setShowExpForm(false);
    setEditingExpId(null);
  };

  const handleExpEdit = (exp: ExperienceRecord) => {
    setExpFormData({
      job_title: exp.job_title ?? "",
      company_name: exp.company_name ?? "",
      location: exp.location ?? "",
      start_date: exp.start_date?.split("T")[0] ?? "",
      end_date: exp.end_date?.split("T")[0] ?? "",
      is_current: !!exp.is_current,
      description: exp.description ?? "",
    });
    setEditingExpId(exp.id);
    setShowExpForm(true);
  };

  const handleExpDelete = (id: number | string) => {
    toast.error("Remove this experience record?", {
      action: {
        label: "Remove",
        onClick: () => {
          setLocalExpList(prev => prev.map(exp => exp.id === id ? { ...exp, is_deleted: true } : exp));
          toast.success("Record marked for removal", { style: { borderLeft: '4px solid #10b981' } });
        },
      },
      style: { borderLeft: '4px solid #ef4444' },
      duration: 5000
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    const name = profileData.name.trim();
    if (!name) {
      newErrors.name = "Full name is required";
    } else if (name.length < 3) {
      newErrors.name = "Full name must be at least 3 characters";
    } else if (name.length > 100) {
      newErrors.name = "Full name cannot exceed 100 characters";
    }
    if (!profileData.title.trim()) newErrors.title = "Professional title is required";
    if (!profileData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!profileData.location.trim()) newErrors.location = "Location is required";
    if (!profileData.bio.trim()) newErrors.bio = "Bio is required";
    else if (profileData.bio.trim().length < 50) newErrors.bio = "Bio should be at least 50 characters";
    if (profileData.experience_years < 0) newErrors.experience_years = "Experience years cannot be negative";

    setErrors(newErrors);
    const firstError = Object.values(newErrors)[0];
    if (firstError) {
      toast.error(firstError, { style: { borderLeft: '4px solid #ef4444' } });
      return;
    }

    try {
      setSaving(true);
      console.log("[ProfileDebug] Starting submission...");
      console.log("[ProfileDebug] Current Profile Data:", profileData);
      console.log("[ProfileDebug] Target Location:", profileData.location);
      console.log("[ProfileDebug] Skills to map:", profileData.skills);

      const skillNames = (profileData.skills || []).map((skillIdOrName: any) => {
        const skill = availableSkills.find(s => String(s.id) === String(skillIdOrName));
        return skill ? skill.name : skillIdOrName;
      });
      console.log("[ProfileDebug] Mapped Skill Names:", skillNames);

      let profileResult: any;
      if (photoFile) {
        console.log("[ProfileDebug] Uploading with photo...");
        const { uploadFile } = await import("@/actions/FileUpload");
        const formData = new FormData();
        if (!isNew) formData.append("_method", "PUT");

        Object.entries(profileData).forEach(([key, value]) => {
          if (key === 'skills') {
            const list = (value as any[] || []);
            console.log(`[ProfileDebug] Appending skills:`, list);
            const names = list.map(v => typeof v === 'string' ? v : (v.name || ""));
            names.forEach(name => formData.append(`skills[]`, name));
            // Add as JSON string as a fallback for some backend configurations
            formData.append('skills_json', JSON.stringify(names));
          } else if (key === 'certifications') {
            const list = (value as any[] || []);
            console.log(`[ProfileDebug] Appending certifications:`, list);
            list.forEach((c: any, index: number) => {
              const name = typeof c === 'string' ? c : (c.name || "");
              formData.append(`certifications[${index}][name]`, name);
              formData.append(`certifications[${index}][issuer]`, c.issuer || "");
              formData.append(`certifications[${index}][issued_at]`, c.issued_at || "");
              formData.append(`certifications[${index}][expires_at]`, c.expires_at || "");
            });
          } else if (key !== 'profile_photo' && key !== 'email') {
            console.log(`[ProfileDebug] Appending ${key}:`, value);
            formData.append(key, value !== null && value !== undefined ? String(value) : "");
            if (key === 'title') formData.append('job_title', String(value));
          }
        });

        // Add Education to FormData
        localEduList.filter(edu => !(edu as any).is_deleted).forEach((edu, index) => {
          const payload = toEducationPayload(edu);
          formData.append(`education[${index}][institution]`, payload.institution || "");
          formData.append(`education[${index}][degree]`, payload.degree || "");
          formData.append(`education[${index}][field_of_study]`, payload.field_of_study || "");
          formData.append(`education[${index}][start_year]`, payload.start_year || "");
          formData.append(`education[${index}][end_year]`, payload.end_year || "");
          formData.append(`education[${index}][grade]`, payload.grade || "");
          formData.append(`education[${index}][is_current]`, String(payload.is_current || 0));
        });

        // Add Experience to FormData
        localExpList.filter(exp => !(exp as any).is_deleted).forEach((exp, index) => {
          const payload = toExperiencePayload(exp);
          formData.append(`experience[${index}][job_title]`, payload.job_title || "");
          formData.append(`experience[${index}][company_name]`, payload.company_name || "");
          formData.append(`experience[${index}][location]`, payload.location || "");
          formData.append(`experience[${index}][start_date]`, payload.start_date || "");
          formData.append(`experience[${index}][end_date]`, payload.end_date || "");
          formData.append(`experience[${index}][is_current]`, String(payload.is_current || 0));
          formData.append(`experience[${index}][description]`, payload.description || "");
        });

        formData.append("profile_photo", photoFile);
        profileResult = await uploadFile("jobseeker/profile", { method: "POST", data: formData });
      } else {
        const { email, profile_photo, ...safeData } = profileData;
        const payload = {
          ...safeData,
          job_title: safeData.title,
          skills: profileData.skills.map((s: any) => typeof s === 'string' ? s : (s.name || "")),
          certifications: profileData.certifications.map((c: any) => {
            const name = typeof c === 'string' ? c : (c.name || "");
            return {
              name: name,
              issuer: c.issuer || "",
              issued_at: c.issued_at || "",
              expires_at: c.expires_at || ""
            };
          }).filter((c: any) => c.name.length > 0),
          education: localEduList.filter(e => !(e as any).is_deleted).map(toEducationPayload),
          experience: localExpList.filter(e => !(e as any).is_deleted).map(toExperiencePayload),
        };
        console.log("[ProfileDebug] Submitting JSON payload:", JSON.stringify(payload, null, 2));
        profileResult = isNew ? await createProfile(payload) : await updateProfile(payload);
      }

      console.log("[ProfileDebug] Response:", profileResult);

      if (profileResult.status === true) {
        toast.success(isNew ? "Profile created successfully!" : "Profile updated successfully!", {
          style: { borderLeft: '4px solid #10b981' }
        });
        setMode("view");
        if (isNew) {
          window.location.reload();
        } else {
          // Refresh data
          setProfileData(mapServerProfile(profileResult));
        }
      } else {
        console.error("[ProfileDebug] Error detail:", profileResult);
        toast.error(profileResult.message || "Failed to save profile. Please try again.");
        return; // Stop here if main profile failed
      }

      console.log("[ProfileDebug] Syncing Education Records:", localEduList);
      await Promise.all(localEduList.map(async (edu) => {
        if ((edu as any).is_deleted) {
          console.log(`[ProfileDebug] Deleting Education: ${edu.id}`);
          return deleteEducation(edu.id);
        }
        if ((edu as any).is_new) {
          const payload = toEducationPayload(edu as any);
          console.log("[ProfileDebug] Creating Education:", payload);
          return createEducation(payload);
        }
        if ((edu as any).is_dirty) {
          const payload = toEducationPayload(edu as any);
          console.log(`[ProfileDebug] Updating Education ${edu.id}:`, payload);
          return updateEducation(edu.id, payload);
        }
      }));

      console.log("[ProfileDebug] Syncing Experience Records:", localExpList);
      await Promise.all(localExpList.map(async (exp) => {
        if ((exp as any).is_deleted) {
          console.log(`[ProfileDebug] Deleting Experience: ${exp.id}`);
          return deleteExperience(exp.id);
        }
        if ((exp as any).is_new) {
          const payload = toExperiencePayload(exp as any);
          console.log("[ProfileDebug] Creating Experience:", payload);
          return createExperience(payload);
        }
        if ((exp as any).is_dirty) {
          const payload = toExperiencePayload(exp as any);
          console.log(`[ProfileDebug] Updating Experience ${exp.id} (Location: ${payload.location}):`, payload);
          return updateExperience(exp.id, payload);
        }
      }));

      toast.success("Profile updated successfully!", { style: { borderLeft: '4px solid #10b981' } });
      setMode("view");
      router.refresh();
    } catch (err: any) {
      console.error("[ProfileDebug] CRITICAL ERROR:", err);

      // Extract detailed validation errors from Laravel response if available
      let errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";

      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(" ");
        if (validationErrors) errorMessage = `${errorMessage} ${validationErrors}`;
      }

      toast.error(errorMessage, { style: { borderLeft: '4px solid #ef4444' } });
    } finally {
      setSaving(false);
    }
  };

  const ProfileHeader = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="h-20 bg-indigo-500 bg-linear-to-r from-indigo-500 to-blue-400" />
      <div className="px-5 pb-5 relative">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4 -mt-10 mb-4">
          <div
            className={`w-20 h-20 rounded-2xl bg-white p-1 shadow-md border border-slate-50 overflow-hidden shrink-0 relative ${isEdit ? 'cursor-pointer group' : ''}`}
            onClick={() => isEdit && document.getElementById("photo-upload")?.click()}
          >
            {photoPreview || profileData.profile_photo ? (
              <img 
                src={photoPreview || getFullImageUrl(profileData.profile_photo)!} 
                alt="" 
                className="w-full h-full object-cover rounded-xl" 
                onError={() => toast.error("Profile photo failed to load", { duration: 3000 })}
              />
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-xl font-bold text-indigo-900">
                {profileData.name?.[0]}
              </div>
            )}
            {isEdit && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 pt-1 w-full">
            <h2 className="text-xl font-bold text-black tracking-tight">{profileData.name || "Name not set"}</h2>
            <p className="text-black/70 text-[13px] font-semibold">{profileData.title || "No title set"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-50 mt-1">
          <div className="flex items-center gap-2.5 text-black/70 px-2 sm:px-0">
            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold truncate">{profileData.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-black/70 px-2 sm:px-0">
            <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold truncate">{profileData.phone || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-black/70 px-2 sm:px-0">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold truncate">{profileData.location || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-black/70 px-2 sm:px-0">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold">{profileData.experience_years || 0} Years Experience</span>
          </div>
        </div>
      </div>
      {isEdit && <input id="photo-upload" type="file" accept=".svg,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePhotoChange} />}
    </div>
  );

  const renderProfileView = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-3 mb-1 px-4 sm:px-0">
        <div>
          <h1 className="text-lg font-bold text-black tracking-tight">My Profile</h1>
          <p className="text-black/40 text-[11px] font-medium">Your professional identity on TeachNow</p>
        </div>
        <Button onClick={() => setMode("edit")} className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-4 h-8 text-[12px] font-semibold shadow-xs">
          <Edit2 className="w-3 h-3 mr-1.5" /> Edit Profile
        </Button>
      </div>

      <ProfileHeader />

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-[12px] font-semibold text-slate-900 border-b border-slate-50 pb-2 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-indigo-500" /> Job Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* <div>
            <p className="text-[10px] font-semibold text-black/60 mb-0.5">Status</p>
            <p className="text-[13px] font-semibold text-slate-700">{profileData.open_to_work}</p>
          </div> */}
          <div>
            <p className="text-[10px] font-semibold text-black/60 mb-0.5">Notice Period</p>
            <p className="text-[13px] font-semibold text-slate-700">{profileData.notice_period || "Not specified"}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-black/60 mb-0.5">Total Experience</p>
            <p className="text-[13px] font-semibold text-black">{profileData.experience_years || 0} Years</p>
          </div>
          {/* <div>
            <p className="text-[10px] font-semibold text-black/60 mb-0.5">Teaching Mode</p>
            <p className="text-[13px] font-semibold text-slate-700">{profileData.teaching_mode || "Not specified"}</p>
          </div> */}
          <div>
            <p className="text-[10px] font-semibold text-black/60 mb-0.5">Availability</p>
            <p className="text-[13px] font-semibold text-slate-700">{profileData.availability || "Not specified"}</p>
          </div>
        </div>
      </div>

      {profileData.bio && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
          <h3 className="text-[12px] font-semibold text-black mb-2.5 flex items-center gap-2">
            <UserCircle className="w-3.5 h-3.5 text-indigo-500" /> About Me
          </h3>
          <p className="text-black/70 leading-relaxed whitespace-pre-wrap text-[14px] font-medium">{profileData.bio}</p>
          {profileData.portfolio_website && (
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-black/40" />
              <a href={profileData.portfolio_website} target="_blank" className="text-[13px] text-indigo-600 font-semibold hover:underline">{profileData.portfolio_website}</a>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[13px] font-bold text-black flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-black/30" /> Experience
            </h3>
            <button
              onClick={() => { setMode("edit"); setShowExpForm(true); }}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-8">
            {localExpList.filter(e => !(e as any).is_deleted).length > 0 ? (
              localExpList.filter(e => !(e as any).is_deleted).map((exp) => (
                <div key={exp.id} className="border-l-2 border-slate-50 pl-5">
                  <h4 className="text-[14px] font-bold text-black leading-tight">{exp.job_title}</h4>
                  <p className="text-indigo-600 font-medium text-[13px] mt-1">{exp.company_name}{exp.location ? `, ${exp.location}` : ''}</p>
                  <p className="text-black/40 text-[11px] font-semibold mt-1">
                    {exp.start_date?.split("-")[0]} — {exp.is_current ? "Present" : exp.end_date?.split("-")[0] || "—"}
                  </p>
                  {exp.description && <p className="text-black/50 text-[12px] mt-2 leading-relaxed">{exp.description}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic text-[12px]">No experience added.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[13px] font-bold text-black flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-black/30" /> Education
            </h3>
            <button
              onClick={() => { setMode("edit"); setShowEduForm(true); }}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-8">
            {localEduList.filter(e => !(e as any).is_deleted).length > 0 ? (
              localEduList.filter(e => !(e as any).is_deleted).map((edu) => (
                <div key={edu.id} className="border-l-2 border-slate-50 pl-5">
                  <h4 className="text-[14px] font-bold text-black leading-tight">{edu.degree}</h4>
                  <p className="text-black/80 font-medium text-[13px] mt-1 space-x-1">
                    <span>{edu.institution}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-black/40 font-semibold">{edu.start_date?.split("-")[0]} — {edu.is_current ? "Present" : edu.end_date?.split("-")[0]}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {edu.field_of_study && <p className="text-[10px] text-indigo-600 font-bold tracking-widest">{edu.field_of_study}</p>}
                    {edu.grade && <span className="text-[11px] font-bold text-emerald-600">{edu.grade}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-black/40 italic text-[12px]">Academic details missing.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-7 rounded-xl border border-slate-100 shadow-xs space-y-8 mt-6">
        <div>
          <h3 className="text-[13px] font-bold text-black mb-5 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-black/30" /> Skills
          </h3>
          <div className="flex flex-wrap gap-x-6 sm:gap-x-10 gap-y-3">
            {(profileData.skills || []).map((item: any, i: number) => (
              <span key={i} className="text-indigo-600 font-semibold text-[13px]">
                {typeof item === 'string' ? item : item.name}
              </span>
            ))}
          </div>
        </div>

        {profileData.certifications?.length > 0 && (
          <div>
            <h3 className="text-[13px] font-bold text-black mb-5 flex items-center gap-2">
              <Award className="w-4 h-4 text-black/30" /> Certifications
            </h3>
            <div className="space-y-4">
              {profileData.certifications.map((cert: any, i: number) => (
                <div key={i} className="flex flex-col">
                  <p className="text-black font-semibold text-[13px]">{typeof cert === 'string' ? cert : cert.name}</p>
                  {(cert.issuer || cert.issued_at || cert.expires_at) && (
                    <p className="text-black/60 text-[11px] font-medium mt-0.5">
                      {cert.issuer || ''} 
                      {cert.issued_at && cert.issued_at.includes("-") ? ` · Issued: ${cert.issued_at.split("-")[0]}` : (cert.issued_at ? ` · Issued: ${cert.issued_at}` : '')} 
                      {cert.expires_at && cert.expires_at.includes("-") ? ` · Expires: ${cert.expires_at.split("-")[0]}` : (cert.expires_at ? ` · Expires: ${cert.expires_at}` : '')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileEdit = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 pb-10 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black tracking-tight">Update Profile</h1>
          <p className="text-black/40 text-[12px] font-medium mt-0.5">Edit your recruitment-ready profile</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setMode("view")} className="flex-1 sm:flex-none h-8 px-5 rounded-lg font-semibold text-[12px] border-slate-200 text-slate-600">Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="flex-1 sm:flex-none h-8 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[12px]">
            {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null} Save Final
          </Button>
        </div>
      </div>

      <ProfileHeader isEdit />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-8">
          <section className="space-y-6">
            <h3 className="text-[13px] font-semibold text-black border-b border-slate-50 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className={cn("text-[13px] font-semibold transition-colors", errors.name ? "text-red-500" : "text-slate-700")}>Full Name <span className="text-red-500">*</span></Label>
                <Input name="name" value={profileData.name} onChange={handleChange} className={cn("h-10 rounded-lg text-[13px] transition-all", errors.name ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" : "border-slate-200")} />
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[13px] font-semibold transition-colors", errors.phone ? "text-red-500" : "text-slate-700")}>Phone Number <span className="text-red-500">*</span></Label>
                <Input name="phone" value={profileData.phone} onChange={handleChange} className={cn("h-10 rounded-lg text-[13px] transition-all", errors.phone ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" : "border-slate-200")} />
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[13px] font-semibold transition-colors", errors.title ? "text-red-500" : "text-slate-700")}>Professional Title <span className="text-red-500">*</span></Label>
                <Input name="title" value={profileData.title} onChange={handleChange} className={cn("h-10 rounded-lg text-[13px] transition-all", errors.title ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" : "border-slate-200")} />
              </div>
              <div className="space-y-1.5 relative">
                <Label className={cn("text-[13px] font-semibold transition-colors", errors.location ? "text-red-500" : "text-slate-700")}>Location <span className="text-red-500">*</span></Label>
                <Input
                  name="location"
                  value={profileData.location}
                  onChange={(e) => handleLocationChange(e, "location")}
                  onBlur={() => setTimeout(() => setShowLocationSug(false), 200)}
                  className={cn("h-10 rounded-lg text-[13px] transition-all", errors.location ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" : "border-slate-200")}
                />
                {showLocationSug && searchType === "location" && locationSuggestions.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {locationSuggestions.map((loc, i) => (
                      <li
                        key={i}
                        className="px-4 py-2 text-[13px] hover:bg-slate-50 cursor-pointer"
                        onClick={() => { setProfileData(prev => ({ ...prev, location: loc })); setShowLocationSug(false); }}
                      >
                        {loc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Gender</Label>
                <select name="gender" value={profileData.gender} onChange={handleChange} className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] outline-none">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">LinkedIn or Social Platform</Label>
                <Input name="portfolio_website" value={profileData.portfolio_website} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="h-10 rounded-lg text-[13px] border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Total Experience (Years) <span className="text-red-500">*</span></Label>
                <Input name="experience_years" type="number" min="0" value={profileData.experience_years} onChange={handleChange} className="h-10 rounded-lg text-[13px] border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Date of Birth</Label>
                <DatePicker
                  date={profileData.dob ? parseISO(profileData.dob) : undefined}
                  setDate={(d) => setProfileData({ ...profileData, dob: d ? format(d, 'yyyy-MM-dd') : "" })}
                  className="h-10 rounded-lg text-[13px] bg-white border border-slate-200"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className={cn("text-[13px] font-semibold transition-colors", errors.bio ? "text-red-500" : "text-slate-700")}>Professional Bio <span className="text-red-500">*</span></Label>
                <textarea name="bio" value={profileData.bio} onChange={handleChange} rows={3} className={cn("w-full rounded-lg border bg-white p-3 text-[13px] outline-none transition-all", errors.bio ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" : "border-slate-200")} placeholder="Share your teaching philosophy and experience..." />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[13px] font-semibold text-slate-900 border-b border-slate-50 pb-2">Job Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Notice Period</Label>
                <select name="notice_period" value={profileData.notice_period} onChange={handleChange} className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] outline-none">
                  <option value="">Select Notice Period</option>
                  <option value="Immediate">Immediate</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="45">45 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Availability</Label>
                <select name="availability" value={profileData.availability} onChange={handleChange} className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] outline-none">
                  <option value="open">Open</option>
                  <option value="not_looking">Not Looking</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-2">
              <h3 className="text-[13px] font-semibold text-slate-900">Work History</h3>
              <button type="button" onClick={() => { setShowExpForm(!showExpForm); setEditingExpId(null); }} className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700">
                {showExpForm ? "Cancel" : "Add Experience"}
              </button>
            </div>

            {showExpForm && (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className={cn("text-[12px] font-medium transition-colors", expErrors.job_title ? "text-red-500" : "text-slate-600")}>Job Title <span className="text-red-500">*</span></Label>
                    <Input value={expFormData.job_title} onChange={(e) => setExpFormData({ ...expFormData, job_title: e.target.value })} className={cn("h-10 rounded-lg text-sm bg-white transition-all", expErrors.job_title ? "border-red-500 bg-red-50/50" : "border-slate-200")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={cn("text-[12px] font-medium transition-colors", expErrors.company_name ? "text-red-500" : "text-slate-600")}>Institution Name <span className="text-red-500">*</span></Label>
                    <Input value={expFormData.company_name} onChange={(e) => setExpFormData({ ...expFormData, company_name: e.target.value })} className={cn("h-10 rounded-lg text-sm bg-white transition-all", expErrors.company_name ? "border-red-500 bg-red-50/50" : "border-slate-200")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-medium text-slate-600">Location</Label>
                    <Input
                      value={expFormData.location}
                      onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
                      className="h-10 rounded-lg text-sm bg-white"
                      placeholder="e.g. Mumbai, India"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={cn("text-[12px] font-medium transition-colors", expErrors.start_date ? "text-red-500" : "text-slate-600")}>Timeline <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2">
                      <div className="flex-1 space-y-1">
                        <p className={cn("text-[10px] font-semibold transition-colors", expErrors.start_date ? "text-red-500" : "text-black/60")}>Start Date</p>
                        <DatePicker date={expFormData.start_date ? parseISO(expFormData.start_date) : undefined} setDate={(d) => setExpFormData({ ...expFormData, start_date: d ? format(d, 'yyyy-MM-dd') : "" })} className={cn("h-10 text-[13px] bg-white transition-all", expErrors.start_date ? "border-red-500 bg-red-50/50" : "border-slate-200")} />
                      </div>
                      <span className="hidden sm:flex h-10 items-center text-[10px] text-black/40 font-semibold shrink-0">to</span>
                      <div className="flex-1 space-y-1">
                        <p className={cn("text-[11px] font-semibold transition-colors", expErrors.dates ? "text-red-500" : "text-black/60")}>End Date</p>
                        <DatePicker disabled={expFormData.is_current} date={expFormData.end_date ? parseISO(expFormData.end_date) : undefined} setDate={(d) => setExpFormData({ ...expFormData, end_date: d ? format(d, 'yyyy-MM-dd') : "" })} className={cn("h-10 text-[13px] bg-white transition-all", expErrors.dates ? "border-red-500 bg-red-50/50" : "border-slate-200")} />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <button type="button" onClick={() => setExpFormData(p => ({ ...p, is_current: !p.is_current }))} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${expFormData.is_current ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200"}`}>
                      {expFormData.is_current ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />} Currently Working
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" onClick={handleExpSubmit} className="h-8 px-5 rounded-lg bg-slate-800 text-white font-semibold text-[11px]">{editingExpId ? "Update Record" : "Add Record"}</Button>
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-50">
              {localExpList.filter(e => !(e as any).is_deleted).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50">
                  <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500"><Briefcase className="w-4 h-4" /></div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-[13px]">{exp.job_title}</h4>
                      <p className="text-[11px] font-medium text-slate-400">{exp.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button type="button" onClick={() => handleExpEdit(exp)} className="p-2 text-indigo-600 hover:bg-white rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleExpDelete(exp.id)} className="p-2 text-red-500 hover:bg-white rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {localExpList.filter(e => !(e as any).is_deleted).length === 0 && (
                <p className="text-[12px] text-slate-400 italic p-4 text-center">No work history added yet.</p>
              )}
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-2">
              <h3 className="text-[13px] font-semibold text-slate-900 flex-1">Education</h3>
              <button type="button" onClick={() => { setShowEduForm(!showEduForm); setEditingEduId(null); }} className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700">
                {showEduForm ? "Cancel" : "Add Education"}
              </button>
            </div>

            {showEduForm && (
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100/50 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className={cn("text-[13px] font-semibold transition-colors", eduErrors.degree ? "text-red-500" : "text-slate-700")}>Degree <span className="text-red-500">*</span></Label>
                    <Input value={eduFormData.degree} onChange={(e) => setEduFormData({ ...eduFormData, degree: e.target.value })} className={cn("h-10 rounded-lg text-sm bg-white transition-all", eduErrors.degree ? "border-red-500 bg-red-50/50" : "border-slate-200")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={cn("text-[13px] font-semibold transition-colors", eduErrors.institution ? "text-red-500" : "text-slate-700")}>Institution <span className="text-red-500">*</span></Label>
                    <Input value={eduFormData.institution} onChange={(e) => setEduFormData({ ...eduFormData, institution: e.target.value })} className={cn("h-10 rounded-lg text-sm bg-white transition-all", eduErrors.institution ? "border-red-500 bg-red-50/50" : "border-slate-200")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-slate-700">Field of Study</Label>
                    <Input value={eduFormData.field_of_study} onChange={(e) => setEduFormData({ ...eduFormData, field_of_study: e.target.value })} className="h-10 rounded-lg text-sm bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-slate-700">Grade (CGPA / %)</Label>
                    <div className="flex gap-2">
                      <select
                        value={eduFormData.grade_type}
                        onChange={(e) => setEduFormData({ ...eduFormData, grade_type: e.target.value as any })}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-[12px] outline-none shrink-0"
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="CGPA">CGPA</option>
                      </select>
                      <Input value={eduFormData.grade} onChange={(e) => setEduFormData({ ...eduFormData, grade: e.target.value })} placeholder={eduFormData.grade_type === "Percentage" ? "e.g. 85%" : "e.g. 9.2"} className="h-10 rounded-lg text-sm bg-white" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className={cn("text-[13px] font-semibold transition-colors", eduErrors.start_date ? "text-red-500" : "text-slate-700")}>Joined Timeline <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2">
                      <div className="flex-1 space-y-1">
                        <p className={cn("text-[12px] font-semibold transition-colors", eduErrors.start_date ? "text-red-500" : "text-slate-500")}>Start Date</p>
                        <DatePicker date={eduFormData.start_date ? parseISO(eduFormData.start_date) : undefined} setDate={(d) => setEduFormData({ ...eduFormData, start_date: d ? format(d, 'yyyy-MM-dd') : "" })} className={cn("h-10 text-[13px] bg-white transition-all", eduErrors.start_date ? "border-red-500 bg-red-50/50" : "border-slate-200")} />
                      </div>
                      <span className="hidden sm:flex h-10 items-center text-[10px] text-black/40 font-semibold shrink-0">to</span>
                      <div className="flex-1 space-y-1">
                        <p className={cn("text-[11px] font-semibold transition-colors", eduErrors.dates ? "text-red-500" : "text-black/60")}>End Date</p>
                        <DatePicker disabled={eduFormData.is_current} date={eduFormData.end_date ? parseISO(eduFormData.end_date) : undefined} setDate={(d) => setEduFormData({ ...eduFormData, end_date: d ? format(d, 'yyyy-MM-dd') : "" })} className={cn("h-10 text-[13px] bg-white transition-all", eduErrors.dates ? "border-red-500 bg-red-50/50" : "border-slate-200")} />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <button type="button" onClick={() => setEduFormData(p => ({ ...p, is_current: !p.is_current }))} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${eduFormData.is_current ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-slate-500 border-slate-200"}`}>
                      {eduFormData.is_current ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />} Currently Pursuing
                    </button>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button type="button" onClick={handleEduSubmit} className="h-8 px-6 rounded-lg bg-emerald-600 text-white font-semibold text-[11px]">Save Education</Button>
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-50 mb-6">
              {localEduList.filter(e => !(e as any).is_deleted).map((edu) => (
                <div key={edu.id} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50">
                  <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500"><GraduationCap className="w-4 h-4" /></div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-[13px]">{edu.degree}</h4>
                      <p className="text-[11px] font-medium text-slate-400">{edu.institution}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button type="button" onClick={() => handleEduEdit(edu)} className="p-2 text-indigo-600 hover:bg-white rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => handleEduDelete(edu.id)} className="p-2 text-red-500 hover:bg-white rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {localEduList.filter(e => !(e as any).is_deleted).length === 0 && (
                <p className="text-[12px] text-slate-400 italic p-4 text-center">Academic background empty.</p>
              )}
            </div>
            <div className="space-y-8 pt-1">
              <div className="space-y-4 relative">
                <h3 className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Skills
                </h3>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a skill or subject..." value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onFocus={() => setSkillInput(skillInput)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomSkill())}
                    className="h-10 rounded-xl bg-white border border-slate-200 px-5 text-[13px]"
                  />
                  <Button type="button" onClick={handleAddCustomSkill} className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-[12px]">Add</Button>
                </div>
                {skillInput.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl mt-1.5 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
                    {availableSkills
                      .filter(s => {
                        const name = s.name.toLowerCase();
                        const query = skillInput.toLowerCase();
                        const isAlreadySelected = profileData.skills.some((ps: any) => (typeof ps === 'string' ? ps : ps.name).toLowerCase() === name);
                        return name.includes(query) && !isAlreadySelected;
                      })
                      .sort((a, b) => {
                        const query = skillInput.toLowerCase();
                        const aStarts = a.name.toLowerCase().startsWith(query);
                        const bStarts = b.name.toLowerCase().startsWith(query);
                        if (aStarts && !bStarts) return -1;
                        if (!aStarts && bStarts) return 1;
                        return a.name.localeCompare(b.name);
                      })
                      .slice(0, 8)
                      .map((skill, i) => (
                        <li
                          key={i}
                          className="px-5 py-3 text-[13.5px] font-bold text-[#1E1B4B] hover:bg-indigo-50/80 cursor-pointer flex justify-between items-center transition-colors border-b border-slate-50 last:border-0"
                          onClick={() => {
                            setProfileData(prev => ({ ...prev, skills: [...prev.skills, skill.name] }));
                            setSkillInput("");
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 group-hover:bg-indigo-500 transition-colors" />
                            <span>{skill.name}</span>
                          </div>
                          <PlusCircle className="w-4 h-4 text-indigo-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </li>
                      ))}
                    {availableSkills.filter(s => s.name.toLowerCase().includes(skillInput.toLowerCase())).length === 0 && (
                      <li
                        className="px-5 py-4 text-[12px] font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer flex items-center gap-2"
                        onClick={handleAddCustomSkill}
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add " {skillInput} " as custom skill?
                      </li>
                    )}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((s: any, idx: number) => (
                    <span key={idx} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-slate-50 text-black/80 font-semibold text-[11px] rounded-lg border border-slate-100">
                      {typeof s === 'string' ? s : s.name}
                      <button type="button" onClick={() => setProfileData(p => ({ ...p, skills: p.skills.filter((_: any, i: number) => i !== idx) }))} className="p-0.5 text-black/20 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Certifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">Certification Name</Label>
                    <div className="relative">
                      <Input
                        placeholder="e.g. PMP, AWS" value={certInput}
                        onChange={(e) => {
                          setCertInput(e.target.value);
                          fetchCertifications(e.target.value);
                          setShowCertSug(true);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCertification())}
                        onBlur={() => setTimeout(() => setShowCertSug(false), 200)}
                        className="h-10 rounded-xl bg-white border border-slate-200 px-5 text-[13px]"
                      />
                      {showCertSug && certSuggestions.length > 0 && (
                        <ul className="absolute z-50 w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl mt-1.5 max-h-48 overflow-y-auto custom-scrollbar active:z-50">
                          {certSuggestions.map((cert, i) => (
                            <li key={i} className="px-5 py-3 text-[12px] font-bold hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0" onClick={() => { setCertInput(cert); setShowCertSug(false); }}>{cert}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">Issuer</Label>
                    <Input
                      placeholder="e.g. Google, PMI"
                      value={certIssuer}
                      onChange={(e) => setCertIssuer(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white border border-slate-200 px-5 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">Issued Date</Label>
                    <Input
                      type="date"
                      value={certIssuedAt}
                      onChange={(e) => setCertIssuedAt(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white border border-slate-200 px-5 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">Expiry Date</Label>
                    <Input
                      type="date"
                      value={certExpiresAt}
                      onChange={(e) => setCertExpiresAt(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white border border-slate-200 px-5 text-[13px]"
                    />
                  </div>
                  <Button type="button" onClick={handleAddCertification} className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-[12px]">Add</Button>
                </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {profileData.certifications.map((c: any, idx: number) => (
                <div key={idx} className="flex flex-col p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl min-w-[220px] relative group pointer-events-auto">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-emerald-900 text-[13px]">{typeof c === 'string' ? c : c.name}</p>
                    <button type="button" onClick={() => setProfileData(p => ({ ...p, certifications: p.certifications.filter((_: any, i: number) => i !== idx) }))} className="p-1 text-emerald-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  {(c.issuer || c.issued_at || c.expires_at) && (
                    <p className="text-[10px] font-semibold text-emerald-600/70 mt-2">
                      {c.issuer || ''} 
                      {c.issued_at && c.issued_at.includes("-") ? ` · Issued: ${c.issued_at.split("-")[0]}` : (c.issued_at ? ` · Issued: ${c.issued_at}` : '')} 
                      {c.expires_at && c.expires_at.includes("-") ? ` · Expires: ${c.expires_at.split("-")[0]}` : (c.expires_at ? ` · Expires: ${c.expires_at}` : '')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <div className="flex justify-end gap-3 px-4 sm:px-0">
    <Button variant="outline" onClick={() => setMode("view")} className="px-6 h-10 rounded-xl font-semibold text-[13px] border-slate-200 text-slate-500">Discard</Button>
    <Button onClick={handleSubmit} disabled={saving} className="px-8 h-10 rounded-xl bg-slate-900 text-white font-semibold text-[13px] hover:bg-black">
      Save Final Profile
    </Button>
  </div>
</div>
);

return mode === "view" ? renderProfileView() : renderProfileEdit();
}

