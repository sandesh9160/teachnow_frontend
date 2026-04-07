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
  Clock
} from "lucide-react";
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
}

export default function RecruitersClient({ initialData }: RecruitersClientProps) {
  const [users, setUsers] = useState<Recruiter[]>(initialData?.data || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddRecruiter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

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
    if (!confirm("Are you sure?")) return;

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
      toast.error("Error occurs.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 pb-20 overflow-x-hidden">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Hiring Team</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">Access & Permission Management</p>
        </div>

        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          size="sm"
          className={cn(
             "h-9 px-5 rounded-xl text-[10px] font-bold transition-all shadow-sm uppercase",
             showAddForm ? "bg-slate-100 text-slate-500 hover:bg-slate-200 border shadow-none" : "shadow-primary/20"
          )}
        >
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          {showAddForm ? "Cancel" : "Add Team Member"}
        </Button>
      </div>

      {/* Add Recruiter Form (Responsive Card Style) */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-primary/20 shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
           <div className="flex items-center gap-2.5 bg-primary/5 p-4 border-b border-primary/10">
              <UserPlus className="w-4.5 h-4.5 text-primary" />
              <h2 className="text-[11px] font-bold text-gray-900 leading-none pt-0.5 uppercase tracking-tight">Generate Recruiter Credentials</h2>
           </div>
           
           <form onSubmit={handleAddRecruiter} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold text-gray-400 tracking-tight pl-0.5 uppercase">Full Name</Label>
                    <div className="relative group">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                       <Input name="name" placeholder="Name" className="h-10 pl-10 rounded-xl border-gray-200 text-xs font-bold focus:ring-1 focus:ring-primary/10" required />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold text-gray-400 tracking-tight pl-0.5 uppercase">Work Email</Label>
                    <div className="relative group">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                       <Input name="email" type="email" placeholder="email@institution.com" className="h-10 pl-10 rounded-xl border-gray-200 text-xs font-bold focus:ring-1 focus:ring-primary/10" required />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold text-gray-400 tracking-tight pl-0.5 uppercase">Initial Password</Label>
                    <div className="relative group">
                       <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                       <Input name="password" type="password" placeholder="Min 8 chars" className="h-10 pl-10 rounded-xl border-gray-200 text-xs font-bold focus:ring-1 focus:ring-primary/10" required />
                    </div>
                 </div>
              </div>

              <div className="flex justify-end pt-2">
                 <Button type="submit" disabled={loading} className="w-full sm:w-auto h-10 px-10 rounded-xl text-[10px] font-bold tracking-tight shadow-xl shadow-primary/20 uppercase transition-all hover:scale-[1.02]">
                   {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                   Provision Account
                 </Button>
              </div>
           </form>
        </div>
      )}

      {/* Control Bar Filter */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-2">
         <div className="relative flex-1 w-full scale-[0.98]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Filter team members..." 
               className="h-10 pl-10 border-transparent bg-gray-50/50 focus:bg-white rounded-xl text-[11px] font-bold focus:ring-1 focus:ring-primary/10" 
            />
         </div>
         <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100 shadow-sm">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-bold text-indigo-700 tracking-tight uppercase">{users.length} Active Members</span>
         </div>
      </div>

      {/* Recruiter Grid (Responsive) */}
      <div className="grid grid-cols-1 gap-3">
         {filteredUsers.length > 0 ? filteredUsers.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:border-primary/20 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-8 -mt-8 rounded-full" />
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
                  <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
                     <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-[15px] shadow-inner shrink-0 group-hover:scale-105 transition-transform group-hover:bg-indigo-100">
                        {u.name[0]}
                     </div>
                     <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                           <h3 className="text-sm font-bold text-gray-900 truncate tracking-tight uppercase">{u.name}</h3>
                           <div className="flex items-center gap-1.5 font-bold bg-white px-2 py-0.5 rounded-lg border border-gray-100 shadow-sm">
                              <span className={cn(
                                 "w-2 h-2 rounded-full",
                                 u.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-300"
                              )} />
                              <span className={cn(
                                 "text-[9px] font-bold uppercase tracking-tight",
                                 u.is_active ? "text-emerald-600" : "text-gray-400"
                              )}>
                                 {u.is_active ? "Operational" : "Inactive"}
                              </span>
                           </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 tracking-tight uppercase">
                           <Mail className="w-4 h-4 text-slate-300" /> 
                           <span className="truncate">{u.email}</span>
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                     <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 tracking-tight bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 transition-all group-hover:bg-white group-hover:shadow-sm whitespace-nowrap uppercase">
                        <Clock className="w-4 h-4 text-slate-300" /> Joined {new Date(u.created_at).getFullYear()}
                     </div>
                     <Button 
                        onClick={() => handleDelete(u.id)}
                        variant="ghost" 
                        size="sm"
                        className="h-9 px-4 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 shrink-0 border border-transparent hover:border-red-100"
                     >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[10px] font-bold tracking-tight sm:hidden uppercase">Remove</span>
                     </Button>
                  </div>
               </div>
            </div>
         )) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center gap-4">
               <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 shadow-inner">
                  <Users className="w-10 h-10" />
               </div>
               <div className="space-y-1">
                  <p className="text-base font-bold text-gray-900 tracking-tight uppercase">Isolated Command</p>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">Provision team accounts to delegate institution management.</p>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
