import { useState, useCallback } from "react";
import { fetchAPI } from "@/services/api/client";

export function useTestimonials() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAPI<any>("jobseeker/testimonials");
      return res.data || res;
    } catch (err: any) {
      setError(err.message || "Failed to fetch testimonials");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTestimonial = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>("jobseeker/testimonials", {
        method: "POST",
        body: data,
      });
    } catch (err: any) {
      setError(err.message || "Failed to add testimonial");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTestimonial = async (id: number | string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`jobseeker/testimonials/${id}`, {
        method: "PUT",
        body: data,
      });
    } catch (err: any) {
      setError(err.message || "Failed to update testimonial");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (id: number | string) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`jobseeker/testimonials/${id}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete testimonial");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
}
