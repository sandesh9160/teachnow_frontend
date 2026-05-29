// lib/clearAuthCookies.ts
import { cookies } from "next/headers";

export async function clearAuthCookies() {
    const cookieStore = await cookies();

    const cookieNames = [
        "XSRF-TOKEN",
        "laravel-session",
        "userData",
    ];

    for (const name of cookieNames) {
        cookieStore.set(name, "", {
            path: "/",
            expires: new Date(0),
            maxAge: 0,
        });

        // optional lowercase variations
        cookieStore.set(name.toLowerCase(), "", {
            path: "/",
            expires: new Date(0),
            maxAge: 0,
        });
    }
}