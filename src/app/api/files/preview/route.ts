import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing URL", { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    
    const blob = await res.blob();
    const contentType = res.headers.get("Content-Type") || "application/pdf";

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Failed to preview file: " + (error as Error).message, { status: 500 });
  }
}
