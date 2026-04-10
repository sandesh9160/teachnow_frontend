// import "server-only";

// import { headers,cookies } from "next/headers";
// import { apiSanctum, api } from "@/services/api/client";
// import { NextResponse } from "next/dist/server/web/spec-extension/response";
// // import { AuthUser } from "@/context/AuthContext";

// const cookieOptions = {
//   path: "/",
//   httpOnly: true,
//   sameSite: "lax" as const,
//   secure: true,
// };
// const LARAVEL_COOKIE_NAMES = new Set(["laravel-session", "XSRF-TOKEN"]);
// const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost";

// function maybeWithParentDomain(name: string, options: any, host: string) {
//     if (LARAVEL_COOKIE_NAMES.has(name)) {
//         return { ...options, domain: COOKIE_DOMAIN || host };
//     }
//     return options;
// }

// // export async function signIn(email: string, password: string ) {




// //     const cookieStore = await cookies();
// //     const headersList = await headers();
// //     try{ 
// //     const cookieValue = cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

// //  const host = headersList.get("host");
// //      try{
// //    const csrfResponse = await apiSanctum.get("/sanctum/csrf-cookie", {
// //            headers: {
// //              ...(cookieStore ? { Cookie: cookieValue } : {}),
// //            },
// //          });

// //          const setCookieHeaders = csrfResponse.headers["set-cookie"] ||
// //         csrfResponse.headers["Set-Cookie"] ||
// //         (csrfResponse.headers as any)["set-cookie"];

// //          if (setCookieHeaders) {
// //                 const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
// //                 cookieArray.forEach((cookieString: string) => {
// //                   const [nameValue, ...attributes] = cookieString.split(";");
// //                   const [name, ...valueParts] = nameValue.split("=");
// //                   const value = valueParts.join("="); // Handle values that might contain =

// //                   if (name && value) {
// //                     // Parse cookie attributes
// //                     let cookieAttrs: any = { ...cookieOptions };
// //                     attributes.forEach(attr => {
// //                       const [key, val] = attr.trim().split("=");
// //                       const lowerKey = key.toLowerCase();
// //                       if (lowerKey === "httponly") cookieAttrs.httpOnly = true;
// //                       else if (lowerKey === "secure") cookieAttrs.secure = true;
// //                       else if (lowerKey === "samesite") cookieAttrs.sameSite = val?.toLowerCase() as "lax" | "strict" | "none";
// //                       else if (lowerKey === "path" && val) cookieAttrs.path = val;
// //                       else if (lowerKey === "max-age" && val) cookieAttrs.maxAge = Number.parseInt(val, 10);
// //                     });

// //                     const cookieName = name.trim();
// //                     cookieAttrs = maybeWithParentDomain(cookieName, cookieAttrs,host??"");
// //                     // Force root domain in production so session survives normalize (no host-only duplicate)
// //                     if (
// //                       process.env.NODE_ENV === "production" &&
// //                       COOKIE_DOMAIN &&
// //                       LARAVEL_COOKIE_NAMES.has(cookieName)
// //                     ) {
// //                       cookieAttrs = { ...cookieAttrs, domain: COOKIE_DOMAIN };
// //                     }
// //                     cookieStore.set(cookieName, decodeURIComponent(value.trim()), cookieAttrs);
// //                   }
// //                 });
// //               }
// //             }
// //             catch (error) {
// //                 //console.error("Error during CSRF cookie fetch:", error);
// //             }


// //         }
// //         catch (error) {
// //             //console.error("Error accessing cookies or headers:", error);
// //         }
// // //[hase 2] Login request with cookies and CSRF token
// //          const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;

// //           const cookieHeader = cookieStore.getAll()
// //              .map(cookie => `${cookie.name}=${cookie.value}`)
// //              .join("; ");

// //            try {
// //              // Use api instance for login, but manually add cookies and XSRF token
// //              const res = await api.post(`/auth/login`, {
// //                 email,
// //                 password,
// //              }, {
// //                headers: {
// //                  ...(cookieHeader ? { Cookie: cookieHeader } : {}),
// //                  ...(xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {}),
// //                },
// //              });

// //              const raw = res.data as Record<string, unknown>;
// //              const data = raw?.data && typeof raw.data === "object" && raw.data !== null
// //                ? (raw.data as Record<string, unknown>)
// //                : raw;
// //              const userObj = data?.user && typeof data.user === "object" && data.user !== null
// //                ? (data.user as Record<string, unknown>)
// //                : data;

// //              // Extract and set cookies from login response (skip authSession / authToken — we set those ourselves)
// //              const loginSetCookieHeaders = res.headers["set-cookie"];
// //              if (loginSetCookieHeaders) {
// //                const host = headersList.get("host");
// //                loginSetCookieHeaders.forEach((cookieString: string) => {
// //                  const [nameValue, ...attributes] = cookieString.split(";");
// //                  const [name, ...valueParts] = nameValue.split("=");
// //                  const value = valueParts.join("=");
// //                  const cookieName = name?.trim();
// //                 //  if (cookieName && AUTH_COOKIES_WE_OWN.includes(cookieName)) return;

// //                  if (name && value) {
// //                    let cookieAttrs: any = { ...cookieOptions };
// //                    attributes.forEach((attr) => {
// //                      const [key, val] = attr.trim().split("=");
// //                      const lowerKey = key.toLowerCase();
// //                      if (lowerKey === "httponly") cookieAttrs.httpOnly = true;
// //                      else if (lowerKey === "secure") cookieAttrs.secure = true;
// //                      else if (lowerKey === "samesite")
// //                        cookieAttrs.sameSite = val?.toLowerCase() as "lax" | "strict" | "none";
// //                      else if (lowerKey === "path" && val) cookieAttrs.path = val;
// //                      else if (lowerKey === "max-age" && val) cookieAttrs.maxAge = Number.parseInt(val, 10);
// //                    });

// //                    cookieAttrs = maybeWithParentDomain(cookieName ?? "", cookieAttrs, host ?? "");
// //                    // Force root domain in production so session survives normalize (no host-only duplicate)
// //                    if (
// //                      process.env.NODE_ENV === "production" &&
// //                      COOKIE_DOMAIN &&
// //                      cookieName &&
// //                      LARAVEL_COOKIE_NAMES.has(cookieName)
// //                    ) {
// //                      cookieAttrs = { ...cookieAttrs, domain: COOKIE_DOMAIN };
// //                    }
// //                    cookieStore.set(cookieName ?? "", decodeURIComponent(value.trim()), cookieAttrs);
// //                  }
// //                });
// //              }

// //             //  const token = (data?.token ?? userObj?.token ?? raw?.token) as string | undefined;
// //              const id = Number(userObj?.id ?? userObj?.user_id ?? data?.user_id ?? data?.id ?? 0);


// //              const user = {
// //               id:id,
// //               name:userObj?.name ?? data?.name ?? "",
// //               email:userObj?.email ?? data?.email ?? "",
// //               role:userObj?.role ?? data?.role ?? "",
// //               isActive:userObj?.is_active ?? data?.is_active ?? false,
// //                // id: userObj?.id ?? userObj?.user_id ?? data?.user_id ?? data?.id ?? 0,
// //              };

// //              // Set auth cookies so client-side can read the session

// //              // Set userLead cookie for frontend use
// //              // setUserLeadCookie(responseData);

// //              return { user };
// //            }
// //            catch (error: any) {
// //              //console.error("Login error:", error);
// //              throw new Error(error?.response?.data?.message || "Login failed");
// //            }


// //  }
// export async function signIn(email: string, password: string) {
// const cookieStore = await cookies();
//   const headersList = await headers();
//   const host = headersList.get("host") ?? "";

//   try {
//     // 1. Get CSRF cookie
//     const csrfRes = await apiSanctum.get("/sanctum/csrf-cookie");

//     const setCookies = csrfRes.headers["set-cookie"] || [];

//     setCookies.forEach((cookieString: string) => {
//       const [nameValue] = cookieString.split(";");
//       const [name, value] = nameValue.split("=");

//       if (name && value) {
//         cookieStore.set(name, decodeURIComponent(value), {
//           path: "/",
//           httpOnly: true,
//         });
//       }
//     });

//     // 2. Login
//     const xsrf = cookieStore.get("XSRF-TOKEN")?.value;

//     const res = await api.post(
//       "/auth/login",
//       { email, password },
//       {
//         headers: {
//           Cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; "),
//           "X-XSRF-TOKEN": decodeURIComponent(xsrf || ""),
//         },
//       }
//     );

//     // 3. Set login cookies
//     const loginCookies = res.headers["set-cookie"] || [];

//     loginCookies.forEach((cookieString: string) => {
//       const [nameValue] = cookieString.split(";");
//       const [name, value] = nameValue.split("=");

//       if (name && value) {
//         cookieStore.set(name, decodeURIComponent(value), {
//           path: "/",
//           httpOnly: true,
//         });
//       }
//     });

//     return ({ user: res.data.user });

//   } catch (err: any) {
//    throw new Error(err?.response?.data?.message || "Login failed");
//   }
// }

import "server-only";

import { cookies } from "next/headers";
import { apiSanctum, api } from "@/lib/api";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  path: "/",
  httpOnly: false,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  // Strictly use the domain from environment variables 
  // without any internal fallbacks like "localhost"
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
};


export interface AdminUser {
  user_id: number;
  f_name: string;
  email: string;
  profile_pic?: string;
  user_type: string;
}


export const signIn = async (data: { email: string; password: string; role?: "jobseeker" | "employer" | "recruiter" }) => {
  const cookieStore = await cookies();

  // Fetch CSRF cookie first to get fmg-session and XSRF-TOKEN
  // Use apiSanctum.get as requested - this gives fmg-session and XSRF-TOKEN cookies
  try {
    // Format existing cookies for the request
    const allCookies = cookieStore.getAll();
    const uniqueNames = new Set<string>();
    const cookieHeader = allCookies
      .filter(c => {
        if (uniqueNames.has(c.name)) return false;
        uniqueNames.add(c.name);
        return true;
      })
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const csrfResponse = await apiSanctum.get("/sanctum/csrf-cookie", {
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });
    // console.log("csrfResponse is ", csrfResponse.headers);
    // Extract and set cookies from response
    // Axios returns Set-Cookie headers in response.headers['set-cookie'] (lowercase) as an array
    const setCookieHeaders =
      csrfResponse.headers["set-cookie"] ||
      csrfResponse.headers["Set-Cookie"] ||
      (csrfResponse.headers as Record<string, unknown>)["set-cookie"];
    if (setCookieHeaders) {
      const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
      cookieArray.forEach((cookieString: string) => {
        const [nameValue, ...attributes] = cookieString.split(";");
        const [name, ...valueParts] = nameValue.split("=");
        const value = valueParts.join("="); // Handle values that might contain =

        if (name && value) {
          // Parse cookie attributes
          const cookieAttrs: { httpOnly?: boolean; secure?: boolean; sameSite?: "lax" | "strict" | "none"; path?: string; maxAge?: number } = { ...cookieOptions };
          // Replace the attributes.forEach block inside both cookie-setting loops
          // ─── CSRF cookie forEach (around line ~58) ───────────────────────────────────
          attributes.forEach((attr) => {
            const [key, val] = attr.trim().split("=");
            const lowerKey = key.toLowerCase();
            if (lowerKey === "httponly") cookieAttrs.httpOnly = true;
            else if (lowerKey === "secure") cookieAttrs.secure = isProduction;
            else if (lowerKey === "path" && val) cookieAttrs.path = val;
            else if (lowerKey === "max-age" && val)
              cookieAttrs.maxAge = Number.parseInt(val, 10);
            else if (lowerKey === "domain") { /* intentionally ignored */ } // ← ADD THIS
            // samesite is also intentionally not forwarded
          });

          cookieStore.set(name.trim(), decodeURIComponent(value.trim()), cookieAttrs);
        }
      });
    }
  } catch (error) {
    //console.error("Failed to fetch CSRF cookie:", error);
    // Continue anyway - the login might still work
  }

  // Get XSRF token from cookies for the login request
  const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;

  // Format cookies for login request
  const allCookies = cookieStore.getAll();
  const uniqueNamesRes = new Set<string>();
  const cookieHeader = allCookies
    .filter(c => {
      if (uniqueNamesRes.has(c.name)) return false;
      uniqueNamesRes.add(c.name);
      return true;
    })
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  // Determine login endpoint
  let endpoint = "/auth/login";
  if (data.role === "employer") {
    endpoint = "/auth/employer-login";
  } else if (data.role === "recruiter") {
    // Correct recruiter login endpoint as per user request
    endpoint = "/recruiter/login";
  }

  // Use api instance for login, but manually add cookies and XSRF token
  const res = await api.post(
    endpoint,
    {
      email: data.email,
      password: data.password,
    },
    {
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {}),
      },
    }
  );

  const responseData = res.data;
  console.log("signIn response is ", responseData);

  // Extract and set cookies from login response
  // const loginSetCookieHeaders = res.headers["set-cookie"];
  // Extract and set cookies from login response
  const loginSetCookieHeaders = res.headers["set-cookie"];
  if (loginSetCookieHeaders) {
    const cookieArray = Array.isArray(loginSetCookieHeaders) ? loginSetCookieHeaders : [loginSetCookieHeaders];
    cookieArray.forEach((cookieString: string) => {
      const [nameValue, ...attributes] = cookieString.split(";");
      const [name, ...valueParts] = nameValue.split("=");
      const value = valueParts.join("=");

      if (name && value) {
        const cookieAttrs: { httpOnly?: boolean; secure?: boolean; sameSite?: "lax" | "strict" | "none"; path?: string; maxAge?: number } = { ...cookieOptions };
        // In auth.ts - replace BOTH attributes.forEach blocks with this:
        // ─── CSRF cookie forEach (around line ~58) ───────────────────────────────────
        // ─── Login response forEach (around line ~110) ───────────────────────────────
        attributes.forEach((attr) => {
          const [key, val] = attr.trim().split("=");
          const lowerKey = key.toLowerCase();
          if (lowerKey === "httponly") cookieAttrs.httpOnly = true;
          else if (lowerKey === "secure") cookieAttrs.secure = isProduction;
          else if (lowerKey === "path" && val) cookieAttrs.path = val;
          else if (lowerKey === "max-age" && val)
            cookieAttrs.maxAge = Number.parseInt(val, 10);
          else if (lowerKey === "domain") { /* intentionally ignored */ } // ← ADD THIS
        });
        cookieStore.set(name.trim(), decodeURIComponent(value.trim()), cookieAttrs);
      }
    });
  }

  // Check if user is admin

  const role = responseData.user.user_type || responseData.user.role || responseData.role;
  console.log("role is ", role);
  // Set userData cookie for middleware compatibility
  const user = responseData.user;
  const userData = {
    user_id: user.user_id || user.id,
    f_name: user.f_name || user.name || user.company_name || user.full_name || "",
    email: user.email,
    profile_pic: user.profile_pic || user.company_logo || "",
    user_type: role,
  };

  cookieStore.set("userData", JSON.stringify(userData), cookieOptions);
  
  console.log("Cookie options used:", { 
    domain: cookieOptions.domain, 
    secure: cookieOptions.secure,
    nodeEnv: process.env.NODE_ENV,
    hasDomainInEnv: !!process.env.COOKIE_DOMAIN
  });

  return { user: userData };
};

export const signOut = async () => {
  const cookieStore = await cookies();
  // Call role-specific logout endpoint to handle server-side session cleanup
  try {

    // Determine the logout endpoint based on user type
    const userDataStr = cookieStore.get("userData")?.value;
    let endpoint = "/logout";

    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.user_type === "jobseeker" || userData.user_type === "Jobseeker") {
          endpoint = "/jobseeker/logout";
        } else if (userData.user_type === "employer" || userData.user_type === "Employer") {
          endpoint = "/employer/logout";
        } else if (userData.user_type === "recruiter" || userData.user_type === "Recruiter") {
          endpoint = "/recruiter/logout";
        }
      } catch (e) {
        // Fallback to default logout
      }
    }

    const allCookies = cookieStore.getAll();
    const uniqueNamesLogout = new Set<string>();
    const cookieHeader = allCookies
      .filter(c => {
        if (uniqueNamesLogout.has(c.name)) return false;
        uniqueNamesLogout.add(c.name);
        return true;
      })
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;

    await api.post(
      endpoint,
      {},
      {
        headers: {
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          ...(xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {}),
        },
      }
    );
  } catch (error) {
    //console.error("Logout API call failed:", error);
  }

  // IMPORTANT: For production, we MUST provide the same domain/path/options used during creation.
  // Simple cookieStore.delete(name) often fails on deployed sites.
  ["userData", "laravel_session", "laravel-session", "XSRF-TOKEN"].forEach(name => {
    cookieStore.delete({
      name,
      ...cookieOptions
    });
  });
};
