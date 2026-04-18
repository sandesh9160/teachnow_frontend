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
  Globe, Languages, Search
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { toast } from "sonner";
import { DatePicker } from "@/shared/ui/DatePicker/DatePicker";
import { format, parseISO, isAfter } from "date-fns";

function toEducationPayload(form: any): EducationPayload {
  return {
    degree: form.degree,
    institution: form.institution,
    field_of_study: form.field_of_study ?? "",
    start_year: form.start_date ? String(new Date(form.start_date).getFullYear()) : "",
    end_year: form.end_date ? String(new Date(form.end_date).getFullYear()) : "",
    grade: form.grade?.trim() ?? "",
    description: form.description ?? "",
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
    open_to_work: String(data.open_to_work || "Actively Looking"),
    notice_period: String(data.notice_period || ""),
    expected_salary: String(data.expected_salary || ""),
    preferred_location: String(data.preferred_location || ""),
    teaching_mode: String(data.teaching_mode || ""),
    skills: Array.isArray(data.skills) ? data.skills : [],
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    languages: Array.isArray(data.languages) ? data.languages : [],
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
  const [langInput, setLangInput] = useState("");
  const [certInput, setCertInput] = useState("");

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
        toast.error("File is too large. Under 2MB required.");
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

  const handleAddLanguage = () => {
    const val = langInput.trim();
    if (!val) return;
    if (!profileData.languages.includes(val)) {
      setProfileData(prev => ({ ...prev, languages: [...prev.languages, val] }));
    }
    setLangInput("");
  };

  const handleAddCertification = () => {
    const val = certInput.trim();
    if (!val) return;
    if (!profileData.certifications.includes(val)) {
      setProfileData(prev => ({ ...prev, certifications: [...prev.certifications, val] }));
    }
    setCertInput("");
  };

  const handleEduSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduFormData.institution.trim()) {
      toast.error("Institution name is required");
      return;
    }
    if (!eduFormData.degree.trim()) {
      toast.error("Degree is required");
      return;
    }
    if (!eduFormData.start_date) {
      toast.error("Start date is required");
      return;
    }
    if (eduFormData.end_date && isAfter(parseISO(eduFormData.start_date), parseISO(eduFormData.end_date))) {
      toast.error("End date cannot be before start date");
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
    setEduFormData({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", grade: "", description: "", grade_type: "Percentage" });
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
    });
    setEditingEduId(edu.id);
    setShowEduForm(true);
  };

  const handleEduDelete = (id: number | string) => {
    setLocalEduList(prev => prev.map(edu => edu.id === id ? { ...edu, is_deleted: true } : edu));
  };

  const handleExpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expFormData.job_title.trim()) {
      toast.error("Job title is required");
      return;
    }
    if (!expFormData.company_name.trim()) {
      toast.error("Organization name is required");
      return;
    }
    if (!expFormData.start_date) {
      toast.error("Start date is required");
      return;
    }
    if (!expFormData.is_current && expFormData.end_date && isAfter(parseISO(expFormData.start_date), parseISO(expFormData.end_date))) {
      toast.error("End date cannot be before start date");
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

  const handleSubmit = async () => {
    if (!profileData.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!profileData.title.trim()) {
      toast.error("Professional title is required");
      return;
    }
    if (!profileData.location.trim()) {
      toast.error("Location is required");
      return;
    }
    if (!profileData.bio.trim()) {
      toast.error("Bio is required");
      return;
    }
    if (profileData.bio.trim().length < 50) {
      toast.error("Bio should be at least 50 characters");
      return;
    }

    try {
      setSaving(true);
      console.log("[ProfileDebug] Starting submission...");
      console.log("[ProfileDebug] Current Profile Data:", profileData);
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
          if (key === 'skills' || key === 'subjects' || key === 'certifications' || key === 'languages') {
            const list = (value as any[] || []);
            console.log(`[ProfileDebug] Appending list ${key}:`, list);
            list.forEach(v => formData.append(`${key}[]`, typeof v === 'string' ? v : v.name));
          } else if (key !== 'profile_photo' && key !== 'email') {
            formData.append(key, value !== null && value !== undefined ? String(value) : "");
            if (key === 'title') formData.append('job_title', String(value));
          }
        });
        formData.append("profile_photo", photoFile);
        profileResult = await uploadFile("jobseeker/profile", { method: "POST", data: formData });
      } else {
        const { email, profile_photo, ...safeData } = profileData;
        const payload = { ...safeData, job_title: safeData.title, skills: skillNames };
        console.log("[ProfileDebug] Submitting JSON payload:", payload);
        profileResult = isNew ? await createProfile(payload) : await updateProfile(payload);
      }

      console.log("[ProfileDebug] Primary Profile Update Result:", profileResult);

      if (profileResult?.status === false) {
        toast.error(profileResult.message || "Update failed");
        return;
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
          console.log(`[ProfileDebug] Updating Experience ${exp.id}:`, payload);
          return updateExperience(exp.id, payload);
        }
      }));

      toast.success("Profile updated successfully!");
      setMode("view");
      router.refresh();
    } catch (err: any) {
      console.error("[ProfileDebug] CRITICAL ERROR:", err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const ProfileHeader = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="h-20 bg-indigo-500 bg-linear-to-r from-indigo-500 to-blue-400" />
      <div className="px-5 pb-5 relative">
        <div className="flex items-end gap-3.5 -mt-8 mb-4">
          <div 
            className={`w-18 h-18 rounded-2xl bg-white p-1 shadow-md border border-slate-50 overflow-hidden shrink-0 relative ${isEdit ? 'cursor-pointer group' : ''}`}
            onClick={() => isEdit && document.getElementById("photo-upload")?.click()}
          >
             {photoPreview || profileData.profile_photo ? (
                <img src={photoPreview || getFullImageUrl(profileData.profile_photo)!} alt="" className="w-full h-full object-cover rounded-xl" />
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
          <div className="flex-1 pb-0.5 min-w-0">
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight truncate">{profileData.name || "Name not set"}</h2>
            <p className="text-[#0F172A]/60 text-[13px] font-medium truncate">{profileData.title || "No title set"}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-50 mt-1">
          <div className="flex items-center gap-2.5 text-[#0F172A]/70">
            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold truncate">{profileData.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#0F172A]/70">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold truncate">{profileData.location || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#0F172A]/70">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold">{profileData.experience_years || 0} Years Experience</span>
          </div>
        </div>
      </div>
      {isEdit && <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />}
    </div>
  );

  const renderProfileView = () => (
    <div className="max-w-3xl mx-auto space-y-4 pb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-3 mb-1 px-4 sm:px-0">
        <div>
          <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">My Profile</h1>
          <p className="text-[#0F172A]/40 text-[11px] font-medium">Your professional identity on TeachNow</p>
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#0F172A]/40 tracking-tight mb-0.5">Status</p>
            <p className="text-[13px] font-semibold text-slate-700">{profileData.open_to_work}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#0F172A]/40 tracking-tight mb-0.5">Notice Period</p>
            <p className="text-[13px] font-semibold text-slate-700">{profileData.notice_period || "Not specified"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#0F172A]/40 tracking-tight mb-0.5">Expected Salary</p>
            <p className="text-[13px] font-semibold text-[#0F172A]">{profileData.expected_salary || "Not specified"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#0F172A]/40 tracking-tight mb-0.5">Preferred Location</p>
            <p className="text-[13px] font-semibold text-[#0F172A]">{profileData.preferred_location || "Not specified"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#0F172A]/40 tracking-tight mb-0.5">Teaching Mode</p>
            <p className="text-[13px] font-semibold text-[#0F172A]">{profileData.teaching_mode || "Not specified"}</p>
          </div>
        </div>
      </div>

      {profileData.bio && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
          <h3 className="text-[12px] font-semibold text-[#0F172A] mb-2.5 flex items-center gap-2">
            <UserCircle className="w-3.5 h-3.5 text-indigo-500" /> About Me
          </h3>
          <p className="text-[#0F172A]/70 leading-relaxed whitespace-pre-wrap text-[14px] font-medium">{profileData.bio}</p>
          {profileData.portfolio_website && (
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#0F172A]/40" />
              <a href={profileData.portfolio_website} target="_blank" className="text-[13px] text-indigo-600 font-semibold hover:underline">{profileData.portfolio_website}</a>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <h3 className="text-[13px] font-bold text-[#0F172A] mb-6 flex items-center gap-2 tracking-wide">
             <Briefcase className="w-4 h-4 text-[#0F172A]/30" /> Experience
          </h3>
          <div className="space-y-8">
            {localExpList.filter(e => !(e as any).is_deleted).length > 0 ? (
              localExpList.filter(e => !(e as any).is_deleted).map((exp) => (
                <div key={exp.id} className="border-l-2 border-slate-50 pl-5">
                  <h4 className="text-[14px] font-bold text-[#0F172A] leading-tight">{exp.job_title}</h4>
                  <p className="text-indigo-600 font-medium text-[13px] mt-1">{exp.company_name}{exp.location ? `, ${exp.location}` : ''}</p>
                  <p className="text-[#0F172A]/40 text-[11px] font-semibold mt-1">
                    {exp.start_date?.split("-")[0]} — {exp.is_current ? "Present" : exp.end_date?.split("-")[0] || "—"}
                  </p>
                  {exp.description && <p className="text-[#0F172A]/50 text-[12px] mt-2 leading-relaxed">{exp.description}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic text-[12px]">No experience added.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <h3 className="text-[13px] font-bold text-[#0F172A] mb-6 flex items-center gap-2 tracking-wide">
             <GraduationCap className="w-4 h-4 text-[#0F172A]/30" /> Education
          </h3>
          <div className="space-y-8">
            {localEduList.filter(e => !(e as any).is_deleted).length > 0 ? (
              localEduList.filter(e => !(e as any).is_deleted).map((edu) => (
                <div key={edu.id} className="border-l-2 border-slate-50 pl-5">
                  <h4 className="text-[14px] font-bold text-[#0F172A] leading-tight">{edu.degree}</h4>
                  <p className="text-[#0F172A]/80 font-medium text-[13px] mt-1 space-x-1">
                    <span>{edu.institution}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[#0F172A]/40 font-semibold">{edu.start_date?.split("-")[0]} — {edu.end_date?.split("-")[0]}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {edu.field_of_study && <p className="text-[10px] text-indigo-600 font-bold tracking-widest">{edu.field_of_study}</p>}
                    {edu.grade && <span className="text-[11px] font-bold text-emerald-600">{edu.grade}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#0F172A]/40 italic text-[12px]">Academic details missing.</p>
            )}
        </div>
      </div>
    </div>

      <div className="bg-white p-7 rounded-xl border border-slate-100 shadow-xs space-y-8 mt-6">
        <div>
          <h3 className="text-[13px] font-bold text-[#0F172A] mb-5 flex items-center gap-2 tracking-wide">
             <BookOpen className="w-4 h-4 text-[#0F172A]/30" /> Subjects & Skills
          </h3>
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            {([...(profileData.skills || []), ...(profileData.certifications || [])]).map((item: any, i: number) => (
               <span key={i} className="text-indigo-600 font-bold text-[13px] tracking-tight">
                 {typeof item === 'string' ? item : item.name}
               </span>
            ))}
          </div>
        </div>
 
        {profileData.languages?.length > 0 && (
          <div>
            <h3 className="text-[13px] font-bold text-[#0F172A] mb-5 flex items-center gap-2 tracking-wide">
               <Languages className="w-4 h-4 text-[#0F172A]/30" /> Languages
            </h3>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              {profileData.languages.map((lang: any, i: number) => (
                 <span key={i} className="text-[#0F172A]/80 font-bold text-[13px] tracking-tight">
                   {typeof lang === 'string' ? lang : lang.name}
                 </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileEdit = () => (
    <div className="max-w-3xl mx-auto space-y-5 pb-10 animate-in slide-in-from-right-4 duration-500 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Update Profile</h1>
          <p className="text-[#0F172A]/40 text-[12px] font-medium mt-0.5">Edit your recruitment-ready profile</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={() => setMode("view")} className="h-8 px-5 rounded-lg font-semibold text-[12px] border-slate-200 text-slate-600">Cancel</Button>
           <Button onClick={handleSubmit} disabled={saving} className="h-8 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[12px]">
             {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null} Save Final
           </Button>
        </div>
      </div>

      <ProfileHeader isEdit />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-8">
          <section className="space-y-6">
            <h3 className="text-[13px] font-semibold text-[#0F172A] border-b border-slate-50 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-1.5">
                 <Label className="text-[13px] font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></Label>
                 <Input name="name" value={profileData.name} onChange={handleChange} className="h-10 rounded-lg text-[13px] border-slate-200" />
               </div>
               <div className="space-y-1.5">
                 <Label className="text-[13px] font-semibold text-slate-700">Professional Title <span className="text-red-500">*</span></Label>
                 <Input name="title" value={profileData.title} onChange={handleChange} className="h-10 rounded-lg text-[13px] border-slate-200" />
               </div>
               <div className="space-y-1.5">
                 <Label className="text-[13px] font-semibold text-slate-700">Location <span className="text-red-500">*</span></Label>
                 <Input name="location" value={profileData.location} onChange={handleChange} className="h-10 rounded-lg text-[13px] border-slate-200" />
               </div>
               <div className="space-y-1.5">
                 <Label className="text-[13px] font-semibold text-slate-700">Gender</Label>
                 <select name="gender" value={profileData.gender} onChange={handleChange} className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] outline-none">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                 </select>
               </div>
               <div className="space-y-1.5">
                 <Label className="text-[13px] font-semibold text-slate-700">Portfolio Website</Label>
                 <Input name="portfolio_website" value={profileData.portfolio_website} onChange={handleChange} placeholder="https://..." className="h-10 rounded-lg text-[13px] border-slate-200" />
               </div>
               <div className="space-y-1.5">
                 <Label className="text-[13px] font-semibold text-slate-700">Date of Birth</Label>
                 <DatePicker 
                    date={profileData.dob ? parseISO(profileData.dob) : undefined}
                    setDate={(d) => setProfileData({...profileData, dob: d ? format(d, 'yyyy-MM-dd') : ""})}
                    className="h-10 rounded-lg text-[13px] bg-white border border-slate-200"
                 />
               </div>
               <div className="md:col-span-2 space-y-1.5">
                 <Label className="text-[13px] font-semibold text-slate-700">Professional Bio <span className="text-red-500">*</span></Label>
                 <textarea name="bio" value={profileData.bio} onChange={handleChange} rows={3} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-[13px] outline-none" placeholder="Share your teaching philosophy and experience..." />
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[13px] font-semibold text-slate-900 border-b border-slate-50 pb-2">Job Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Open to Work Status</Label>
                <select name="open_to_work" value={profileData.open_to_work} onChange={handleChange} className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] outline-none">
                   <option value="Actively Looking">Actively Looking</option>
                   <option value="Open to Opportunities">Open to Opportunities</option>
                   <option value="Not Looking">Not Looking</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Notice Period</Label>
                <select name="notice_period" value={profileData.notice_period} onChange={handleChange} className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] outline-none">
                   <option value="Immediate">Immediate</option>
                   <option value="15 Days">15 Days</option>
                   <option value="30 Days">30 Days</option>
                   <option value="60 Days">60 Days</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Expected Salary</Label>
                <Input name="expected_salary" value={profileData.expected_salary} onChange={handleChange} placeholder="e.g. 5,00,000" className="h-10 rounded-lg text-[13px] border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Preferred Location</Label>
                <Input name="preferred_location" value={profileData.preferred_location} onChange={handleChange} placeholder="City name" className="h-10 rounded-lg text-[13px] border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium text-slate-600">Teaching Mode</Label>
                <select name="teaching_mode" value={profileData.teaching_mode} onChange={handleChange} className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] outline-none">
                   <option value="Offline">Offline</option>
                   <option value="Online">Online</option>
                   <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-2">
               <h3 className="text-[13px] font-semibold text-slate-900">Work History</h3>
               <button type="button" onClick={() => {setShowExpForm(!showExpForm); setEditingExpId(null);}} className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700">
                 {showExpForm ? "Cancel" : "Add Experience"}
               </button>
            </div>

            {showExpForm && (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-[12px] font-medium text-slate-600">Job Title <span className="text-red-500">*</span></Label>
                    <Input value={expFormData.job_title} onChange={(e) => setExpFormData({...expFormData, job_title: e.target.value})} className="h-10 rounded-lg text-sm bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-medium text-slate-600">Institution Name <span className="text-red-500">*</span></Label>
                    <Input value={expFormData.company_name} onChange={(e) => setExpFormData({...expFormData, company_name: e.target.value})} className="h-10 rounded-lg text-sm bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-medium text-slate-600">Location</Label>
                    <Input value={expFormData.location} onChange={(e) => setExpFormData({...expFormData, location: e.target.value})} className="h-10 rounded-lg text-sm bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-medium text-slate-600">Timeline <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2">
                       <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-bold text-[#0F172A]/40 tracking-tight">Start Date</p>
                          <DatePicker date={expFormData.start_date ? parseISO(expFormData.start_date) : undefined} setDate={(d) => setExpFormData({...expFormData, start_date: d ? format(d, 'yyyy-MM-dd') : ""})} className="h-10 text-[13px] bg-white border-slate-200" />
                       </div>
                       <span className="hidden sm:flex h-10 items-center text-[10px] text-[#0F172A]/40 font-bold tracking-widest shrink-0">to</span>
                       <div className="flex-1 space-y-1">
                          <p className="text-[12px] font-semibold text-[#0F172A]/60">End Date</p>
                          <DatePicker disabled={expFormData.is_current} date={expFormData.end_date ? parseISO(expFormData.end_date) : undefined} setDate={(d) => setExpFormData({...expFormData, end_date: d ? format(d, 'yyyy-MM-dd') : ""})} className="h-10 text-[13px] bg-white border-slate-200" />
                       </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <button type="button" onClick={() => setExpFormData(p => ({...p, is_current: !p.is_current}))} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${expFormData.is_current ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200"}`}>
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
               <button type="button" onClick={() => {setShowEduForm(!showEduForm); setEditingEduId(null);}} className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700">
                 {showEduForm ? "Cancel" : "Add Education"}
               </button>
            </div>
            
            {showEduForm && (
               <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100/50 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-slate-700">Degree <span className="text-red-500">*</span></Label>
                      <Input value={eduFormData.degree} onChange={(e) => setEduFormData({...eduFormData, degree: e.target.value})} className="h-10 rounded-lg text-sm bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-slate-700">Institution <span className="text-red-500">*</span></Label>
                      <Input value={eduFormData.institution} onChange={(e) => setEduFormData({...eduFormData, institution: e.target.value})} className="h-10 rounded-lg text-sm bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-slate-700">Field of Study</Label>
                      <Input value={eduFormData.field_of_study} onChange={(e) => setEduFormData({...eduFormData, field_of_study: e.target.value})} className="h-10 rounded-lg text-sm bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-slate-700">Grade (CGPA / %)</Label>
                      <div className="flex gap-2">
                        <select 
                          value={eduFormData.grade_type} 
                          onChange={(e) => setEduFormData({...eduFormData, grade_type: e.target.value as any})}
                          className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-[12px] outline-none shrink-0"
                        >
                          <option value="Percentage">Percentage</option>
                          <option value="CGPA">CGPA</option>
                        </select>
                        <Input value={eduFormData.grade} onChange={(e) => setEduFormData({...eduFormData, grade: e.target.value})} placeholder={eduFormData.grade_type === "Percentage" ? "e.g. 85%" : "e.g. 9.2"} className="h-10 rounded-lg text-sm bg-white" />
                      </div>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-[13px] font-semibold text-slate-700">Joined Timeline <span className="text-red-500">*</span></Label>
                      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2">
                         <div className="flex-1 space-y-1">
                            <p className="text-[12px] font-semibold text-slate-500">Start Date</p>
                            <DatePicker date={eduFormData.start_date ? parseISO(eduFormData.start_date) : undefined} setDate={(d) => setEduFormData({...eduFormData, start_date: d ? format(d, 'yyyy-MM-dd') : ""})} className="h-10 text-[13px] bg-white border-slate-200" />
                         </div>
                         <span className="hidden sm:flex h-10 items-center text-[10px] text-[#0F172A]/40 font-bold tracking-widest shrink-0">to</span>
                         <div className="flex-1 space-y-1">
                            <p className="text-[12px] font-semibold text-[#0F172A]/60">End Date</p>
                            <DatePicker date={eduFormData.end_date ? parseISO(eduFormData.end_date) : undefined} setDate={(d) => setEduFormData({...eduFormData, end_date: d ? format(d, 'yyyy-MM-dd') : ""})} className="h-10 text-[13px] bg-white border-slate-200" />
                         </div>
                      </div>
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
               <div className="space-y-4">
                  <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                     <Award className="w-3.5 h-3.5 text-slate-400" /> Skills & Subjects
                  </h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Add a skill or subject..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomSkill())}
                      className="h-10 rounded-xl bg-white border border-slate-200 px-5 text-[13px]" 
                    />
                    <Button type="button" onClick={handleAddCustomSkill} className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-[12px]">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((s: any, idx: number) => (
                      <span key={idx} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-slate-50 text-[#0F172A]/80 font-semibold text-[11px] rounded-lg border border-slate-100">
                        {typeof s === 'string' ? s : s.name}
                        <button type="button" onClick={() => setProfileData(p => ({...p, skills: p.skills.filter((_: any, i: number) => i !== idx)}))} className="p-0.5 text-[#0F172A]/20 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                     <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Certifications
                  </h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="CTET, NET, Montessori... (Enter to add)" value={certInput} onChange={(e) => setCertInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCertification())}
                      className="h-10 rounded-xl bg-white border border-slate-200 px-5 text-[13px]" 
                    />
                    <Button type="button" onClick={handleAddCertification} className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-[12px]">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.certifications.map((c: any, idx: number) => (
                      <span key={idx} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-lg border border-emerald-100">
                        {typeof c === 'string' ? c : c.name}
                        <button type="button" onClick={() => setProfileData(p => ({...p, certifications: p.certifications.filter((_: any, i: number) => i !== idx)}))} className="p-0.5 text-emerald-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                     <Languages className="w-3.5 h-3.5 text-slate-400" /> Languages Known
                  </h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="English, Hindi, Telugu... (Enter to add)" value={langInput} onChange={(e) => setLangInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLanguage())}
                      className="h-10 rounded-xl bg-white border border-slate-200 px-5 text-[13px]" 
                    />
                    <Button type="button" onClick={handleAddLanguage} className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-[12px]">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.languages.map((l: any, idx: number) => (
                      <span key={idx} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 font-semibold text-[11px] rounded-lg border border-indigo-100">
                        {typeof l === 'string' ? l : l.name}
                        <button type="button" onClick={() => setProfileData(p => ({...p, languages: p.languages.filter((_: any, i: number) => i !== idx)}))} className="p-0.5 text-indigo-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
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
