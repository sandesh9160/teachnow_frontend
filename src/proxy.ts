// import { NextRequest, NextResponse } from "next/server";

// /**
//  * Clear auth cookies with attributes matching how they were set.
//  * laravel_session is HttpOnly — can only be cleared via server-side Set-Cookie
//  * with matching path/domain/sameSite attributes.
//  */
// function clearAuthCookies(res: NextResponse) {
//   res.cookies.set("laravel_session", "", {
//     path: "/",
//     maxAge: 0,
//     expires: new Date(0),
//     httpOnly: true,
//     secure: true,      // Must match backend
//     sameSite: "none" as const,  // Must match backend for cross-site
//   });
//   res.cookies.set("laravel-session", "", { 
//     ...commonOptions, 
//     httpOnly: true 
//   });

//   res.cookies.set("XSRF-TOKEN", "", { 
//     ...commonOptions, 
//     httpOnly: false 
//   });
// }

// /** Set Cache-Control to prevent caching */
// function setNoStore(res: NextResponse) {
//   res.headers.set("Cache-Control", "no-store");
// }

// export default function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // 1. Skip checks for Next-Action (Server Actions) to avoid internal 500s
//   if (req.headers.has("next-action")) return NextResponse.next();

//   // 2. Skip API or static paths
//   if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
//     return NextResponse.next();
//   }

//   // 3. Skip check if already on the login page to avoid infinite redirect loop
//   if (pathname.startsWith("/auth/login")) return NextResponse.next();

//   // Check cookies
//   const laravelSession = Boolean(req.cookies.get("laravel-session")?.value);
//   const xsrfToken = Boolean(req.cookies.get("XSRF-TOKEN")?.value);

//   if (process.env.NODE_ENV === "development") {
//     //console.log("[auth] cookies:", { laravelSession, xsrfToken, path: pathname });
//   }

//   // --- CASE 1: Both cookies present → allow request ---
//   if (laravelSession && xsrfToken) {
//     const res = NextResponse.next();
//     setNoStore(res);
//     return res;
//   }

//   // --- CASE 2: Only one cookie present → broken session → redirect to login ---
//   if ((laravelSession && !xsrfToken) || (!laravelSession && xsrfToken)) {
//     const res = NextResponse.redirect(new URL("/auth/login", req.url));
//     clearAuthCookies(res);
//     setNoStore(res);
//     return res;
//   }

//   // --- CASE 3: Both cookies missing → redirect to login (if on protected route) ---
//   if (!laravelSession && !xsrfToken) {
//     if (pathname.startsWith("/dashboard") || pathname.startsWith("/jobseeker") || pathname.startsWith("/employer")) {
//       const query = req.nextUrl.search;
//       const callbackRaw = query ? `${pathname}${query}` : pathname;
//       const redirectUrl = new URL("/auth/login", req.url);
//       redirectUrl.searchParams.set("callbackUrl", callbackRaw);

//       const res = NextResponse.redirect(redirectUrl);
//       clearAuthCookies(res);
//       setNoStore(res);
//       return res;
//     }
//   }

//   // Fallback (allow request for public pages)
//   return NextResponse.next();
// }


// // -----------------------------
// // 4. Matcher
// // -----------------------------
// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/auth/:path*",
//     "/jobseeker/:path*",
//     "/education/:path*",
//     "/experience/:path*",
//     "/employer/:path*",
//     "/recruiter/:path*",
//     "/open/jobs/:path*",
//     "/job/:path*", // job feature APIs
//   ],
// };
import { NextRequest, NextResponse } from "next/server";

function clearAuthCookies(res: NextResponse) {
  const common = {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
  res.cookies.set("laravel-session", "", { ...common, httpOnly: true });
  res.cookies.set("XSRF-TOKEN", "", { ...common, httpOnly: false });
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Bypass internal Next.js and static files
  if (
    req.headers.has("next-action") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Bypass login page to avoid loops
  if (pathname.startsWith("/auth/login")) return NextResponse.next();

  // 3. Cookie Detection (get() returns { name, value } — coerce for logs and checks)
  const sessionCookie = req.cookies.get("laravel-session");
  const xsrfCookie = req.cookies.get("XSRF-TOKEN");
  const hasSession = Boolean(sessionCookie?.value);
  const hasXsrf = Boolean(xsrfCookie?.value);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Proxy] Path: ${pathname} | Session: ${hasSession} | XSRF: ${hasXsrf}`
    );
  }

  // 4. Protection Logic
  const isProtectedRoute = ["/dashboard", "/jobseeker", "/employer", "/recruiter"].some(p => pathname.startsWith(p));

  if (process.env.NODE_ENV === "development") {
    console.log(`[Proxy] Checking auth for ${pathname} | Protected: ${isProtectedRoute}`);
  }

  if (isProtectedRoute && (!hasSession || !hasXsrf)) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const res = NextResponse.redirect(loginUrl);
    clearAuthCookies(res); // Clean up any partial state
    return res;
  }


  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/dashboard/:path*",
    // "/auth/:path*",
    "/jobseeker/:path*",
    "/employer/:path*"
  ],
};