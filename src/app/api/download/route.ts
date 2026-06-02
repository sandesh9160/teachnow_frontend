import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const fileName = req.nextUrl.searchParams.get("fileName");
  
  if (!url) return new NextResponse("Missing url", { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch file from remote server");

    const arrayBuffer = await res.arrayBuffer();
    const headers = new Headers();
    
    // Set appropriate headers to force a file download
    headers.set("Content-Type", res.headers.get("Content-Type") || "application/pdf");
    const finalName = fileName || url.split('/').pop() || 'Resume.pdf';
    headers.set("Content-Disposition", `attachment; filename="${finalName}"`);

    return new NextResponse(arrayBuffer, { headers });
  } catch (error) {
    console.error("Download API error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
