"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { useEducation } from "@/hooks/useEducation";
import type { EducationPayload, EducationRecord } from "@/types/education";
import { Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, Trash2, Edit2 } from "lucide-react";
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

export default function ProfilePage() {
  const { user, fetchProfile: refreshAuthProfile } = useAuth();
  const { getProfile, updateProfile } = useProfile();
  const {
    data: education,
    loading: eduLoading,
    error: eduError,
    fetch: refetchEducation,
    createEducation,
    updateEducation,
    deleteEducation,
  } = useEducation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [editingEduId, setEditingEduId] = useState<number | string | null>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    title: "",
    bio: "",
  });

  const [eduFormData, setEduFormData] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await getProfile();
        // data.data could be used if API returns { data: {...} }
        const profile = data?.data || data || {};
        setProfileData({
          name: profile.name || user?.name || "",
          email: profile.email || user?.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          title: profile.title || "",
          bio: profile.bio || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [getProfile, user]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(profileData);
      await refreshAuthProfile();
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">My Profile</h1>
        <p className="text-gray-500 mt-2">Update your personal information and professional details.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-gray-100 flex items-center gap-6">
          <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-md">
            {profileData.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profileData.name || "Add your name"}</h2>
            <p className="text-gray-500 font-medium">{profileData.title || "Add your professional title"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <Input 
                  id="name" 
                  name="name" 
                  value={profileData.name} 
                  onChange={handleChange} 
                  required 
                  className="pl-10"
                  suppressHydrationWarning
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={profileData.email} 
                  onChange={handleChange} 
                  required 
                  disabled
                  className="pl-10 bg-gray-50 text-gray-500 cursor-not-allowed"
                  suppressHydrationWarning
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Input 
                  id="phone" 
                  name="phone" 
                  value={profileData.phone} 
                  onChange={handleChange} 
                  className="pl-10"
                  placeholder="+1 (555) 000-0000"
                  suppressHydrationWarning
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Location</Label>
              <div className="relative">
                <Input 
                  id="address" 
                  name="address" 
                  value={profileData.address} 
                  onChange={handleChange} 
                  className="pl-10"
                  placeholder="City, State, Country"
                  suppressHydrationWarning
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Professional Title</Label>
              <div className="relative">
                <Input 
                  id="title" 
                  name="title" 
                  value={profileData.title} 
                  onChange={handleChange} 
                  className="pl-10"
                  placeholder="e.g. Senior Software Engineer"
                  suppressHydrationWarning
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Professional Summary</Label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
                placeholder="Write a short summary about your professional background and goals."
                suppressHydrationWarning
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="default" size="lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
      {/* Education Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">Education</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={eduLoading}
            onClick={() => { setShowEduForm(!showEduForm); if (!showEduForm) setEditingEduId(null); }}
          >
            {showEduForm ? "Cancel" : <><Plus className="w-4 h-4 mr-1" /> Add Education</>}
          </Button>
        </div>

        {eduError ? (
          <div className="p-6 border-b border-gray-100 bg-amber-50/80 text-amber-900 text-sm">
            <p>{eduError}</p>
            <button
              type="button"
              onClick={() => void refetchEducation()}
              className="mt-2 font-semibold text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : null}

        {showEduForm && (
          <form onSubmit={handleEduSubmit} className="p-6 border-b border-gray-100 bg-gray-50/30 space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input 
                  value={eduFormData.institution} 
                  onChange={(e) => setEduFormData({...eduFormData, institution: e.target.value})} 
                  placeholder="University Name" 
                  required 
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input 
                  value={eduFormData.degree} 
                  onChange={(e) => setEduFormData({...eduFormData, degree: e.target.value})} 
                  placeholder="Bachelor's, Master's, etc." 
                  required 
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input 
                  value={eduFormData.field_of_study} 
                  onChange={(e) => setEduFormData({...eduFormData, field_of_study: e.target.value})} 
                  placeholder="Computer Science" 
                  required 
                  suppressHydrationWarning
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={eduFormData.start_date} 
                    onChange={(e) => setEduFormData({...eduFormData, start_date: e.target.value})} 
                    required 
                    suppressHydrationWarning
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    value={eduFormData.end_date} 
                    onChange={(e) => setEduFormData({...eduFormData, end_date: e.target.value})} 
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving || eduLoading}>
                {(saving || eduLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingEduId ? "Update Education" : "Save Education"}
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y divide-gray-100">
          {eduLoading && !education?.length ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : education?.length ? (
            education.map((edu) => (
              <div key={edu.id} className="p-6 flex justify-between items-start group hover:bg-gray-50/50 transition">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{(edu.degree ?? "—")} in {(edu.field_of_study ?? "—")}</h4>
                    <p className="text-gray-600 font-medium">{edu.institution ?? "—"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(edu.start_year ?? edu.start_date) ?? "—"} — {(edu.end_year ?? edu.end_date) || "Present"}
                      {edu.grade ? ` · ${edu.grade}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" disabled={eduLoading} onClick={() => handleEduEdit(edu)} className="p-2 text-gray-400 hover:text-primary rounded-lg transition disabled:opacity-50"><Edit2 className="w-4 h-4" /></button>
                  <button type="button" disabled={eduLoading} onClick={() => handleEduDelete(edu.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          ) : !eduError ? (
            <div className="p-8 text-center text-gray-500 italic">
              No education history added yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
