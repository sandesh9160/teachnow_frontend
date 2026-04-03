import { useCallback, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

export type Testimonial = {
  id: number | string;
  name: string;
  designation: string;
  company: string;
  message: string;
  [key: string]: unknown;
};

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<any>("jobseeker/testimonials", { method: "GET" });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setTestimonials(data);
    } catch (err: any) {
      setTestimonials([]);
      setError(err?.message || "Failed to load testimonials");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTestimonial = useCallback(
    async (payload: Omit<Testimonial, "id">) => {
      try {
        setLoading(true);
        setError(null);
        await dashboardServerFetch<any>("jobseeker/testimonials", {
          method: "POST",
          data: payload,
        });
        await fetchTestimonials();
      } catch (err: any) {
        setError(err?.message || "Failed to create testimonial");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTestimonials]
  );

  const updateTestimonial = useCallback(
    async (id: number | string, payload: Partial<Omit<Testimonial, "id">>) => {
      try {
        setLoading(true);
        setError(null);
        await dashboardServerFetch<any>(`jobseeker/testimonials/${id}`, {
          method: "PUT",
          data: payload,
        });
        await fetchTestimonials();
      } catch (err: any) {
        setError(err?.message || "Failed to update testimonial");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTestimonials]
  );

  const deleteTestimonial = useCallback(
    async (id: number | string) => {
      try {
        setLoading(true);
        setError(null);
        await dashboardServerFetch<any>(`jobseeker/testimonials/${id}`, {
          method: "DELETE",
        });
        await fetchTestimonials();
      } catch (err: any) {
        setError(err?.message || "Failed to delete testimonial");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTestimonials]
  );

  return {
    testimonials,
    loading,
    error,
    fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  };
}
