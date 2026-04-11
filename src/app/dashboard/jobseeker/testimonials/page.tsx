"use client";

import { useEffect, useState } from "react";
import { useTestimonials } from "@/hooks/useTestimonials";
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

export default function TestimonialsPage() {
  const {
    testimonials,
    loading,
    fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  } = useTestimonials();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await updateTestimonial(editingId, formData);
        toast.success("Updated!");
      } else {
        await createTestimonial(formData);
        toast.success("Added to profile!");
      }
      setFormData({ name: "", designation: "", company: "", message: "", rating: 5 });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to save recommendation.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (testimonial: any) => {
    setFormData({
      name: testimonial.name || "",
      designation: testimonial.designation || "",
      company: testimonial.company || "",
      message: testimonial.message || "",
      rating: testimonial.rating || 5,
    });
    setEditingId(testimonial.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number | string) => {
    toast("Remove this entry?", {
      action: {
        label: "Remove",
        onClick: async () => {
          try {
            await deleteTestimonial(id);
            toast.success("Removed.");
          } catch (error) {
            toast.error("Failed to delete.");
          }
        },
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
             Testimonials
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-0.5">Total entries: {testimonials.length}</p>
        </div>
        
        <Button 
          variant={showForm ? "outline" : "default"} 
          onClick={() => { setShowForm(!showForm); if (!showForm) setEditingId(null); }}
          className="rounded-xl font-bold h-9 px-5 active:scale-95 transition-all text-xs"
        >
          {showForm ? <><X className="w-3.5 h-3.5 mr-1.5" /> Cancel Build</> : <><Plus className="w-3.5 h-3.5 mr-1.5" /> Record Recognition</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-primary" />
            {editingId ? "Edit Entry" : "New Testimony"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-900 font-extrabold text-[10px] uppercase tracking-widest pl-0.5">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Ramesh Kumar"
                  className="rounded-lg border-slate-200 focus:border-primary transition-all h-10 text-sm font-medium"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="designation" className="text-slate-900 font-extrabold text-[10px] uppercase tracking-widest pl-0.5">Designation</Label>
                <Input 
                  id="designation" 
                  value={formData.designation} 
                  onChange={(e) => setFormData({...formData, designation: e.target.value})} 
                  placeholder="e.g. Principal"
                  className="rounded-lg border-slate-200 focus:border-primary transition-all h-10 text-sm font-medium"
                  required
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
                    className="focus:outline-none"
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
              <Label htmlFor="message" className="text-slate-900 font-extrabold text-[10px] uppercase tracking-widest pl-0.5">Testimony</Label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={3}
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-primary transition-all shadow-none"
                placeholder="What did they say?..."
                required
              />
            </div>
            
            <div className="pt-2 flex justify-end gap-3">
              <Button type="submit" disabled={saving} className="rounded font-bold h-9 px-6 text-xs active:scale-95 transition-all text-white">
                {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                {editingId ? "Update Now" : "Save Recognition"}
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
            <div key={t.id} className="flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:border-indigo-200 group relative transition-all duration-300">
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
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50/50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                 </div>
               </div>

              <div className="p-3.5 flex-1 flex flex-col space-y-3">
                 <div className="flex-1 italic text-slate-600 text-[12px] leading-relaxed font-medium line-clamp-3">
                   "{t.message}"
                 </div>

                 <div className="pt-2.5 border-t border-slate-50">
                    <h4 className="font-bold text-slate-900 text-[13px] truncate">{t.name}</h4>
                    <p className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5 whitespace-nowrap overflow-hidden tracking-tight uppercase">
                       <UserCheck className="w-2.5 h-2.5" />
                       <span className="truncate">{t.designation}</span>
                    </p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-slate-200 p-16 text-center">
           <Award className="w-10 h-10 text-slate-100 mx-auto mb-4" />
           <p className="text-slate-400 font-bold text-xs">No records found.</p>
           <Button onClick={() => setShowForm(true)} className="mt-6 rounded h-9 px-6 font-bold text-xs text-white">Add First</Button>
        </div>
      )}
    </div>
  );
}
