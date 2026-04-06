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
  Plus,
  X,
  User,
  Clock,
  MoreVertical
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { cn } from "@/lib/utils";

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
        alert("Recruiter account created!");
        setShowAddForm(false);
        // Refresh the list
        const updated = await dashboardServerFetch("employer/users");
        if (updated.status === true) setUsers(updated.data);
      } else {
        alert(res.message || "Failed to create recruiter.");
      }
    } catch (error) {
      alert("Error creating recruiter.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this recruiter?")) return;

    try {
      const res = await dashboardServerFetch(`employer/users/${id}`, {
        method: "DELETE",
      });

      if (res.status === true) {
        setUsers(users.filter(u => u.id !== id));
        alert("Recruiter deleted successfully.");
      } else {
        alert(res.message || "Failed to delete recruiter.");
      }
    } catch (error) {
      alert("Error deleting recruiter.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Premium Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm shadow-primary/5">
             <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none mb-1">Recruiter Management</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Delegate hiring tasks to your team.</p>
          </div>
        </div>

        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className={cn(
             "h-9 px-5 rounded-lg text-xs font-bold shadow-md shadow-primary/10 transition-all",
             showAddForm ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : ""
          )}
        >
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          {showAddForm ? "Close Form" : "Add Recruiter"}
        </Button>
      </div>

      {/* Add Recruiter Modal-styled Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-primary/20 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
           <div className="flex items-center gap-3 bg-primary/5 p-5 border-b border-primary/10">
              <Plus className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">New Recruiter Invitation</h2>
           </div>
           
           <form onSubmit={handleAddRecruiter} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Recruiter Name</Label>
                    <div className="relative group">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                       <Input name="name" placeholder="e.g. Kishore" className="h-10 pl-10 rounded-xl border-gray-100 text-sm font-semibold" required />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Work Email</Label>
                    <div className="relative group">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                       <Input name="email" type="email" placeholder="email@company.com" className="h-10 pl-10 rounded-xl border-gray-100 text-sm font-semibold" required />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Access Password</Label>
                    <div className="relative group">
                       <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                       <Input name="password" type="password" placeholder="••••••••" className="h-10 pl-10 rounded-xl border-gray-100 text-sm font-semibold" required />
                    </div>
                 </div>
              </div>

              <div className="mt-6 flex justify-end">
                 <Button type="submit" disabled={loading} className="h-10 px-10 rounded-lg text-xs font-bold tracking-widest min-w-[200px]">
                   {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                   Generate Recruiter Account
                 </Button>
              </div>
           </form>
        </div>
      )}

      {/* Recruiter List Hub */}
      <div className="space-y-4">
        {/* Filter Bar Filter */}
        <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-2">
           <div className="relative flex-1 w-full scale-[0.98]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Find recruiters by name or email..." 
                 className="h-8.5 pl-9 border-transparent bg-gray-50/50 focus:bg-white rounded-lg text-xs font-semibold" 
              />
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                   <tr className="bg-gray-50/5 border-b border-gray-50">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recruiter Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/10">
                   {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                     <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 shadow-inner">
                                 {u.name[0]}
                              </div>
                              <span className="text-sm font-bold text-gray-900 leading-none">{u.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-xs font-semibold text-gray-400">{u.email}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 font-bold">
                              <span className={cn(
                                 "w-1.5 h-1.5 rounded-full",
                                 u.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-gray-300"
                              )} />
                              <span className={cn(
                                 "text-[9px] uppercase tracking-wider",
                                 u.is_active ? "text-emerald-600" : "text-gray-400"
                              )}>
                                 {u.is_active ? "Active" : "Inactive"}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button 
                              onClick={() => handleDelete(u.id)}
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-3 rounded-lg text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 border border-transparent transition-all"
                           >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                           </Button>
                        </td>
                     </tr>
                   )) : (
                     <tr>
                        <td colSpan={4} className="px-6 py-20 text-center">
                           <div className="flex flex-col items-center gap-3">
                              <Users className="w-8 h-8 text-gray-100" />
                              <div className="space-y-0.5">
                                 <p className="text-xs font-bold text-gray-900 tracking-tight leading-none mb-1">No recruiters found</p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generate your first recruiter invitation above.</p>
                              </div>
                           </div>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}
