import { useState } from "react";
import { fetchAPI } from "@/services/api/client";

export function useEducation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEducation = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>("education", {
        method: "POST",
        body: data,
        auth: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to add education");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEducation = async (id: number | string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`education/${id}`, {
        method: "PUT",
        body: data,
        auth: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to update education");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEducation = async (id: number | string) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`education/${id}`, {
        method: "DELETE",
        auth: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete education");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createEducation, updateEducation, deleteEducation };
}
