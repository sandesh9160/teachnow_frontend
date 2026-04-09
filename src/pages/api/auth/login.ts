import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Update these URLs to match your backend endpoints
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://teachnowbackend.jobsvedika.in/api";
const SANCTUM_URL = BACKEND_BASE_URL.replace(/\/api$/, "") + "/sanctum/csrf-cookie";
const LOGIN_URL = BACKEND_BASE_URL + "/auth/login";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // 1. Get CSRF cookie from backend
    const csrfRes = await axios.get(SANCTUM_URL, {
      withCredentials: true,
    });
    const csrfCookies = csrfRes.headers["set-cookie"] || [];

    // 2. Login request, forward CSRF cookies
    const loginRes = await axios.post(
      LOGIN_URL,
      req.body,
      {
        withCredentials: true,
        headers: {
          Cookie: csrfCookies.map((c: string) => c.split(";")[0]).join("; "),
          "X-XSRF-TOKEN": extractXsrfToken(csrfCookies),
        },
      }
    );
    const loginCookies = loginRes.headers["set-cookie"] || [];

    // 3. Forward all cookies to browser
    const allCookies = [...csrfCookies, ...loginCookies];
    if (allCookies.length > 0) {
      res.setHeader("Set-Cookie", allCookies);
    }

    // 4. Return user data
    return res.status(200).json({ user: loginRes.data.user });
  } catch (error: any) {
    return res.status(401).json({ message: error?.response?.data?.message || "Login failed" });
  }
}

function extractXsrfToken(cookies: string[]) {
  const xsrf = cookies.find((c) => c.startsWith("XSRF-TOKEN="));
  return xsrf ? decodeURIComponent(xsrf.split(";")[0].split("=")[1]) : "";
}
