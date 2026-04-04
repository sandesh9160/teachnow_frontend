"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";
import type { EducationPayload, EducationRecord } from "@/types/education";
import type { ExperiencePayload, ExperienceRecord } from "@/types/experience";
import { Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, Trash2, Edit2, Calendar, Globe, Clock, Tag, CheckSquare, Square } from "lucide-react";
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
  description: string;
}): EducationPayload {
  return {
    degree: form.degree,
    institution: form.institution,
    field_of_study: form.field_of_study,
    start_year: form.start_date?.slice(0, 4) ?? "",
    end_year: form.end_date?.slice(0, 4) ?? "",
    grade: form.description?.trim() ?? "",
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
    title: String(data.title || ""),
    bio: String(data.bio || ""),
    experience_years: Number(data.experience_years || 0),
    availability: String(data.availability || "open"),
    dob: data.dob ? String(data.dob).split("T")[0] : "",
    portfolio_website: String(data.portfolio_website || ""),
    skills: Array.isArray(data.skills) ? data.skills.map((s: any) => s.id) : [],
  };
}

export default function ProfileFormClient({
  initialResponse,
}: {
  initialResponse: Record<string, unknown>;
}) {
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

  const [eduFormData, setEduFormData] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
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

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setLoading(true);
        const res = await getProfile();
        if (cancelled) return;

        if (res?.data) {
          setProfileData(mapServerProfile(res));
          if (Array.isArray(res.skills)) {
            setAvailableSkills(res.skills);
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

  const handleEduSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = toEducationPayload(eduFormData);
    try {
      setSaving(true);
      if (editingEduId) {
        await updateEducation(editingEduId, payload);
        toast.success("Education updated!");
      } else {
        await createEducation(payload);
        toast.success("Education added!");
      }
      setEduFormData({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", description: "" });
      setShowEduForm(false);
      setEditingEduId(null);
    } catch (err) {
      toast.error("Failed to save education.");
    } finally {
      setSaving(false);
    }
  };

  const handleEduEdit = (edu: EducationRecord) => {
    const { start_date, end_date } = recordToFormDates(edu);
    setEduFormData({
      institution: edu.institution ?? "",
      degree: edu.degree ?? "",
      field_of_study: edu.field_of_study ?? "",
      start_date,
      end_date,
      description: edu.description ?? edu.grade ?? "",
    });
    setEditingEduId(edu.id);
    setShowEduForm(true);
  };

  const handleEduDelete = async (id: number | string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteEducation(id);
      toast.success("Education deleted.");
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = toExperiencePayload(expFormData);
    try {
      setSaving(true);
      if (editingExpId) {
        await updateExperience(editingExpId, payload);
        toast.success("Experience updated!");
      } else {
        await createExperience(payload);
        toast.success("Experience added!");
      }
      setExpFormData({ job_title: "", company_name: "", location: "", start_date: "", end_date: "", is_current: false, description: "" });
      setShowExpForm(false);
      setEditingExpId(null);
    } catch (err) {
      toast.error("Failed to save experience.");
    } finally {
      setSaving(false);
    }
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

  const handleExpDelete = async (id: number | string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteExperience(id);
      toast.success("Experience deleted.");
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(profileData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
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
        <div className="bg-linear-to-r from-primary/5 via-primary/[0.02] to-transparent p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="relative group">
            <div className="w-20 h-20 bg-primary text-white rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg transform transition-transform group-hover:scale-105 duration-300">
              {profileData.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-lg shadow-md border border-gray-100 text-primary">
              <Plus className="w-3 h-3" />
            </div>
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
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase">Full Name</Label>
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
                <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase">Email Address</Label>
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
                <Label htmlFor="phone" className="text-xs font-bold text-gray-500 uppercase">Phone Number</Label>
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
                <Label htmlFor="dob" className="text-xs font-bold text-gray-500 uppercase">Date of Birth</Label>
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
                <Label htmlFor="title" className="text-xs font-bold text-gray-500 uppercase">Current/Desired Job Title</Label>
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
                <Label htmlFor="experience_years" className="text-xs font-bold text-gray-500 uppercase">Total Work Experience (Years)</Label>
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
                <Label htmlFor="availability" className="text-xs font-bold text-gray-500 uppercase">Availability Status</Label>
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
                <Label htmlFor="bio" className="text-xs font-bold text-gray-500 uppercase">Professional Summary</Label>
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
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Tag className="w-4 h-4 text-primary/60" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Skills & Expertise</h2>
            </div>
            
            <div className="flex flex-wrap gap-2.5 mt-2">
              {availableSkills.map((skill) => {
                const targetId = String(skill.id).toLowerCase().trim();
                const isSelected = Array.isArray(profileData.skills) && profileData.skills.some((s: any) => {
                  const savedId = String(s.id || s).toLowerCase().trim();
                  return savedId === targetId;
                });

                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border shadow-sm ${
                      isSelected
                        ? "bg-primary text-white border-primary scale-[1.02] ring-2 ring-primary/20 shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:scale-95"
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })}
              {availableSkills.length === 0 && (
                <div className="flex flex-col items-center justify-center p-10 w-full border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                   <p className="text-slate-400 font-medium italic">No skills available from server.</p>
                </div>
              )}
            </div>
          </section>

          <div className="pt-4 flex justify-end border-t border-gray-50">
            <Button type="submit" variant="default" size="lg" disabled={saving} className="rounded-lg px-8 h-10 text-sm font-bold shadow-md shadow-primary/10">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </div>
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
                <Label className="text-[11px] font-bold text-gray-400 uppercase">Institution</Label>
                <Input
                  value={eduFormData.institution}
                  onChange={(e) => setEduFormData({ ...eduFormData, institution: e.target.value })}
                  placeholder="University Name"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-400 uppercase">Degree</Label>
                <Input
                  value={eduFormData.degree}
                  onChange={(e) => setEduFormData({ ...eduFormData, degree: e.target.value })}
                  placeholder="e.g. Bachelor's"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-400 uppercase">Field of Study</Label>
                <Input
                  value={eduFormData.field_of_study}
                  onChange={(e) => setEduFormData({ ...eduFormData, field_of_study: e.target.value })}
                  placeholder="e.g. Physics"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase">Start Date</Label>
                  <Input
                    type="date"
                    value={eduFormData.start_date}
                    onChange={(e) => setEduFormData({ ...eduFormData, start_date: e.target.value })}
                    required
                    className="rounded-lg h-9 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase">End Date</Label>
                  <Input
                    type="date"
                    value={eduFormData.end_date}
                    onChange={(e) => setEduFormData({ ...eduFormData, end_date: e.target.value })}
                    className="rounded-lg h-9 bg-white text-sm"
                  />
                </div>
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
          {eduLoading && !education?.length ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary/30" /></div>
          ) : education?.length ? (
            education.map((edu) => (
              <div key={edu.id} className="p-4 md:p-5 flex justify-between items-center group hover:bg-gray-50/30 transition-all duration-200">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary transition-colors duration-300">
                    <GraduationCap className="w-5 h-5 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-900 leading-tight">{(edu.degree ?? "—")} in {(edu.field_of_study ?? "—")}</h4>
                    <p className="text-gray-500 text-sm font-medium">{edu.institution ?? "—"}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Calendar className="w-3 h-3" /> {(edu.start_year ?? edu.start_date) ?? "—"} — {(edu.end_year ?? edu.end_date) || "Present"}
                      {edu.grade && <><span className="w-0.5 h-0.5 rounded-full bg-gray-300" /><span className="text-primary/60 font-bold">{edu.grade}</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button type="button" disabled={eduLoading} onClick={() => handleEduEdit(edu)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button type="button" disabled={eduLoading} onClick={() => handleEduDelete(edu.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          ) : !eduError ? (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <p className="text-gray-400 text-sm font-medium italic">No education records found.</p>
            </div>
          ) : null}
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
                <Label className="text-[11px] font-bold text-gray-400 uppercase">Job Title</Label>
                <Input
                  value={expFormData.job_title}
                  onChange={(e) => setExpFormData({ ...expFormData, job_title: e.target.value })}
                  placeholder="e.g. English Teacher"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-400 uppercase">Company Name</Label>
                <Input
                  value={expFormData.company_name}
                  onChange={(e) => setExpFormData({ ...expFormData, company_name: e.target.value })}
                  placeholder="e.g. School Name"
                  required
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-400 uppercase">Location</Label>
                <Input
                  value={expFormData.location}
                  onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
                  placeholder="City, State"
                  className="rounded-lg h-9 bg-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase">Start Date</Label>
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
                    <Label className="text-[11px] font-bold text-gray-400 uppercase">End Date</Label>
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
                  onClick={() => setExpFormData({...expFormData, is_current: !expFormData.is_current})}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                >
                  {expFormData.is_current ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                  I currently work here
                </button>
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-[11px] font-bold text-gray-400 uppercase">Description</Label>
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
          {expLoading && !experiences?.length ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary/30" /></div>
          ) : experiences?.length ? (
            experiences.map((exp) => (
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
                    </div>
                    {exp.description && <p className="text-xs text-gray-600 mt-2 italic whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button type="button" disabled={expLoading} onClick={() => handleExpEdit(exp)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button type="button" disabled={expLoading} onClick={() => handleExpDelete(exp.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          ) : !expError ? (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <p className="text-gray-400 text-sm font-medium italic">No work experience found.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
