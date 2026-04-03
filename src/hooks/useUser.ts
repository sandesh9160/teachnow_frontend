import { useAuth } from "@/context/AuthContext";

/**
 * useUser hook provides shorthand access to the authenticated user state.
 */
export function useUser() {
  const { user, role, loading, isLoggedIn, logout, fetchProfile } = useAuth();

  return {
    user,
    role,
    loading,
    isLoggedIn,
    logout,
    refreshProfile: fetchProfile,
    // Shorthand for conditional checks
    isEmployer: role === "employer",
    isJobSeeker: role === "jobseeker",
  };
}
