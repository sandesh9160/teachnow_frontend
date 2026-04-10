import { NextResponse } from "next/server";
import { apiSanctum } from "@/lib/api";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const csrfResponse = await apiSanctum.get("/sanctum/csrf-cookie", {
        headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
    });

    const res = NextResponse.json({ ok: true });
    
    // Forward the cookies from the backend session to the browser
    const setCookieHeaders = csrfResponse.headers["set-cookie"] || csrfResponse.headers["Set-Cookie"];
    if (setCookieHeaders) {
        const cookiesInArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
        cookiesInArray.forEach(c => {
            res.headers.append("Set-Cookie", c);
        });
    }

    return res;
}