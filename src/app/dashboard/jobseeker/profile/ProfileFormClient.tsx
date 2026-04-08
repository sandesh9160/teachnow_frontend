"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";
import type { EducationPayload, EducationRecord } from "@/types/education";
import type { ExperiencePayload, ExperienceRecord } from "@/types/experience";
import { Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, Camera, XCircle, ShieldCheck, Trash2, Edit2, Calendar, Globe, Clock, Tag, CheckSquare, Square, X } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { toast } from "sonner";

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
}: {
  initialResponse: Record<string, unknown>;
}) {
  const router = useRouter();
  const { getProfile, updateProfile } = useProfile();
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

  const [skillInput, setSkillInput] = useState("");
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

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = skillInput.trim();
    if (!val) return;

    // Check if already exists
    const exists = profileData.skills.some((s: any) =>
      String(s.id || s).toLowerCase().trim() === val.toLowerCase()
    );

    if (!exists) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, val]
      }));

      // Also add to availableSkills locally so it shows up in the grid if it's not there
      const inAvailable = availableSkills.some(s => s.name.toLowerCase() === val.toLowerCase());
      if (!inAvailable) {
        setAvailableSkills(prev => [...prev, { id: val, name: val }]);
      }
    }
    setSkillInput("");
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
    setLocalEduList(prev => prev.map(edu => edu.id === id ? { ...edu, is_deleted: true } : edu));
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
    setLocalExpList(prev => prev.map(exp => exp.id === id ? { ...exp, is_deleted: true } : exp));
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

      // Sync Education
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

      // Sync Experience
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
        toast.error("Some records failed to sync. Please try again.");
        // Continue but with warning, or abort? Let's check profile update anyway.
      }

      // Sync Profile
      if (photoFile) {
        const { uploadFile } = await import("@/actions/FileUpload");
        const formData = new FormData();
        formData.append("_method", "PUT");
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
        const result = await uploadFile("jobseeker/profile", { method: "POST", data: formData });
        processResponse(result);
      } else {
        // Exclude internal/read-only fields from the update payload
        const { email, profile_photo, ...safeData } = profileData;
        const payload = { 
          ...safeData, 
          job_title: safeData.title, // Alias for backend compatibility
          skills: skillNames 
        };
        const result = await updateProfile(payload);
        processResponse(result);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const processResponse = (result: any) => {
    if (result.status === true || result.success === true || result.id || result.data?.id || result.data?.profile?.id) {
      toast.success("Profile updated successfully!");
      
      // Extract the nested profile photo from the backend response structure
      const newPhoto = result.data?.profile?.profile_photo || result.data?.profile_photo || result.profile_photo;
      if (newPhoto) {
        setProfileData(prev => ({ ...prev, profile_photo: String(newPhoto) }));
      }

      setPhotoFile(null);
      setPhotoPreview(null);
      router.refresh();
    } else {
      const errorMsg = result.message || result.error || "Update failed";
      toast.error(errorMsg);
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-600 mt-1 text-sm font-medium">Manage your professional identity and career preferences.</p>
        </div>
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">
          Sync Status: LIVE
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-primary/5 via-primary/2 to-transparent p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="relative group">
            <div
              className="w-24 h-24 rounded-2xl bg-white border-2 border-white shadow-xl overflow-hidden relative group cursor-pointer"
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              {photoPreview || profileData.profile_photo ? (
                <img
                  src={photoPreview || getFullImageUrl(profileData.profile_photo)!}
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-4xl font-bold text-white uppercase">
                  {profileData.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
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
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-center md:text-left space-y-0.5">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{profileData.name || "Add your name"}</h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-gray-500 font-medium text-sm">
              <span className="flex items-center gap-1.5 text-primary/80"><Briefcase className="w-3.5 h-3.5" /> {profileData.title || "Professional Profile"}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 hidden md:block"></span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {profileData.location || "Location not set"}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
              <User className="w-4 h-4 text-primary/60" />
              <h3 className="text-sm font-bold text-gray-800">Personal Information</h3>
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
                <Label htmlFor="dob" className="text-xs text-gray-500">Date of Birth</Label>
                <div className="relative">
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={profileData.dob}
                    onChange={handleChange}
                    className="pl-9 h-10 rounded-lg border-gray-200 focus:border-primary/50 focus:ring-primary/5 bg-gray-50/10 text-sm"
                    suppressHydrationWarning
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
              <Briefcase className="w-4 h-4 text-primary/60" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Professional Details</h3>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Skills & Expertise</h2>
                </div>
                <p className="text-[10px] text-slate-400 font-medium ml-6">Add skills to appear in more relevant search results.</p>
              </div>
              <div className="relative flex items-center gap-2 max-w-xs w-full">
                <Input
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                  className="h-8 text-xs rounded-lg pr-8"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="absolute right-2 text-primary hover:scale-110 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </button>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Education</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={eduLoading}
            onClick={() => { setShowEduForm(!showEduForm); if (!showEduForm) setEditingEduId(null); }}
            className="rounded-lg h-8 text-xs font-bold border-primary/20 text-primary hover:bg-primary/5"
          >
            {showEduForm ? "Cancel" : <><Plus className="w-3.5 h-3.5 mr-1" /> Add New</>}
          </Button>
        </div>

        {eduError ? (
          <div className="p-4 border-b border-gray-100 bg-red-50 text-red-700 text-xs font-medium">
            <p>{eduError}</p>
          </div>
        ) : null}

        {showEduForm && (
          <form onSubmit={handleEduSubmit} className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/20 space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-400">Institution</Label>
                <Input
                  value={eduFormData.institution}
                  onChange={(e) => setEduFormData({ ...eduFormData, institution: e.target.value })}
                  placeholder="University Name"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-400">Degree</Label>
                <Input
                  value={eduFormData.degree}
                  onChange={(e) => setEduFormData({ ...eduFormData, degree: e.target.value })}
                  placeholder="e.g. Bachelor's"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-400">Field of Study</Label>
                <Input
                  value={eduFormData.field_of_study}
                  onChange={(e) => setEduFormData({ ...eduFormData, field_of_study: e.target.value })}
                  placeholder="e.g. Physics"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-400">Grade / Percentage</Label>
                <Input
                  value={eduFormData.grade}
                  onChange={(e) => setEduFormData({ ...eduFormData, grade: e.target.value })}
                  placeholder="e.g. 8.5 CGPA or A+"
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-400">Start Date</Label>
                  <Input
                    type="date"
                    value={eduFormData.start_date}
                    onChange={(e) => setEduFormData({ ...eduFormData, start_date: e.target.value })}
                    required
                    className="rounded-lg h-9 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-400">End Date</Label>
                  <Input
                    type="date"
                    value={eduFormData.end_date}
                    onChange={(e) => setEduFormData({ ...eduFormData, end_date: e.target.value })}
                    className="rounded-lg h-9 bg-white text-sm"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-[11px] text-gray-400">Description / Highlights</Label>
                <textarea
                  value={eduFormData.description}
                  onChange={(e) => setEduFormData({ ...eduFormData, description: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                  placeholder="e.g. Relevant coursework, key projects, or achievements..."
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving || eduLoading} size="sm" className="rounded-lg h-9 px-6 font-bold">
                {editingEduId ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y divide-gray-100">
          {(eduLoading && !localEduList?.length) ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary/30" /></div>
          ) : localEduList?.filter(e => !(e as any).is_deleted).length ? (
            localEduList.filter(e => !(e as any).is_deleted).map((edu) => (
              <div key={edu.id} className="p-4 md:p-5 flex justify-between items-center group hover:bg-gray-50/30 transition-all duration-200">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary transition-colors duration-300">
                    <GraduationCap className="w-5 h-5 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-900">{(edu.degree ?? "—")} in {(edu.field_of_study ?? "—")}</h4>
                    <p className="text-gray-500 text-sm font-medium">{edu.institution ?? "—"}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Calendar className="w-3 h-3" /> {(edu.start_year ?? edu.start_date) ?? "—"} — {(edu.end_year ?? edu.end_date) || "Present"}
                      {edu.grade && <><span className="w-0.5 h-0.5 rounded-full bg-gray-300" /><span className="text-primary/60 font-bold">{edu.grade}</span></>}
                      {(edu as any).is_dirty || (edu as any).is_new ? <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-tight border border-amber-100 italic">Pending Sync</span> : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => handleEduEdit(edu)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button type="button" onClick={() => handleEduDelete(edu.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Work Experience</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={expLoading}
            onClick={() => { setShowExpForm(!showExpForm); if (!showExpForm) setEditingExpId(null); }}
            className="rounded-lg h-8 text-xs font-bold border-primary/20 text-primary hover:bg-primary/5"
          >
            {showExpForm ? "Cancel" : <><Plus className="w-3.5 h-3.5 mr-1" /> Add New</>}
          </Button>
        </div>

        {expError ? (
          <div className="p-4 border-b border-gray-100 bg-red-50 text-red-700 text-xs font-medium">
            <p>{expError}</p>
          </div>
        ) : null}

        {showExpForm && (
          <form onSubmit={handleExpSubmit} className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/20 space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-400">Job Title</Label>
                <Input
                  value={expFormData.job_title}
                  onChange={(e) => setExpFormData({ ...expFormData, job_title: e.target.value })}
                  placeholder="e.g. English Teacher"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">Institute Name</Label>
                <Input
                  value={expFormData.company_name}
                  onChange={(e) => setExpFormData({ ...expFormData, company_name: e.target.value })}
                  placeholder="e.g. School or College Name"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">Location</Label>
                <Input
                  value={expFormData.location}
                  onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
                  placeholder="City, State"
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-400">Start Date</Label>
                  <Input
                    type="date"
                    value={expFormData.start_date}
                    onChange={(e) => setExpFormData({ ...expFormData, start_date: e.target.value })}
                    required
                    className="rounded-lg h-9 bg-white text-sm"
                  />
                </div>
                {!expFormData.is_current && (
                  <div className="space-y-1">
                    <Label className="text-[11px] text-gray-400">End Date</Label>
                    <Input
                      type="date"
                      value={expFormData.end_date}
                      onChange={(e) => setExpFormData({ ...expFormData, end_date: e.target.value })}
                      className="rounded-lg h-9 bg-white text-sm"
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setExpFormData({ ...expFormData, is_current: !expFormData.is_current })}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                >
                  {expFormData.is_current ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                  I currently work here
                </button>
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-[11px] text-gray-400">Description</Label>
                <textarea
                  value={expFormData.description}
                  onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                  placeholder="Briefly describe your responsibilities..."
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving || expLoading} size="sm" className="rounded-lg h-9 px-6 font-bold">
                {editingExpId ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y divide-gray-100">
          {(expLoading && !localExpList?.length) ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary/30" /></div>
          ) : localExpList?.filter(e => !(e as any).is_deleted).length ? (
            localExpList.filter(e => !(e as any).is_deleted).map((exp) => (
              <div key={exp.id} className="p-4 md:p-5 flex justify-between items-center group hover:bg-gray-50/30 transition-all duration-200">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary transition-colors duration-300">
                    <Briefcase className="w-5 h-5 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-900 leading-tight">{exp.job_title}</h4>
                    <p className="text-gray-500 text-sm font-medium">{exp.company_name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Calendar className="w-3 h-3" /> {exp.start_date?.split("T")[0]} — {exp.is_current ? "Present" : (exp.end_date?.split("T")[0] || "—")}
                      {exp.location && <><span className="w-0.5 h-0.5 rounded-full bg-gray-300" /><span className="text-gray-500 font-medium">{exp.location}</span></>}
                      {(exp as any).is_dirty || (exp as any).is_new ? <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-tight border border-amber-100 italic">Pending Sync</span> : null}
                    </div>
                    {exp.description && <p className="text-xs text-gray-600 mt-2 italic whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => handleExpEdit(exp)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button type="button" onClick={() => handleExpDelete(exp.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
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

      {/* Global Save Button at Last (Non-sticky) */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-200 mt-8 gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Ready to go live?
          </p>
          <p className="text-[10px] text-gray-400 font-medium">Your changes will be immediately visible to potential employers.</p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={saving} 
          size="lg"
          className="w-full sm:w-auto min-w-[220px] rounded-xl h-12 font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px] active:translate-y-0"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Updating Profile...</>
          ) : (
            <>Update Profile</>
          )}
        </Button>
      </div>
    </div>
  );
}
