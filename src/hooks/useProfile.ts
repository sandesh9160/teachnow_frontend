import { useState, useCallback } from "react";
import { fetchAPI } from "@/services/api/client";

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>("jobseeker/profile", { silentStatusCodes: [404], auth: true });
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProfile = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>("jobseeker/profile", {
        method: "POST",
        body: data,
        auth: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>("jobseeker/profile", {
        method: "PUT",
        body: data,
        auth: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>("jobseeker/profile", {
        method: "DELETE",
        auth: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, getProfile, createProfile, updateProfile, deleteProfile };
}
