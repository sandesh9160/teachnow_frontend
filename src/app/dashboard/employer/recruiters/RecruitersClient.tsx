"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Mail,
  Key,
  Trash2,
  Loader2,
  ShieldCheck,
  Search,
  AlertCircle,
  X,
  User,
  Eye,
  Pencil
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Recruiter {
  id: number;
  name: string;
  email: string;
  created_at: string;
  is_active: number | string | boolean;
}

interface RecruitersClientProps {
  initialData?: {
    status: boolean;
    total_users: number;
    data: Recruiter[];
  };
  isProfileComplete?: boolean;
}

export default function RecruitersClient({
  initialData,
  isProfileComplete = true
}: RecruitersClientProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Edit Recruiter Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Profile verification status (0 = pending, 1 = approved, 2 = rejected)
  const [verificationStatus, setVerificationStatus] = useState<number | null>(null);

  // Fetch profile verification status
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await dashboardServerFetch('employer/profile');
        if (res.status && res.data) {
           const emp = res.data.employer || res.data;
           const val = emp.is_profile_verified !== undefined ? Number(emp.is_profile_verified) : 0;
           setVerificationStatus(val);
        }
      } catch (e) {
        console.error('Error fetching profile verification', e);
      }
    };
    fetchProfile();
  }, []);


  const handleOpenEditModal = (recruiter: Recruiter) => {
    setEditingRecruiter(recruiter);
    setEditName(recruiter.name);
    setEditEmail(recruiter.email);
    setEditPassword("");
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditRecruiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecruiter) return;
    setEditLoading(true);
    setEditErrors({});

    const newErrors: Record<string, string> = {};
    if (!editName.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!editEmail.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(editEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      toast.error(Object.values(newErrors)[0]);
      setEditLoading(false);
      return;
    }

    const payload: any = {
      name: editName.trim(),
      email: editEmail.trim(),
    };
    if (editPassword) {
      payload.password = editPassword;
    }

    try {
      const res = await dashboardServerFetch(
        `employer/recruiter/${editingRecruiter.id}/update`,
        {
          method: "POST",
          data: payload,
        }
      );

      if (res.status === true) {
        toast.success("Recruiter details updated successfully!");
        setShowEditModal(false);
        setEditingRecruiter(null);
        setEditPassword("");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update recruiter.");
      }
    } catch (error) {
      toast.error("Error occurred while updating recruiter.");
    } finally {
      setEditLoading(false);
    }
  };

  const isRecruiterActive = (status: any) => status === 1 || status === true || status === "1";

  const handleAddRecruiter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));

    const newErrors: Record<string, string> = {};
    if (!name) {
      newErrors.name = "Full name is required";
    } else if (name.length < 3) {
      newErrors.name = "Full name must be at least 3 characters";
    } else if (name.length > 100) {
      newErrors.name = "Full name cannot exceed 100 characters";
    }

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      setLoading(false);
      return;
    }

    setErrors({});

    const data = { name, email, password };

    try {
      const res = await dashboardServerFetch("employer/users", {
        method: "POST",
        data,
      });



      if (res.status === true) {
        toast.success("Recruiter account created!");
        setShowAddForm(false);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to create recruiter.");
      }
    } catch (error) {
      toast.error("Error creating recruiter.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    toast("Remove this recruiter?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await dashboardServerFetch(
              `employer/users/${id}`,
              { method: "DELETE" }
            );



            if (res.status === true) {
              toast.success("Recruiter removed");
              router.refresh();
            } else {
              toast.error(res.message || "Failed to delete.");
            }
          } catch (error) {
            toast.error("Error occurred while deleting.");
          }
        },
      },
      cancel: {
        label: "Keep It",
        onClick: () => {},
      },
      actionButtonStyle: { backgroundColor: "#ef4444", color: "#fff" },
      cancelButtonStyle: { backgroundColor: "#3b82f6", color: "#fff" },
    });
  };

  const handleToggleStatus = async (
    id: number,
    currentStatus: any
  ) => {
    setTogglingId(id);

    const isActive = isRecruiterActive(currentStatus);
    const nextStatus = isActive ? 0 : 1;

    try {
      const res = await dashboardServerFetch(
        `employer/recruiter/${id}/toggle`,
        {
          method: "PATCH",
          data: { is_active: nextStatus }
        }
      );

      if (res.status === true) {
        toast.success(
          nextStatus === 1
            ? "Recruiter enabled successfully"
            : "Recruiter disabled successfully"
        );
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = (initialData?.data || []).filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 pb-20 font-sans text-slate-700">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Recruiters</h1>
            {verificationStatus === 1 && (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-100 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
              </div>
            )}
            {verificationStatus === 0 && (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-amber-100 shadow-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Verification Pending
              </div>
            )}
            {verificationStatus === 2 && (
              <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-rose-100 shadow-xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Verification Rejected
              </div>
            )}
          </div>
          <p className="text-xs font-medium text-slate-400">Manage recruiter access and permissions</p>
        </div>
        {verificationStatus === 0 && (
          <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
            <p className="text-[13px] font-semibold text-amber-700">Your profile verification is pending. You will be able to add recruiters once approved.</p>
          </div>
        )}

        {verificationStatus === 2 && (
          <div className="flex items-center gap-3 px-5 py-4 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-[13px] font-semibold text-rose-700">Your profile verification was rejected. Please contact support or update your profile to add recruiters.</p>
          </div>
        )}

        {verificationStatus === 1 && !isProfileComplete && (
          <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[13px] font-semibold text-amber-700">Your profile is incomplete. Please complete your profile details.</p>
          </div>
        )}

        <Button
          onClick={() => {
            if (verificationStatus !== 1) {
              return;
            }
            setShowAddForm(!showAddForm);
          }}
          disabled={verificationStatus !== 1}
          size="sm"
          className={cn(
            "h-10 w-full sm:w-auto px-5 rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center",
            showAddForm ? "bg-slate-100 text-slate-500 hover:bg-slate-200 border shadow-none" : "shadow-primary/20",
            verificationStatus !== 1 && "opacity-50 cursor-not-allowed"
          )}
        >
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          {showAddForm ? "Cancel" : "Add recruiter"}
        </Button>
      </div>

      {/* Add Recruiter Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-primary/20 shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5 bg-primary/5 p-4 border-b border-primary/10">
            <UserPlus className="w-4.5 h-4.5 text-primary" />
            <h2 className="text-xs font-semibold text-slate-900 leading-none">Generate recruiter credentials</h2>
          </div>

          <form onSubmit={handleAddRecruiter} className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400 ml-0.5">Full name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    name="name"
                    placeholder="Name"
                    className={cn(
                      "h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium transition-all",
                      errors.name ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" : "focus:ring-1 focus:ring-primary/10"
                    )}
                    required
                  />
                </div>
                {errors.name && <p className="mt-1 text-[10px] font-bold text-red-500 ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400 ml-0.5">Work email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="email@institution.com"
                    className={cn(
                      "h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium transition-all",
                      errors.email ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" : "focus:ring-1 focus:ring-primary/10"
                    )}
                    required
                  />
                </div>
                {errors.email && <p className="mt-1 text-[10px] font-bold text-red-500 ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400 ml-0.5">Initial password</Label>
                <div className="relative group">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input name="password" type="password" placeholder="Min 8 chars" className="h-11 pl-10 rounded-xl border-gray-200 text-sm font-medium focus:ring-1 focus:ring-primary/10" required />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto h-11 px-10 rounded-xl text-xs font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter recruiters..."
            className="h-10 pl-10 border-transparent bg-slate-50/50 focus:bg-white rounded-xl text-xs font-medium focus:ring-1 focus:ring-primary/10"
          />
        </div>
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <Users className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-medium text-indigo-700 whitespace-nowrap">{filteredUsers.length} recruiters</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="hidden sm:flex items-center bg-slate-50/50 border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
          <div className="flex-1">Recruiter details</div>
          <div className="w-32 text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredUsers.length > 0 ? filteredUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/30 transition-colors group">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-semibold text-indigo-600 text-sm shadow-inner shrink-0 group-hover:bg-indigo-100 transition-colors">
                {u.name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                <div className="flex items-center gap-2.5 mt-1">
                  <button
                    onClick={() => handleToggleStatus(u.id, u.is_active)}
                    disabled={togglingId === u.id}
                    suppressHydrationWarning={true}
                    className={cn(
                      "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50",
                      isRecruiterActive(u.is_active) ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        isRecruiterActive(u.is_active) ? "translate-x-3.5" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-tight",
                    isRecruiterActive(u.is_active) ? "text-emerald-600" : "text-slate-400"
                  )}>
                    {togglingId === u.id ? "Updating..." : (isRecruiterActive(u.is_active) ? "Active" : "Inactive")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Link href={`/dashboard/employer/recruiters/${u.id}`}>
                  <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all p-0 border border-transparent hover:border-indigo-100 active:scale-95 inline-flex items-center justify-center" title="View">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  onClick={() => handleOpenEditModal(u)}
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 rounded-xl text-amber-500 hover:bg-amber-50 transition-all p-0 border border-transparent hover:border-amber-100 active:scale-95 inline-flex items-center justify-center" 
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleDelete(u.id)} variant="ghost" size="sm" className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 transition-all p-0 border border-transparent hover:border-red-100 active:scale-95 inline-flex items-center justify-center" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center px-6">
              <div className="flex flex-col items-center justify-center gap-3">
                <Users className="w-12 h-12 text-slate-100" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">No recruiters found</p>
                  <p className="text-xs text-slate-400 font-medium">Add recruiters to delegate job postings.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Recruiter Modal */}
      {showEditModal && editingRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-primary/10 shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between bg-primary/5 p-4 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-900 leading-none">Edit Recruiter Details</h3>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditRecruiter} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400 ml-0.5">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className={cn(
                      "h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium transition-all focus:ring-1 focus:ring-primary/10",
                      editErrors.name ? "border-red-500 bg-red-50/50 focus:ring-red-500/20" : ""
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400 ml-0.5">Work Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="email@institution.com"
                    className={cn(
                      "h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium transition-all focus:ring-1 focus:ring-primary/10",
                      editErrors.email ? "border-red-500 bg-red-50/50 focus:ring-red-500/20" : ""
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-400 ml-0.5">New Password (optional)</Label>
                <div className="relative group">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium transition-all focus:ring-1 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-50 mt-5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowEditModal(false)}
                  className="h-10 px-5 rounded-xl text-xs font-medium hover:bg-slate-100 text-slate-500"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editLoading}
                  className="h-10 px-8 rounded-xl text-xs font-semibold shadow-md shadow-primary/20 hover:scale-[1.01]"
                >
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
