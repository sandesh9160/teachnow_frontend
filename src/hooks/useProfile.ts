import { useState, useCallback } from "react";
import { fetchAPI } from "@/services/api/client";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      return await dashboardServerFetch<any>("jobseeker/profile", { method: "GET" });
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
      return await dashboardServerFetch<any>("jobseeker/profile", {
        method: "POST",
        data: data,
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
      return await dashboardServerFetch<any>("jobseeker/profile", {
        method: "PUT",
        data: data,
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
      return await dashboardServerFetch<any>("jobseeker/profile", {
        method: "DELETE",
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
