"use client";

import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Key, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Search,
  X,
  User,
  Eye
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
  is_active: number;
}

interface RecruitersClientProps {
  initialData?: {
    status: boolean;
    total_users: number;
    data: Recruiter[];
  };
  isProfileComplete?: boolean;
}

export default function RecruitersClient({ initialData, isProfileComplete = true }: RecruitersClientProps) {
  const [users, setUsers] = useState<Recruiter[]>(initialData?.data || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [togglingId, setTogglingId] = useState<number | null>(null);

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
        const updated = await dashboardServerFetch("employer/users");
        if (updated.status === true) setUsers(updated.data);
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
            const res = await dashboardServerFetch(`employer/users/${id}`, {
              method: "DELETE",
            });

            if (res.status === true) {
              toast.success("Recruiter removed");
              setUsers(users.filter(u => u.id !== id));
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
        onClick: () => {}
      },
      // sonner specific classes for button colors
      actionButtonStyle: { backgroundColor: '#ef4444', color: '#fff' },
      cancelButtonStyle: { backgroundColor: '#3b82f6', color: '#fff' }
    });
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    setTogglingId(id);
    // Toggle logic: 1 is active (enable), 0 is inactive (disable).
    const nextStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      const res = await dashboardServerFetch(`employer/recruiter/${id}/toggle`, {
        method: "PATCH",
        data: { is_active: nextStatus },
      });

      if (res.status === true) {
        toast.success(res.message || `Recruiter ${nextStatus === 1 ? 'activated' : 'deactivated'}`);
        setUsers(users.map(u => u.id === id ? { ...u, is_active: nextStatus } : u));
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
    } finally {
      setTogglingId(null);
    }
  };



  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 pb-20 font-sans text-slate-700">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Recruiters</h1>
          <p className="text-xs font-medium text-slate-400">Manage recruiter access and permissions</p>
        </div>

        <Button 
          onClick={() => {
            if (!isProfileComplete) {
              toast("Finish Your Profile", {
                id: "recruiters-profile-warning",
                description: "You need to finish your profile before you can add team members.",
                style: {
                  background: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  color: '#92400E',
                },
                action: {
                  label: "Finish Now",
                  onClick: () => window.location.href = "/dashboard/employer/company-profile"
                },
                actionButtonStyle: {
                  backgroundColor: '#2563EB',
                  color: '#fff',
                }
              });
              return;
            }
            setShowAddForm(!showAddForm);
          }} 
          size="sm"
          className={cn(
             "h-10 w-full sm:w-auto px-5 rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center",
             showAddForm ? "bg-slate-100 text-slate-500 hover:bg-slate-200 border shadow-none" : "shadow-primary/20"
          )}
        >
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          {showAddForm ? "Cancel" : "Add recruiter"}
        </Button>
      </div>

      {!isProfileComplete && (
        <div className="p-4 bg-[#FFFBEB] rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#F59E0B] shrink-0 shadow-sm">
               <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-[#92400E]">Finish Your Profile</h3>
              <p className="text-[11px] text-[#92400E]/80 font-medium">
                You need to finish your profile before you can add team members.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = "/dashboard/employer/company-profile"}
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold px-5 h-8 rounded-lg whitespace-nowrap shadow-sm"
          >
            Finish Now
          </Button>
        </div>
      )}

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
            <span className="text-xs font-medium text-indigo-700 whitespace-nowrap">{users.length} recruiters</span>
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
                      className={cn(
                        "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50",
                        u.is_active === 1 ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          u.is_active === 1 ? "translate-x-3.5" : "translate-x-0"
                        )}
                      />
                    </button>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-tight",
                      u.is_active === 1 ? "text-emerald-600" : "text-slate-400"
                    )}>
                      {togglingId === u.id ? "Updating..." : (u.is_active === 1 ? "Active" : "Inactive")}
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
    </div>
  );
}
