import { useCallback, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

export type Testimonial = {
  id: number | string;
  name: string;
  designation: string;
  company: string;
  message: string;
  rating?: number;
  [key: string]: unknown;
};

/**
 * Flexible hook for managing testimonials across different user roles
 * @param role 'job_seeker' | 'employer' | 'recruiter'
 */
export function useTestimonials(role: string = "job_seeker") {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize recruiter to employer if the API expects 'employer' for recruiters too
  // Based on your provided endpoints, 'employer/testimonials' is likely shared or specific
  const endpointBase = role === 'job_seeker' 
    ? 'jobseeker/testimonials' 
    : role === 'recruiter' 
      ? 'recruiter/testimonials' 
      : 'employer/testimonials';

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<any>(`${endpointBase}?t=${Date.now()}`, { method: "GET" });
      
      // Attempt to find the array in common property names
      const data = Array.isArray(res?.data) 
        ? res.data 
        : Array.isArray(res?.testimonials) 
          ? res.testimonials 
          : Array.isArray(res) 
            ? res 
            : [];
            
      setTestimonials(data);
    } catch (err: any) {
      setTestimonials([]);
      setError(err?.message || "Failed to load testimonials");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpointBase]);

  const createTestimonial = useCallback(
    async (payload: Omit<Testimonial, "id">) => {
      try {
        setLoading(true);
        setError(null);
        await dashboardServerFetch<any>(endpointBase, {
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
    [endpointBase, fetchTestimonials]
  );

  const updateTestimonial = useCallback(
    async (id: number | string, payload: Partial<Omit<Testimonial, "id">>) => {
      try {
        setLoading(true);
        setError(null);
        await dashboardServerFetch<any>(`${endpointBase}/${id}`, {
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
    [endpointBase, fetchTestimonials]
  );

  const deleteTestimonial = useCallback(
    async (id: number | string) => {
      try {
        setLoading(true);
        setError(null);
        await dashboardServerFetch<any>(`${endpointBase}/${id}`, {
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
    [endpointBase, fetchTestimonials]
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
