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
  User
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
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 pb-20 font-sans text-slate-700">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Hiring team</h1>
          <p className="text-xs font-medium text-slate-400">Access & permission management</p>
        </div>

        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          size="sm"
          className={cn(
             "h-10 w-full sm:w-auto px-5 rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center",
             showAddForm ? "bg-slate-100 text-slate-500 hover:bg-slate-200 border shadow-none" : "shadow-primary/20"
          )}
        >
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          {showAddForm ? "Cancel" : "Add team member"}
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
                       <Input name="name" placeholder="Name" className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium focus:ring-1 focus:ring-primary/10" required />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-400 ml-0.5">Work email</Label>
                    <div className="relative group">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                       <Input name="email" type="email" placeholder="email@institution.com" className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium focus:ring-1 focus:ring-primary/10" required />
                    </div>
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
                   Provision account
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
               placeholder="Filter team members..." 
               className="h-10 pl-10 border-transparent bg-slate-50/50 focus:bg-white rounded-xl text-xs font-medium focus:ring-1 focus:ring-primary/10" 
            />
         </div>
         <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-indigo-700 whitespace-nowrap">{users.length} members</span>
         </div>
      </div>

      {/* Team Table / Mobile List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
        {/* Desktop Header */}
        <div className="hidden sm:grid grid-cols-12 bg-slate-50/50 border-b border-slate-100 px-4 py-3">
          <div className="col-span-12 sm:col-span-6 md:col-span-5 text-xs font-semibold text-slate-500">Member details</div>
          <div className="hidden md:block col-span-5 text-xs font-semibold text-slate-500">Contact</div>
          <div className="col-span-12 sm:col-span-6 md:col-span-2 text-xs font-semibold text-slate-500 text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredUsers.length > 0 ? filteredUsers.map((u) => (
            <div key={u.id} className="grid grid-cols-12 items-center hover:bg-slate-50/20 transition-colors group px-4 py-4 sm:py-3 gap-y-3 sm:gap-y-0">
               {/* Left Side: Avatar + Info */}
               <div className="col-span-10 sm:col-span-6 md:col-span-5 min-w-0 pr-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-semibold text-indigo-600 text-sm shadow-inner shrink-0 group-hover:bg-indigo-100 transition-colors">
                      {u.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate tracking-tight">{u.name}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5 md:hidden break-all">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          u.is_active ? "bg-emerald-500 shadow-sm" : "bg-slate-300"
                        )} />
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                          {u.is_active ? "Active account" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
               </div>

               {/* Right Side: Action (On top in mobile) */}
               <div className="col-span-2 sm:col-span-6 md:col-span-2 order-2 sm:order-last flex justify-end items-center">
                  <Button 
                    onClick={() => handleDelete(u.id)}
                    variant="ghost" 
                    size="sm"
                    className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl text-red-500 hover:bg-red-50 transition-all p-0 border border-transparent hover:border-red-100 active:scale-95 inline-flex items-center justify-center shrink-0"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </Button>
               </div>

               {/* Middle: Contact (Desktop only mostly) */}
               <div className="hidden md:block col-span-5 pr-2">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    {u.email}
                  </p>
               </div>
            </div>
          )) : (
            <div className="py-20 text-center px-6">
              <div className="flex flex-col items-center justify-center gap-3">
                <Users className="w-12 h-12 text-slate-100" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">No recruiters found</p>
                  <p className="text-xs text-slate-400 font-medium">Add team members to delegate work.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
