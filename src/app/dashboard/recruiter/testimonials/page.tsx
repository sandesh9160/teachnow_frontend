"use client";

import { useEffect, useState } from "react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useClientSession } from "@/hooks/useClientSession";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Edit2, 
  X,
  UserCheck,
  Award,
  Star
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RecruiterTestimonialsPage() {
  const {
    testimonials,
    loading,
    fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  } = useTestimonials("recruiter");

  const { user } = useClientSession();

  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    company: "",
    message: "",
    rating: 5,
  });

  useEffect(() => {
    void fetchTestimonials();
  }, [fetchTestimonials]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        designation: user.role === 'recruiter' ? 'Recruiter' : (user.role === 'employer' ? 'Employer' : 'Member')
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await updateTestimonial(editingId, formData);
        toast.success("Success: Testimonial updated!");
      } else {
        await createTestimonial(formData);
        toast.success("Success: Thank you for your testimonial!");
      }
      setFormData({ 
        name: user?.name || "", 
        designation: user?.role === 'recruiter' ? 'Recruiter' : (user?.role === 'employer' ? 'Employer' : 'Member'), 
        company: "", 
        message: "", 
        rating: 5 
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      toast.error("Failed: Could not save your experience.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (testimonial: any) => {
    setFormData({
      name: user?.name || testimonial.name || "",
      designation: user?.role === 'recruiter' ? 'Recruiter' : (user?.role === 'employer' ? 'Employer' : 'Member'),
      company: testimonial.company || "",
      message: testimonial.message || "",
      rating: testimonial.rating || 5,
    });
    setEditingId(testimonial.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number | string) => {
    toast.info("Remove this testimonial?", {
      action: {
        label: "Remove",
        onClick: async () => {
          try {
            await deleteTestimonial(id);
            toast.error("Success: Deleted.");
          } catch (error) {
            toast.error("Failed: Could not delete.");
          }
        },
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
             My Testimonials
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Share your recruitment story</p>
        </div>
        
        <Button 
          variant={showForm ? "outline" : "default"} 
          onClick={() => { setShowForm(!showForm); if (!showForm) setEditingId(null); }}
          className="rounded font-bold h-10 sm:h-9 px-5 active:scale-95 transition-all text-xs w-full sm:w-auto shadow-sm"
        >
          {showForm ? <><X className="w-3.5 h-3.5 mr-1.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5 mr-1.5" /> Share Experience</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-primary" />
            {editingId ? "Update Testimonial" : "Submit Testimonial"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-900 font-extrabold text-[10px] uppercase tracking-widest pl-0.5">Author Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  readOnly
                  placeholder="Your full name"
                  className="rounded-lg border-slate-200 bg-slate-50 cursor-not-allowed focus:border-primary transition-all h-10 text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="designation" className="text-slate-900 font-extrabold text-[10px] uppercase tracking-widest pl-0.5">Your Role</Label>
                <Input 
                  id="designation" 
                  value={formData.designation} 
                  readOnly
                  placeholder="e.g. Recruiter"
                  className="rounded-lg border-slate-200 bg-slate-50 cursor-not-allowed focus:border-primary transition-all h-10 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-900 font-extrabold text-[10px] uppercase tracking-widest pl-0.5">Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="group focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 transition-all duration-200",
                        formData.rating >= star 
                          ? "text-amber-400 fill-amber-400 scale-110" 
                          : "text-slate-200 hover:text-amber-200"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-end pr-1">
                <Label htmlFor="message" className="text-slate-900 font-extrabold text-[10px] uppercase tracking-widest pl-0.5">Testimonial Message</Label>
                <span className={cn(
                  "text-[10px] font-bold tracking-tight",
                  formData.message.length >= 200 ? "text-rose-500" : "text-slate-400"
                )}>
                  {formData.message.length}/200
                </span>
              </div>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={3}
                maxLength={200}
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-primary transition-all shadow-none"
                placeholder="How has TeachNow helped your recruiting efforts?..."
                required
              />
            </div>
            
            <div className="pt-2 flex justify-end gap-3">
              <Button type="submit" disabled={saving} className="rounded font-bold h-9 px-6 text-xs active:scale-95 transition-all text-white">
                {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                {editingId ? "Save Changes" : "Post Testimonial"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-10" />
        </div>
      ) : testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {testimonials.map((t) => (
            <div key={t.id} className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-primary/20 group relative transition-all duration-300">
               <div className="px-3 py-2 flex items-center justify-between border-b border-slate-50 bg-slate-50/20">
                 <div className="flex gap-0.5">
                   {Array.from({ length: 5 }).map((_, i) => (
                     <Star 
                       key={i} 
                       className={cn(
                         "w-3 h-3",
                         i < (t.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-100 fill-transparent"
                       )}
                     />
                   ))}
                 </div>
                 
                 <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => handleEdit(t)}
                      className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                 </div>
               </div>

              <div className="p-4 flex-1 flex flex-col space-y-3">
                 <div className="flex-1 italic text-slate-600 text-[13px] leading-relaxed font-medium">
                   "{t.message}"
                 </div>

                 <div className="pt-3 border-t border-slate-50">
                    <h4 className="font-bold text-slate-900 text-[13px] truncate">{t.name}</h4>
                    <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                       <UserCheck className="w-2.5 h-2.5" />
                       <span className="truncate">{t.designation}</span>
                    </p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-20 text-center">
           <Award className="w-12 h-12 text-slate-100 mx-auto mb-4" />
           <p className="text-slate-400 font-bold text-sm">No testimonials yet.</p>
           <Button onClick={() => setShowForm(true)} className="mt-8 rounded h-10 px-8 font-bold text-xs text-white">Share Your Story</Button>
        </div>
      )}
    </div>
  );
}
