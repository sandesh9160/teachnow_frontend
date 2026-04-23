import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";

/**
 * POST /api/razorpay/create-order
 * 
 * Creates a Razorpay order by calling the Laravel backend.
 * The backend handles Razorpay SDK interaction and returns
 * an order_id + order details for the frontend checkout.
 * 
 * Body: { plan_id: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_id } = body;

    if (!plan_id) {
      return NextResponse.json(
        { status: false, message: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Forward cookies for authenticated request
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieMap = new Map<string, string>();
    
    allCookies.forEach(c => {
      if (c.value) cookieMap.set(c.name, c.value);
    });

    const cookieHeader = Array.from(cookieMap.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");

    // Extract XSRF token for POST request
    const xsrfToken = cookieMap.get("XSRF-TOKEN");
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {}),
    };

    const response = await api.post(
      "/employer/payment/create-order",
      { plan_id },
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[Razorpay Create Order Error]", error?.response?.data || error?.message);
    
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Failed to create order";
    const data = error?.response?.data || {};

    return NextResponse.json(
      { status: false, message, ...data },
      { status }
    );
  }
}
