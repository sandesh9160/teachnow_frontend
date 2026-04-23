import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";

/**
 * POST /api/razorpay/verify-payment
 * 
 * Verifies the Razorpay payment by sending the payment details
 * to the Laravel backend for server-side signature verification.
 * 
 * Body: {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string,
 *   plan_id: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature} = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { status: false, message: "Missing payment verification data" },
        { status: 400 }
      );
    }

    // Forward cookies for authenticated request
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const uniqueNames = new Set<string>();
    const cookieHeader = allCookies
      .filter((c) => {
        if (uniqueNames.has(c.name)) return false;
        uniqueNames.add(c.name);
        return true;
      })
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    // Extract XSRF token for POST request
    const xsrfToken = allCookies.find((c) => c.name === "XSRF-TOKEN");
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken.value) } : {}),
    };

    const response = await api.post(
      "/employer/payment/verify-payment",
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[Razorpay Verify Payment Error]", error?.response?.data || error?.message);
    
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "Payment verification failed";
    const data = error?.response?.data || {};

    return NextResponse.json(
      { status: false, message, ...data },
      { status }
    );
  }
}
