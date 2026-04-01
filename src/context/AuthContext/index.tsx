// "use client";

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
//   useCallback,
//   useMemo,
// } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { authApi, fetchAPI, getCsrfCookie } from "@/services/api/client";

// export type UserRole = "jobseeker" | "employer" | "manager" | "recruiter";

// export interface AuthUser {
//   id: number;
//   name: string;
//   email: string;
//   role: UserRole;
//   avatar?: string;
//   full_name?: string;
//   company_name?: string;
// }

// interface AuthContextType {
//   user: AuthUser | null;
//   role: UserRole | null;
//   loading: boolean;
//   login: (credentials: any) => Promise<void>;
//   register: (data: any) => Promise<void>;
//   logout: () => Promise<void>;
//   fetchProfile: () => Promise<void>;
//   isLoggedIn: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [role, setRole] = useState<UserRole | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // ==============================
//   // Fetch Profile
//   // ==============================
//   const fetchProfile = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await fetchAPI<any>("auth/profile", {
//         silentStatusCodes: [401],
//       });

//       const userData = res?.user || res?.data?.user || res?.data || null;

//       if (userData && (userData.id || userData.email)) {
//         setUser({
//           ...userData,
//           avatar: (userData.name ||
//             userData.full_name ||
//             userData.company_name ||
//             "?")
//             .charAt(0)
//             .toUpperCase(),
//         });

//         // Accept all backend roles
//         if (
//           userData.role === "jobseeker" ||
//           userData.role === "employer" ||
//           userData.role === "manager" ||
//           userData.role === "recruiter"
//         ) {
//           setRole(userData.role);
//         } else {
//           setRole(null);
//         }
//       } else {
//         setUser(null);
//         setRole(null);
//       }
//     } catch (err: any) {
//       if (err?.status !== 401) {
//         console.error("Profile fetch error:", err);
//       }
//       setUser(null);
//       setRole(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // ==============================
//   // LOGIN
//   // ==============================
//   const login = useCallback(async (credentials: any) => {
//     setLoading(true);
//     try {
//       await getCsrfCookie();
//       await authApi.post("/api/auth/login", credentials, {
//         withCredentials: true,
//       });

//       await fetchProfile();

//       toast.success("Welcome back!");

//       // Redirect based on backend role
//       switch (user?.role) {
//         case "employer":
//           router.push("/dashboard/employer/company-profile");
//           break;
//         case "jobseeker":
//           router.push("/dashboard/jobseeker/profile");
//           break;
//         case "manager":
//           router.push("/dashboard/manager");
//           break;
//         case "recruiter":
//           router.push("/dashboard/recruiter");
//           break;
//         default:
//           router.push("/"); // fallback
//       }
//     } catch (err: any) {
//       toast.error(err?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchProfile, router, user?.role]);

//   // ==============================
//   // REGISTER
//   // ==============================
//   const register = useCallback(async (data: any) => {
//     setLoading(true);
//     try {
//       await fetchAPI("auth/register", {
//         method: "POST",
//         body: data,
//         auth: true,
//       });

//       toast.success("Account created!");
//       router.push("/auth/login");
//     } catch (err: any) {
//       toast.error(err?.message || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   // ==============================
//   // LOGOUT
//   // ==============================
//   const logout = useCallback(async () => {
//     setLoading(true);
//     try {
//       await fetchAPI("auth/logout", {
//         method: "POST",
//         auth: true,
//       });
//     } catch {
//       // Ignore logout API failure
//     } finally {
//       setUser(null);
//       setRole(null);
//       toast.success("Logged out");
//       router.push("/auth/login");
//       setLoading(false);
//     }
//   }, [router]);

//   useEffect(() => {
//     fetchProfile();
//   }, [fetchProfile]);

//   const value = useMemo(
//     () => ({
//       user,
//       role,
//       loading,
//       login,
//       register,
//       logout,
//       fetchProfile,
//       isLoggedIn: !!user,
//     }),
//     [user, role, loading, login, register, logout, fetchProfile]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchAPI } from "@/services/api/client";

export type UserRole = "jobseeker" | "employer" | "manager" | "recruiter";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  full_name?: string;
  company_name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  login: (role: string, credentials: any) => Promise<void>;
  register: (role: string, data: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<AuthUser | null>;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ==============================
  // Fetch Profile
  // ==============================
  const fetchProfile = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await fetchAPI<any>("/auth/profile", {
        silentStatusCodes: [401],
      });

      const userData = res?.user || res?.data || res;

      if (userData?.id) {
        const finalUser: AuthUser = {
          ...userData,
          avatar: (userData.name ||
            userData.full_name ||
            userData.company_name ||
            "?")[0].toUpperCase(),
        };

        setUser(finalUser);
        setRole(finalUser.role || null);

        return finalUser;
      }

      setUser(null);
      setRole(null);
      return null;
    } catch {
      setUser(null);
      setRole(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==============================
  // LOGIN
  // ==============================
  const login = useCallback(
    async (role: string, credentials: any) => {
      setLoading(true);
      try {
        // ✅ CSRF handled inside fetchAPI
        await fetchAPI("/auth/login", {
          method: "POST",
          body: { ...credentials, role },
        });

        // ✅ Get fresh user
        const loggedInUser = await fetchProfile();

        toast.success("Welcome back!");

        // ✅ Redirect based on returned user
        switch (loggedInUser?.role) {
          case "employer":
            router.push("/dashboard/employer/company-profile");
            break;
          case "jobseeker":
            router.push("/dashboard/jobseeker/profile");
            break;
          case "manager":
            router.push("/dashboard/manager");
            break;
          case "recruiter":
            router.push("/dashboard/recruiter");
            break;
          default:
            router.push("/");
        }
      } catch (err: any) {
        toast.error(err?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    },
    [fetchProfile, router]
  );

  // ==============================
  // REGISTER
  // ==============================
  const register = useCallback(
    async (role: string, data: any) => {
      setLoading(true);
      try {
        await fetchAPI("/auth/register", {
          method: "POST",
          body: { ...data, role },
        });

        toast.success("Account created!");
        router.push("/auth/login");
      } catch (err: any) {
        toast.error(err?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // ==============================
  // LOGOUT
  // ==============================
  const logout = useCallback(async () => {
    try {
      await fetchAPI("/auth/logout", {
        method: "POST",
      });
    } catch {
      // ignore
    } finally {
      setUser(null);
      setRole(null);
      router.push("/auth/login");
      toast.success("Logged out");
    }
  }, [router]);

  // ==============================
  // INIT
  // ==============================
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      login,
      register,
      logout,
      fetchProfile,
      isLoggedIn: !!user,
    }),
    [user, role, loading, login, register, logout, fetchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};