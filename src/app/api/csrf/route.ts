import { NextResponse } from "next/server";
import { apiSanctum } from "@/lib/api";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const res = await apiSanctum.get("/sanctum/csrf-cookie", {
        headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
    });

    const response = NextResponse.json({ ok: true });

    const setCookies = res.headers["set-cookie"];
    if (setCookies) {
        const arr = Array.isArray(setCookies) ? setCookies : [setCookies];
        arr.forEach((cookieString: string) => {
            const [nameValue, ...attributes] = cookieString.split(";");
            const [name, ...valueParts] = nameValue.split("=");
            const value = valueParts.join("=");
            if (!name || !value) return;

            const attrs: Record<string, string | boolean | number> = { path: "/" };
            attributes.forEach(attr => {
                const [k, v] = attr.trim().split("=");
                const lk = k.toLowerCase();
                if (lk === "max-age" && v) attrs.maxAge = parseInt(v, 10);
                if (lk === "path" && v) attrs.path = v;
                // domain and samesite intentionally ignored
            });

            response.cookies.set(name.trim(), decodeURIComponent(value.trim()), {
                path: attrs.path as string,
                maxAge: attrs.maxAge as number | undefined,
                httpOnly: false,   // XSRF-TOKEN must be readable by JS
                sameSite: "lax",
                secure: false,     // localhost is HTTP
            });
        });
    }

    return response;
}