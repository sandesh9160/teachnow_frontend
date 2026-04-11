"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";
import type { EducationPayload, EducationRecord } from "@/types/education";
import type { ExperiencePayload, ExperienceRecord } from "@/types/experience";
import { Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, Camera, XCircle, ShieldCheck, Trash2, Edit2, Calendar, Globe, Clock, Tag, CheckSquare, Square, X, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { toast } from "sonner";
import { DatePicker } from "@/shared/ui/DatePicker/DatePicker";
import { format, parseISO } from "date-fns";

function toEducationPayload(form: {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade: string;
  description: string;
}): EducationPayload {
  return {
    degree: form.degree,
    institution: form.institution,
    field_of_study: form.field_of_study,
    start_year: form.start_date?.slice(0, 4) ?? "",
    end_year: form.end_date?.slice(0, 4) ?? "",
    grade: form.grade?.trim() ?? "",
    description: form.description,
  };
}

function recordToFormDates(edu: EducationRecord) {
  const start =
    edu.start_date ?? (edu.start_year ? `${String(edu.start_year).slice(0, 4)}-01-01` : "");
  const end = edu.end_date ?? (edu.end_year ? `${String(edu.end_year).slice(0, 4)}-01-01` : "");
  return { start_date: start, end_date: end };
}

function toExperiencePayload(form: any): ExperiencePayload {
  return {
    job_title: form.job_title,
    company_name: form.company_name,
    location: form.location,
    start_date: form.start_date,
    end_date: form.is_current ? undefined : form.end_date,
    is_current: form.is_current ? 1 : 0,
    description: form.description,
  };
}

function mapServerProfile(initial: Record<string, any>) {
  const data = initial.data || initial;
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
    skills: Array.isArray(data.skills) ? data.skills.map((s: any) => s.id || s) : [],
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
  const { getProfile, updateProfile, createProfile } = useProfile();
  const {
    data: education,
    loading: eduLoading,
    error: eduError,
    createEducation,
    updateEducation,
    deleteEducation,
  } = useEducation();

  const {
    data: experiences,
    loading: expLoading,
    error: expError,
    createExperience,
    updateExperience,
    deleteExperience,
  } = useExperience();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(isNewProfile);

  const [showEduForm, setShowEduForm] = useState(false);
  const [editingEduId, setEditingEduId] = useState<number | string | null>(null);

  const [showExpForm, setShowExpForm] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | string | null>(null);

  const [profileData, setProfileData] = useState(() => mapServerProfile(initialResponse));
  const [availableSkills, setAvailableSkills] = useState<any[]>(
    Array.isArray(initialResponse.skills) ? (initialResponse.skills as any[]) : []
  );

  // If initialResponse.skills contains the user's skills (not just suggestions), 
  // ensure they are in profileData.skills
  useEffect(() => {
    const skills = (initialResponse as any).skills;
    if (Array.isArray(skills) && skills.length > 0) {
      setProfileData(prev => ({
        ...prev,
        skills: skills.map((s: any) => s.id || s)
      }));
    }
  }, [initialResponse]);

  const [eduFormData, setEduFormData] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    grade: "",
    description: "",
  });

  const [expFormData, setExpFormData] = useState({
    job_title: "",
    company_name: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [localEduList, setLocalEduList] = useState<EducationRecord[]>([]);
  const [localExpList, setLocalExpList] = useState<ExperienceRecord[]>([]);

  useEffect(() => {
    if (education) setLocalEduList(education);
  }, [education]);

  useEffect(() => {
    if (experiences) setLocalExpList(experiences);
  }, [experiences]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large. Please select an image under 2MB.");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      toast.info("Profile photo updated locally. Click 'Update Profile' to save.");
    }
  };

  const getFullImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
    return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);

  // Debounced skills search
  useEffect(() => {
    if (!skillInput.trim()) {
      setSkillSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingSkills(true);
        const { fetchAPI } = await import("@/services/api/client");
        const res = await fetchAPI<any>(`/open/skills/search?q=${encodeURIComponent(skillInput)}`).catch(() => null);
        
        const term = skillInput.toLowerCase().trim();
        
        if (res?.data && Array.isArray(res.data)) {
          const apiResults = res.data;
          const localMatches = availableSkills.filter(s => 
            s.name.toLowerCase().startsWith(term) &&
            !apiResults.some((apiS: any) => apiS.name.toLowerCase() === s.name.toLowerCase())
          );
          
          const combined = [...apiResults, ...localMatches].sort((a, b) => 
            a.name.localeCompare(b.name)
          );

          setSkillSuggestions(combined.slice(0, 10));
        } else {
          const filtered = availableSkills
            .filter(s => s.name.toLowerCase().startsWith(term))
            .sort((a, b) => a.name.localeCompare(b.name));
          setSkillSuggestions(filtered.slice(0, 10));
        }
        setShowSuggestions(true);
      } catch (err) {
        const filtered = availableSkills.filter(s => 
          s.name.toLowerCase().includes(skillInput.toLowerCase())
        );
        setSkillSuggestions(filtered.slice(0, 10));
        setShowSuggestions(true);
      } finally {
        setIsSearchingSkills(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [skillInput, availableSkills]);
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setLoading(true);
        const res = await getProfile();
        if (cancelled) return;

        if (res?.data) {
          setProfileData(mapServerProfile(res));
          // If the server returns user skills at top level, sync them
          if (Array.isArray(res.skills)) {
            setAvailableSkills(res.skills);
            setProfileData(prev => ({
              ...prev,
              skills: res.skills.map((s: any) => s.id || s)
            }));
          }
        }
      } catch {
        /* fallback to initialProfile */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadData();
    return () => { cancelled = true; };
  }, [getProfile]);

  const toggleSkill = (id: number | string) => {
    setProfileData((prev: any) => {
      const skills = Array.isArray(prev.skills) ? prev.skills : [];
      const targetId = String(id).toLowerCase().trim();

      const isSelected = skills.some((s: any) =>
        String(s.id || s).toLowerCase().trim() === targetId
      );

      const newSkills = isSelected
        ? skills.filter((s: any) => String(s.id || s).toLowerCase().trim() !== targetId)
        : [...skills, id];

      return { ...prev, skills: newSkills };
    });
  };

  const handleAddCustomSkill = (e?: React.FormEvent, customVal?: string) => {
    e?.preventDefault();
    const val = customVal || skillInput.trim();
    if (!val) return;

    // Check if already exists in selected skills
    const exists = profileData.skills.some((s: any) =>
      String(s.name || s).toLowerCase().trim() === val.toLowerCase().trim()
    );

    if (!exists) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, val]
      }));

      // Also add to availableSkills locally so it shows up in the grid
      const inAvailable = availableSkills.some(s => s.name.toLowerCase() === val.toLowerCase());
      if (!inAvailable) {
        setAvailableSkills(prev => [...prev, { id: val, name: val, is_custom: 1 }]);
      }
    }
    setSkillInput("");
    setShowSuggestions(false);
  };

  const handleEduSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      ...eduFormData,
      id: editingEduId || `new_${Date.now()}`,
      is_new: !editingEduId,
      is_dirty: true
    } as any;

    if (editingEduId) {
      setLocalEduList(prev => prev.map(edu => edu.id === editingEduId ? { ...newRecord, is_dirty: true } : edu));
    } else {
      setLocalEduList(prev => [...prev, { ...newRecord, is_new: true }]);
    }
    setEduFormData({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", grade: "", description: "" });
    setShowEduForm(false);
    setEditingEduId(null);
  };

  const handleEduEdit = (edu: EducationRecord) => {
    const { start_date, end_date } = recordToFormDates(edu);
    setEduFormData({
      institution: edu.institution ?? "",
      degree: edu.degree ?? "",
      field_of_study: edu.field_of_study ?? "",
      start_date,
      end_date,
      grade: edu.grade ?? "",
      description: edu.description ?? "",
    });
    setEditingEduId(edu.id);
    setShowEduForm(true);
  };

  const handleEduDelete = (id: number | string) => {
    toast("Remove this education entry?", {
      action: {
        label: "Remove",
        onClick: () => {
          setLocalEduList(prev => prev.map(edu => edu.id === id ? { ...edu, is_deleted: true } : edu));
          toast.success("Education marked for removal. Save profile to confirm.");
        }
      }
    });
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    toast("Remove this experience entry?", {
      action: {
        label: "Remove",
        onClick: () => {
          setLocalExpList(prev => prev.map(exp => exp.id === id ? { ...exp, is_deleted: true } : exp));
          toast.success("Experience marked for removal. Save profile to confirm.");
        }
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setSaving(true);
      
      const skillNames = profileData.skills.map((skillIdOrName: any) => {
        const skill = availableSkills.find(s => String(s.id) === String(skillIdOrName));
        return skill ? skill.name : skillIdOrName;
      });

      // 1. Sync Profile FIRST (required if it's a new user, otherwise edu/exp will fail)
      let profileResult: any;
      if (photoFile) {
        const { uploadFile } = await import("@/actions/FileUpload");
        const formData = new FormData();
        if (!isNew) {
          formData.append("_method", "PUT");
        }
        Object.entries(profileData).forEach(([key, value]) => {
          if (key === 'skills') {
            skillNames.forEach((name: any) => formData.append("skills[]", String(name)));
          } else if (key !== 'profile_photo' && key !== 'skills' && key !== 'email') {
            formData.append(key, value !== null && value !== undefined ? String(value) : "");
            if (key === 'title') formData.append('job_title', String(value));
          }
        });
        formData.append("profile_photo", photoFile);
        formData.append("profile_image", photoFile);
        profileResult = await uploadFile("jobseeker/profile", { method: "POST", data: formData });
      } else {
        // Exclude internal/read-only fields from the update payload
        const { email, profile_photo, ...safeData } = profileData;
        const payload = { 
          ...safeData, 
          job_title: safeData.title, // Alias for backend compatibility
          skills: skillNames 
        };
        profileResult = isNew 
          ? await createProfile(payload)
          : await updateProfile(payload);
      }

      // Check if profile sync failed
      if (profileResult?.status === false) {
        toast.error(profileResult.message || profileResult.error || "Profile update failed");
        return; // Abort saving edu/exp if profile failed
      }

      // If successful, show success toast from backend message if available
      toast.success(profileResult.message || (isNew ? "Profile created successfully!" : "Profile updated successfully!"));
      if (isNew) setIsNew(false);

      const newPhoto = profileResult?.data?.profile?.profile_photo || profileResult?.data?.profile_photo || profileResult?.profile_photo;
      if (newPhoto) {
        setProfileData(prev => ({ ...prev, profile_photo: String(newPhoto) }));
      }
      setPhotoFile(null);
      setPhotoPreview(null);

      // 2. Sync Education
      const eduResults = await Promise.all(localEduList.map(async (edu) => {
        if ((edu as any).is_deleted) {
          return deleteEducation(edu.id);
        } else if ((edu as any).is_new) {
          const { is_new, is_dirty, is_deleted, id, ...payload } = edu as any;
          return createEducation(toEducationPayload(payload as any));
        } else if ((edu as any).is_dirty) {
          const { is_new, is_dirty, is_deleted, id, ...payload } = edu as any;
          return updateEducation(edu.id, toEducationPayload(payload as any));
        }
        return { status: true };
      }));

      // 3. Sync Experience
      const expResults = await Promise.all(localExpList.map(async (exp) => {
        if ((exp as any).is_deleted) {
          return deleteExperience(exp.id);
        } else if ((exp as any).is_new) {
          const { is_new, is_dirty, is_deleted, id, ...payload } = exp as any;
          return createExperience(toExperiencePayload(payload as any));
        } else if ((exp as any).is_dirty) {
          const { is_new, is_dirty, is_deleted, id, ...payload } = exp as any;
          return updateExperience(exp.id, toExperiencePayload(payload as any));
        }
        return { status: true };
      }));

      // Check if any sync failed
      const hasSyncErrors = [...eduResults, ...expResults].some(r => r && (r as any).status === false);
      if (hasSyncErrors) {
        // Collect server error messages
        const errorMsgs = [...eduResults, ...expResults]
          .filter(r => r && (r as any).status === false)
          .map(r => (r as any).message || "Sync failed")
          .join(", ");
        toast.error(`Warning: ${errorMsgs}`);
      } else {
        // Check if any significant changes were made to edu/exp and they all succeeded
        const wasEduChanged = localEduList.some((e: any) => e.is_new || e.is_dirty || e.is_deleted);
        const wasExpChanged = localExpList.some((e: any) => e.is_new || e.is_dirty || e.is_deleted);
        
        if (wasEduChanged || wasExpChanged) {
           toast.success("Additional details synced successfully.");
        }
      }

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex p-12 justify-center items-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-500 font-medium animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight leading-tight">My Profile</h1>
          <p className="text-slate-600 mt-1 text-xs md:text-sm font-medium opacity-90">Manage your professional identity and career preferences.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100/50">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Sync Status: LIVE
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-indigo-50/5 via-indigo-50/2 to-transparent p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="relative group">
            <div
              className="w-20 h-20 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden relative group cursor-pointer"
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              {photoPreview || profileData.profile_photo ? (
                <img
                  src={photoPreview || getFullImageUrl(profileData.profile_photo)!}
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white uppercase">
                  {profileData.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoFile && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-md border border-gray-100 text-red-500 hover:text-red-600 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-center md:text-left space-y-0.5">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">{profileData.name || "Add your name"}</h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-slate-500 font-semibold text-[11px] md:text-xs">
              <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/30">
                <Briefcase className="w-3.5 h-3.5" /> {profileData.title || "Professional Profile"}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profileData.location || "Location not set"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6 bg-white">
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-50">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-gray-500">Full Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    required
                    className="pl-9 h-10 rounded-lg border-gray-200 focus:border-primary/50 focus:ring-primary/5 bg-gray-50/10 text-sm"
                    suppressHydrationWarning
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-gray-500">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    required
                    disabled
                    className="pl-9 h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-600 font-medium cursor-not-allowed text-sm"
                    suppressHydrationWarning
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs text-gray-500">Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    className="pl-9 h-10 rounded-lg border-gray-200 focus:border-primary/50 focus:ring-primary/5 bg-gray-50/10 text-sm"
                    placeholder="+91 XXXXX XXXXX"
                    suppressHydrationWarning
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-xs font-bold text-slate-500">Date of Birth</Label>
                <DatePicker 
                  date={profileData.dob ? parseISO(profileData.dob) : undefined}
                  setDate={(d) => setProfileData({...profileData, dob: d ? format(d, 'yyyy-MM-dd') : ""})}
                  placeholder="Select your birth date"
                  className="rounded-xl border-slate-200 bg-slate-50/10"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Professional Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="title" className="text-xs text-gray-500">Current/Desired Job Title</Label>
                <div className="relative">
                  <Input
                    id="title"
                    name="title"
                    value={profileData.title}
                    onChange={handleChange}
                    className="pl-9 h-10 rounded-lg border-gray-200 focus:border-primary/50 focus:ring-primary/5 bg-gray-50/10 text-sm"
                    placeholder="e.g. Physics Teacher, Software Engineer"
                    suppressHydrationWarning
                  />
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-bold text-gray-500 uppercase">Current Location</Label>
                <div className="relative">
                  <Input
                    id="location"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    className="pl-9 h-10 rounded-lg border-gray-200 focus:border-primary/50 focus:ring-primary/5 bg-gray-50/10 text-sm"
                    placeholder="City, State"
                    suppressHydrationWarning
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="portfolio_website" className="text-xs font-bold text-gray-500 uppercase">Portfolio Website</Label>
                <div className="relative">
                  <Input
                    id="portfolio_website"
                    name="portfolio_website"
                    value={profileData.portfolio_website}
                    onChange={handleChange}
                    className="pl-9 h-10 rounded-lg border-gray-200 focus:border-primary/50 focus:ring-primary/5 bg-gray-50/10 text-sm"
                    placeholder="https://yourportfolio.com"
                    suppressHydrationWarning
                  />
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="experience_years" className="text-xs text-gray-500">Years of Experience</Label>
                <div className="relative">
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    value={profileData.experience_years}
                    onChange={handleChange}
                    className="pl-9 h-10 rounded-lg border-gray-200 focus:border-primary/50 focus:ring-primary/5 bg-gray-50/10 text-sm"
                    suppressHydrationWarning
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="availability" className="text-xs text-gray-500">Availability</Label>
                <select
                  id="availability"
                  name="availability"
                  value={profileData.availability}
                  onChange={handleChange}
                  className="flex w-full rounded-lg border border-gray-200 bg-gray-50/10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 h-10"
                >
                  <option value="open">Open to Opportunities</option>
                  <option value="immediate">Immediate Joiner</option>
                  <option value="notice-period">In Notice Period</option>
                  <option value="not-available">Not Available</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="bio" className="text-xs text-gray-500">Professional Summary</Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="flex w-full rounded-lg border border-gray-200 bg-gray-50/10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all duration-200"
                  placeholder="Summarize your professional background and top achievements."
                  suppressHydrationWarning
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-slate-100">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Skills & Expertise</h2>
                </div>
                <p className="text-[11px] text-slate-500 font-medium ml-11">Add skills to appear in more relevant search results.</p>
              </div>
              <div className="relative flex items-center gap-2 max-w-xs w-full group">
                <div className="relative w-full">
                  <Input
                    placeholder="Search or add skills..."
                    value={skillInput}
                    onFocus={() => skillInput.trim() && setShowSuggestions(true)}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                      if (e.key === "Escape") setShowSuggestions(false);
                    }}
                    className="h-9 text-xs rounded-xl pr-8 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                  />
                  {isSearchingSkills && (
                    <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-primary/40" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleAddCustomSkill()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && skillSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-60 overflow-y-auto pt-1">
                        {skillSuggestions.map((s, idx) => {
                          const isAlreadyAdded = profileData.skills.some((ps: any) => 
                            String(ps.name || ps).toLowerCase() === s.name.toLowerCase()
                          );
                          
                          return (
                            <button
                              key={`${s.id}-${idx}`}
                              type="button"
                              onClick={() => {
                                if (!isAlreadyAdded) handleAddCustomSkill(undefined, s.name);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[12px] font-semibold flex items-center justify-between transition-colors border-b border-slate-50 last:border-0 ${
                                isAlreadyAdded 
                                  ? "bg-slate-50/50 text-slate-400 cursor-not-allowed" 
                                  : "hover:bg-primary/5 text-slate-700 active:bg-primary/10"
                              }`}
                            >
                              <span className="capitalize">{s.name}</span>
                              {isAlreadyAdded ? (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Plus className="w-3.5 h-3.5 text-primary/30 group-hover:text-primary transition-colors" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <div className="p-2 bg-slate-50 border-t border-slate-100">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Enter to add custom skill</p>
                      </div>
                    </div>
                  )}

                  {showSuggestions && skillInput.trim() && skillSuggestions.length === 0 && !isSearchingSkills && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-center">
                       <p className="text-[11px] text-slate-500 font-medium">No matches found. Press Enter to add "<span className="font-bold text-slate-900">{skillInput}</span>"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Actual Profile Skills */}
              <div className="flex flex-wrap gap-2.5 mt-2 min-h-[40px] p-3 rounded-2xl bg-slate-50/50 border border-dashed border-slate-100">
                {Array.isArray(profileData.skills) && profileData.skills.length > 0 ? (
                  profileData.skills.map((skillId: any) => {
                    const targetId = String(skillId.id || skillId).toLowerCase().trim();
                    const skillInfo = availableSkills.find(s => String(s.id).toLowerCase().trim() === targetId);
                    const displayName = skillInfo?.name || String(skillId.name || skillId);

                    return (
                      <button
                        key={targetId}
                        type="button"
                        onClick={() => toggleSkill(targetId)}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border bg-primary text-white border-primary scale-[1.02] ring-1 ring-primary/20"
                      >
                        {displayName}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSkill(targetId);
                          }}
                          className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-slate-400 font-medium italic text-[11px] py-1">No skills added yet. Type above to add your expertise.</p>
                )}
              </div>
            </div>
          </section>
        </form>
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/40 border-2 border-slate-100/80 overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Education</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={eduLoading}
            onClick={() => { setShowEduForm(!showEduForm); if (!showEduForm) setEditingEduId(null); }}
            className="rounded-xl h-10 px-4 text-xs font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
          >
            {showEduForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add New</>}
          </Button>
        </div>

        {eduError && (
          <div className="p-4 mx-6 mt-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
            {eduError}
          </div>
        )}

        {showEduForm && (
          <form onSubmit={handleEduSubmit} className="p-6 md:p-8 border-b-2 border-slate-50 bg-slate-50/30 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Institution</Label>
                <Input
                  value={eduFormData.institution}
                  onChange={(e) => setEduFormData({ ...eduFormData, institution: e.target.value })}
                  placeholder="University Name"
                  required
                  className="rounded-xl h-11 bg-white border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Degree</Label>
                <Input
                  value={eduFormData.degree}
                  onChange={(e) => setEduFormData({ ...eduFormData, degree: e.target.value })}
                  placeholder="e.g. Bachelor's"
                  required
                  className="rounded-xl h-11 bg-white border-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Field of Study</Label>
                <Input
                  value={eduFormData.field_of_study}
                  onChange={(e) => setEduFormData({ ...eduFormData, field_of_study: e.target.value })}
                  placeholder="e.g. Computer Science"
                  required
                  className="rounded-xl h-11 bg-white border-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Grade / Percentage</Label>
                <Input
                  value={eduFormData.grade}
                  onChange={(e) => setEduFormData({ ...eduFormData, grade: e.target.value })}
                  placeholder="e.g. 8.5 CGPA"
                  className="rounded-xl h-11 bg-white border-slate-100"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 ml-1">Start Date</Label>
                  <DatePicker 
                    date={eduFormData.start_date ? parseISO(eduFormData.start_date) : undefined}
                    setDate={(d) => setEduFormData({...eduFormData, start_date: d ? format(d, 'yyyy-MM-dd') : ""})}
                    placeholder="Joined date"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 ml-1">End Date</Label>
                  <DatePicker 
                    date={eduFormData.end_date ? parseISO(eduFormData.end_date) : undefined}
                    setDate={(d) => setEduFormData({...eduFormData, end_date: d ? format(d, 'yyyy-MM-dd') : ""})}
                    placeholder="Left date"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Highlights</Label>
                <textarea
                  value={eduFormData.description}
                  onChange={(e) => setEduFormData({ ...eduFormData, description: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-hidden"
                  placeholder="Coursework, projects, achievements..."
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving || eduLoading} className="rounded-xl h-11 px-10 font-bold bg-slate-800 hover:bg-slate-900 shadow-lg shadow-slate-200">
                {editingEduId ? "Update Record" : "Save Record"}
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y-2 divide-slate-50">
          {(eduLoading && !localEduList?.length) ? (
            <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-200" /></div>
          ) : localEduList?.filter(e => !(e as any).is_deleted).length ? (
            localEduList.filter(e => !(e as any).is_deleted).map((edu) => (
              <div key={edu.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-all duration-300 rounded-xl border-b border-slate-50 last:border-0 border-l-2 border-l-transparent hover:border-l-emerald-500">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200/50 group-hover:rotate-6 transition-transform duration-500">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[15px] font-bold text-slate-800 leading-tight">{(edu.degree ?? "—")}</h4>
                    <p className="text-slate-500 text-xs font-semibold">{edu.institution ?? "—"}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold mt-1">
                      <span className="flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded-full text-slate-500">
                        <Calendar className="w-3 h-3" /> {(edu.start_year ?? edu.start_date) ?? "—"} — {(edu.end_year ?? edu.end_date) || "Present"}
                      </span>
                      {edu.grade && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">{edu.grade}</span>}
                      {(edu as any).is_dirty || (edu as any).is_new ? <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[8px] border border-amber-200">PENDING</span> : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 translate-x-1">
                  <button type="button" onClick={() => handleEduEdit(edu)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"><Edit2 className="w-4 h-4" /></button>
                  <button type="button" onClick={() => handleEduDelete(edu.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <p className="text-gray-400 text-sm font-medium italic">No education records found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/40 border-2 border-slate-100/80 overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Work Experience</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={expLoading}
            onClick={() => { setShowExpForm(!showExpForm); if (!showExpForm) setEditingExpId(null); }}
            className="rounded-xl h-10 px-4 text-xs font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
          >
            {showExpForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add New</>}
          </Button>
        </div>

        {expError && (
          <div className="p-4 mx-6 mt-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
            {expError}
          </div>
        )}

        {showExpForm && (
          <form onSubmit={handleExpSubmit} className="p-6 md:p-8 border-b-2 border-slate-50 bg-slate-50/30 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Job Title</Label>
                <Input
                  value={expFormData.job_title}
                  onChange={(e) => setExpFormData({ ...expFormData, job_title: e.target.value })}
                  placeholder="e.g. Senior Teacher"
                  required
                  className="rounded-xl h-11 bg-white border-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Organization</Label>
                <Input
                  value={expFormData.company_name}
                  onChange={(e) => setExpFormData({ ...expFormData, company_name: e.target.value })}
                  placeholder="School or Company Name"
                  required
                  className="rounded-xl h-11 bg-white border-slate-100"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 ml-1">Start Date</Label>
                  <DatePicker 
                    date={expFormData.start_date ? parseISO(expFormData.start_date) : undefined}
                    setDate={(d) => setExpFormData({...expFormData, start_date: d ? format(d, 'yyyy-MM-dd') : ""})}
                    placeholder="Start date"
                  />
                </div>
                {!expFormData.is_current && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 ml-1">End Date</Label>
                    <DatePicker 
                      date={expFormData.end_date ? parseISO(expFormData.end_date) : undefined}
                      setDate={(d) => setExpFormData({...expFormData, end_date: d ? format(d, 'yyyy-MM-dd') : ""})}
                      placeholder="End date"
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex items-center gap-3 py-2">
                 <button
                  type="button"
                  onClick={() => setExpFormData({ ...expFormData, is_current: !expFormData.is_current })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    expFormData.is_current ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200"
                  }`}
                >
                  {expFormData.is_current ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  Working here
                </button>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Description</Label>
                <textarea
                  value={expFormData.description}
                  onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-hidden"
                  placeholder="Key responsibilities and achievements..."
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving || expLoading} className="rounded-xl h-11 px-10 font-bold bg-slate-800 hover:bg-slate-900 shadow-lg shadow-slate-200">
                {editingExpId ? "Update Record" : "Save Record"}
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y-2 divide-slate-50">
          {(expLoading && !localExpList?.length) ? (
            <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-200" /></div>
          ) : localExpList?.filter(e => !(e as any).is_deleted).length ? (
            localExpList.filter(e => !(e as any).is_deleted).map((exp) => (
              <div key={exp.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-all duration-300 rounded-xl border-b border-slate-50 last:border-0 border-l-2 border-l-transparent hover:border-l-indigo-500">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200/50 group-hover:rotate-6 transition-transform duration-500">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[15px] font-bold text-slate-800 leading-tight">{exp.job_title}</h4>
                    <p className="text-slate-500 text-xs font-semibold">{exp.company_name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold mt-1">
                      <span className="flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded-full text-slate-500">
                        <Calendar className="w-3 h-3" /> {exp.start_date?.split("T")[0]} — {exp.is_current ? "Present" : (exp.end_date?.split("T")[0] || "—")}
                      </span>
                      {exp.location && <span className="flex items-center gap-1 text-slate-400 font-bold"><MapPin className="w-3 h-3" /> {exp.location}</span>}
                      {(exp as any).is_dirty || (exp as any).is_new ? <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[8px] border border-amber-200">PENDING</span> : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 translate-x-1">
                  <button type="button" onClick={() => handleExpEdit(exp)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"><Edit2 className="w-4 h-4" /></button>
                  <button type="button" onClick={() => handleExpDelete(exp.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <p className="text-gray-400 text-sm font-medium italic">No work experience found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Global Save Button */}
      <div className="flex justify-center p-8 mt-6">
        <Button 
          onClick={handleSubmit} 
          disabled={saving} 
          className="w-full sm:w-auto min-w-[280px] rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
        >
          {saving ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Syncing Profile...</>
          ) : (
            <>Update Professional Profile <ChevronRight className="w-5 h-5" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
