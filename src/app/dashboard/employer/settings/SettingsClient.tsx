"use client";

import { useState } from "react";
import { 
  Settings, 
  Bell, 
  Mail, 
  Phone, 
  Trash2, 
  ShieldAlert, 
  Save, 
  CheckCircle2,
  Info
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
  <button 
    onClick={onToggle}
    className={cn(
      "relative w-10 h-5.5 rounded-full transition-colors duration-300 focus:outline-none flex items-center px-1",
      active ? "bg-primary" : "bg-gray-200"
    )}
  >
    <div className={cn(
      "w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300",
      active ? "translate-x-4" : "translate-x-0"
    )} />
  </button>
);

export default function SettingsClient() {
  const [loading, setLoading] = useState(false);
  
  // Notification States
  const [notifications, setNotifications] = useState({
    applicants: true,
    analytics: true,
    marketing: false
  });

  // Account States
  const [account, setAccount] = useState({
    email: "hr@ncollege.edu.in",
    phone: "+91 98765 43210"
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Notification preferences updated!");
    }, 1000);
  };

  const handleUpdateAccount = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Account details updated!");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 pb-20 overflow-x-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
          <p className="text-[11px] text-slate-400">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
           <Settings className="w-3.5 h-3.5 text-slate-400" />
           <span className="text-[10px] font-medium text-slate-500">Global Preferences</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
           <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                    <Bell className="w-4 h-4" />
                 </div>
                 <h2 className="text-xs font-semibold text-slate-900 pt-0.5">Notification Preferences</h2>
              </div>
              <Info className="w-4 h-4 text-gray-300" />
           </div>
           
           <div className="p-6 space-y-6">
              <div className="space-y-5">
                 {[
                   { id: 'applicants', title: "New applicant notifications", desc: "Get notified when someone applies to your job", active: notifications.applicants },
                   { id: 'analytics', title: "Weekly analytics report", desc: "Receive a weekly summary of your job post performance", active: notifications.analytics },
                   { id: 'marketing', title: "Marketing emails", desc: "Tips and product updates from TeachNow", active: notifications.marketing },
                 ].map((item) => (
                   <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                         <h4 className="text-[13px] font-bold text-gray-800 leading-none">{item.title}</h4>
                         <p className="text-[11px] text-gray-400 font-medium leading-tight">{item.desc}</p>
                      </div>
                      <Toggle active={item.active} onToggle={() => handleToggle(item.id as any)} />
                   </div>
                 ))}
              </div>

              <div className="pt-4 border-t border-gray-50">
                 <Button 
                   onClick={handleSavePreferences}
                   disabled={loading}
                   className="h-9 px-8 rounded-lg text-[11px] font-medium shadow-sm flex items-center gap-2"
                 >
                    {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Preferences
                 </Button>
              </div>
           </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-700">
           <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                    <CheckCircle2 className="w-4 h-4" />
                 </div>
                 <h2 className="text-xs font-semibold text-slate-900 pt-0.5">Account Details</h2>
              </div>
           </div>
           
           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-medium text-slate-400 pl-0.5">Primary Contact Email</Label>
                 <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                    <Input 
                      value={account.email} 
                      onChange={(e) => setAccount(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="hr@institution.com" 
                      className="h-10 pl-10 rounded-xl border-slate-100 text-xs font-medium focus:ring-1 focus:ring-primary/10 transition-all" 
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <Label className="text-[10px] font-medium text-slate-400 pl-0.5">Phone Number</Label>
                 <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                    <Input 
                      value={account.phone} 
                      onChange={(e) => setAccount(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 00000 00000" 
                      className="h-10 pl-10 rounded-xl border-slate-100 text-xs font-medium focus:ring-1 focus:ring-primary/10 transition-all" 
                    />
                 </div>
              </div>

              <div className="md:col-span-2 pt-2 border-t border-slate-50">
                 <Button 
                   onClick={handleUpdateAccount}
                   disabled={loading}
                   className="w-full sm:w-auto h-9 px-10 rounded-lg text-[11px] font-medium shadow-sm flex items-center justify-center gap-2"
                 >
                    {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    Update Account
                 </Button>
              </div>
           </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-50/50 rounded-2xl border border-rose-100 overflow-hidden">
           <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                 <h3 className="text-sm font-semibold text-rose-600">Danger Zone</h3>
                 <p className="text-[11px] text-rose-500/70 font-medium leading-tight max-w-md">
                    Permanently delete your employer account and all associated data. This action is irreversible once confirmed.
                 </p>
              </div>
              <Button 
                 variant="destructive" 
                 size="sm" 
                 className="h-9 px-6 rounded-lg text-[11px] font-medium shadow-sm shrink-0"
                 onClick={() => {
                   toast("Are you absolutely sure?", {
                     description: "This will permanently delete your employer account.",
                     action: {
                       label: "Terminate",
                       onClick: () => toast.error("Account termination requires administrative approval.")
                     }
                   })
                 }}
              >
                 <Trash2 className="w-3.5 h-3.5 mr-2" />
                 Terminate Account
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
