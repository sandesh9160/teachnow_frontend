import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST(request: Request) {
  await signOut();
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  return NextResponse.redirect(new URL("/auth/login", site), 303);
}
