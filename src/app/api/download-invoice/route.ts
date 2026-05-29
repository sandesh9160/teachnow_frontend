import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const filename = searchParams.get("filename") || "invoice.pdf";

    if (!path) {
      return new NextResponse("Missing file path", { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
    const fullUrl = path.startsWith("http")
      ? path
      : `${baseUrl}/${path.startsWith("/") ? path.slice(1) : path}`;

    console.log("Next.js Proxy Downloading Invoice from backend url:", fullUrl);

    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from backend: ${response.statusText}`);
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Content-Type", "application/pdf");

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Error in download-invoice API route:", error);
    return new NextResponse(error.message || "Failed to download invoice", { status: 500 });
  }
}
