"use client";

import { useEffect, useState } from "react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { Loader2, MessageSquare, Plus, Trash2, Edit2, Quote } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { toast } from "sonner";

export default function TestimonialsPage() {
  const {
    testimonials,
    loading,
    error,
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
        toast.success("Testimonial updated!");
      } else {
        await createTestimonial(formData);
        toast.success("Testimonial added!");
      }
      setFormData({ name: "", designation: "", company: "", message: "" });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to save testimonial.");
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
    });
    setEditingId(testimonial.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      toast.success("Testimonial deleted.");
    } catch (error) {
      toast.error("Failed to delete testimonial.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">My Testimonials</h1>
          <p className="text-gray-500 mt-2">Manage the testimonials you have received or shared.</p>
        </div>
        
        <Button 
          variant="default" 
          onClick={() => { setShowForm(!showForm); if (!showForm) setEditingId(null); }}
        >
          {showForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Testimonial</>}
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/80 px-6 py-4 text-red-800 text-sm">
          <p className="font-medium">{error}</p>
        </div>
      ) : null}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold mb-6">{editingId ? "Edit Testimonial" : "New Testimonial"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Jane Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input 
                  id="designation" 
                  value={formData.designation} 
                  onChange={(e) => setFormData({...formData, designation: e.target.value})} 
                  placeholder="e.g. Principal"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company/Institution</Label>
              <Input 
                id="company" 
                value={formData.company} 
                onChange={(e) => setFormData({...formData, company: e.target.value})} 
                placeholder="e.g. Delhi Public School"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                placeholder="Write the testimonial message here..."
                required
              />
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "Update Testimonial" : "Save Testimonial"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : testimonials.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {testimonials.map((t) => (
              <div key={t.id} className="p-6 hover:bg-gray-50/50 transition relative group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Quote className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 italic mb-4">"{t.message}"</p>
                    <div>
                      <h4 className="font-bold text-gray-900">{t.name}</h4>
                      <p className="text-sm text-gray-500">{t.designation} at {t.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(t)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No testimonials yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">You haven't added any testimonials yet. Share your success stories with others!</p>
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Add your first testimonial
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
