import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  
  if (!url) return new NextResponse("Missing url", { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch file from remote server");

    const arrayBuffer = await res.arrayBuffer();
    const headers = new Headers();
    
    // Set appropriate headers to display inline
    headers.set("Content-Type", res.headers.get("Content-Type") || "application/pdf");
    headers.set("Content-Disposition", `inline`);

    // Allow embedding
    headers.set("X-Frame-Options", "ALLOWALL");
    headers.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(arrayBuffer, { headers });
  } catch (error) {
    console.error("View API error:", error);
    return new NextResponse("Error viewing file", { status: 500 });
  }
}
