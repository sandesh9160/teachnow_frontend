import "server-only";

import { headers,cookies } from "next/headers";
import { apiSanctum, api } from "@/services/api/client";
import { NextResponse } from "next/dist/server/web/spec-extension/response";
// import { AuthUser } from "@/context/AuthContext";

const cookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
};
const LARAVEL_COOKIE_NAMES = new Set(["laravel-session", "XSRF-TOKEN"]);
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost";

function maybeWithParentDomain(name: string, options: any, host: string) {
    if (LARAVEL_COOKIE_NAMES.has(name)) {
        return { ...options, domain: COOKIE_DOMAIN || host };
    }
    return options;
}

// export async function signIn(email: string, password: string ) {

   

    
//     const cookieStore = await cookies();
//     const headersList = await headers();
//     try{ 
//     const cookieValue = cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

//  const host = headersList.get("host");
//      try{
//    const csrfResponse = await apiSanctum.get("/sanctum/csrf-cookie", {
//            headers: {
//              ...(cookieStore ? { Cookie: cookieValue } : {}),
//            },
//          });

//          const setCookieHeaders = csrfResponse.headers["set-cookie"] ||
//         csrfResponse.headers["Set-Cookie"] ||
//         (csrfResponse.headers as any)["set-cookie"];

//          if (setCookieHeaders) {
//                 const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
//                 cookieArray.forEach((cookieString: string) => {
//                   const [nameValue, ...attributes] = cookieString.split(";");
//                   const [name, ...valueParts] = nameValue.split("=");
//                   const value = valueParts.join("="); // Handle values that might contain =
        
//                   if (name && value) {
//                     // Parse cookie attributes
//                     let cookieAttrs: any = { ...cookieOptions };
//                     attributes.forEach(attr => {
//                       const [key, val] = attr.trim().split("=");
//                       const lowerKey = key.toLowerCase();
//                       if (lowerKey === "httponly") cookieAttrs.httpOnly = true;
//                       else if (lowerKey === "secure") cookieAttrs.secure = true;
//                       else if (lowerKey === "samesite") cookieAttrs.sameSite = val?.toLowerCase() as "lax" | "strict" | "none";
//                       else if (lowerKey === "path" && val) cookieAttrs.path = val;
//                       else if (lowerKey === "max-age" && val) cookieAttrs.maxAge = Number.parseInt(val, 10);
//                     });
        
//                     const cookieName = name.trim();
//                     cookieAttrs = maybeWithParentDomain(cookieName, cookieAttrs,host??"");
//                     // Force root domain in production so session survives normalize (no host-only duplicate)
//                     if (
//                       process.env.NODE_ENV === "production" &&
//                       COOKIE_DOMAIN &&
//                       LARAVEL_COOKIE_NAMES.has(cookieName)
//                     ) {
//                       cookieAttrs = { ...cookieAttrs, domain: COOKIE_DOMAIN };
//                     }
//                     cookieStore.set(cookieName, decodeURIComponent(value.trim()), cookieAttrs);
//                   }
//                 });
//               }
//             }
//             catch (error) {
//                 console.error("Error during CSRF cookie fetch:", error);
//             }


//         }
//         catch (error) {
//             console.error("Error accessing cookies or headers:", error);
//         }
// //[hase 2] Login request with cookies and CSRF token
//          const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;

//           const cookieHeader = cookieStore.getAll()
//              .map(cookie => `${cookie.name}=${cookie.value}`)
//              .join("; ");
         
//            try {
//              // Use api instance for login, but manually add cookies and XSRF token
//              const res = await api.post(`/auth/login`, {
//                 email,
//                 password,
//              }, {
//                headers: {
//                  ...(cookieHeader ? { Cookie: cookieHeader } : {}),
//                  ...(xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {}),
//                },
//              });
         
//              const raw = res.data as Record<string, unknown>;
//              const data = raw?.data && typeof raw.data === "object" && raw.data !== null
//                ? (raw.data as Record<string, unknown>)
//                : raw;
//              const userObj = data?.user && typeof data.user === "object" && data.user !== null
//                ? (data.user as Record<string, unknown>)
//                : data;
         
//              // Extract and set cookies from login response (skip authSession / authToken — we set those ourselves)
//              const loginSetCookieHeaders = res.headers["set-cookie"];
//              if (loginSetCookieHeaders) {
//                const host = headersList.get("host");
//                loginSetCookieHeaders.forEach((cookieString: string) => {
//                  const [nameValue, ...attributes] = cookieString.split(";");
//                  const [name, ...valueParts] = nameValue.split("=");
//                  const value = valueParts.join("=");
//                  const cookieName = name?.trim();
//                 //  if (cookieName && AUTH_COOKIES_WE_OWN.includes(cookieName)) return;
         
//                  if (name && value) {
//                    let cookieAttrs: any = { ...cookieOptions };
//                    attributes.forEach((attr) => {
//                      const [key, val] = attr.trim().split("=");
//                      const lowerKey = key.toLowerCase();
//                      if (lowerKey === "httponly") cookieAttrs.httpOnly = true;
//                      else if (lowerKey === "secure") cookieAttrs.secure = true;
//                      else if (lowerKey === "samesite")
//                        cookieAttrs.sameSite = val?.toLowerCase() as "lax" | "strict" | "none";
//                      else if (lowerKey === "path" && val) cookieAttrs.path = val;
//                      else if (lowerKey === "max-age" && val) cookieAttrs.maxAge = Number.parseInt(val, 10);
//                    });
         
//                    cookieAttrs = maybeWithParentDomain(cookieName ?? "", cookieAttrs, host ?? "");
//                    // Force root domain in production so session survives normalize (no host-only duplicate)
//                    if (
//                      process.env.NODE_ENV === "production" &&
//                      COOKIE_DOMAIN &&
//                      cookieName &&
//                      LARAVEL_COOKIE_NAMES.has(cookieName)
//                    ) {
//                      cookieAttrs = { ...cookieAttrs, domain: COOKIE_DOMAIN };
//                    }
//                    cookieStore.set(cookieName ?? "", decodeURIComponent(value.trim()), cookieAttrs);
//                  }
//                });
//              }
         
//             //  const token = (data?.token ?? userObj?.token ?? raw?.token) as string | undefined;
//              const id = Number(userObj?.id ?? userObj?.user_id ?? data?.user_id ?? data?.id ?? 0);
            
         
//              const user = {
//               id:id,
//               name:userObj?.name ?? data?.name ?? "",
//               email:userObj?.email ?? data?.email ?? "",
//               role:userObj?.role ?? data?.role ?? "",
//               isActive:userObj?.is_active ?? data?.is_active ?? false,
//                // id: userObj?.id ?? userObj?.user_id ?? data?.user_id ?? data?.id ?? 0,
//              };
         
//              // Set auth cookies so client-side can read the session
          
//              // Set userLead cookie for frontend use
//              // setUserLeadCookie(responseData);
         
//              return { user };
//            }
//            catch (error: any) {
//              console.error("Login error:", error);
//              throw new Error(error?.response?.data?.message || "Login failed");
//            }

        
//  }
export async function signIn(email: string, password: string) {
const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  try {
    // 1. Get CSRF cookie
    const csrfRes = await apiSanctum.get("/sanctum/csrf-cookie");

    const setCookies = csrfRes.headers["set-cookie"] || [];

    setCookies.forEach((cookieString: string) => {
      const [nameValue] = cookieString.split(";");
      const [name, value] = nameValue.split("=");

      if (name && value) {
        cookieStore.set(name, decodeURIComponent(value), {
          path: "/",
          httpOnly: true,
        });
      }
    });

    // 2. Login
    const xsrf = cookieStore.get("XSRF-TOKEN")?.value;

    const res = await api.post(
      "/auth/login",
      { email, password },
      {
        headers: {
          Cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; "),
          "X-XSRF-TOKEN": decodeURIComponent(xsrf || ""),
        },
      }
    );

    // 3. Set login cookies
    const loginCookies = res.headers["set-cookie"] || [];

    loginCookies.forEach((cookieString: string) => {
      const [nameValue] = cookieString.split(";");
      const [name, value] = nameValue.split("=");

      if (name && value) {
        cookieStore.set(name, decodeURIComponent(value), {
          path: "/",
          httpOnly: true,
        });
      }
    });

    return ({ user: res.data.user });

  } catch (err: any) {
   throw new Error(err?.response?.data?.message || "Login failed");
  }
}