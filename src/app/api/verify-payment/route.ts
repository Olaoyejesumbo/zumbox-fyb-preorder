import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { generateOrderId } from "@/lib/utils";

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    amount: number;
    reference: string;
    customer: { email: string };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, formData, depositAmount, balanceAmount } = body;

    if (!reference || !formData) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // ── 1. Verify with Paystack ────────────────────────────────────────────
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData: PaystackVerifyResponse = await paystackRes.json();

    // Accept "success" status from Paystack; for test/placeholder keys also accept
    // if the key is a placeholder (development mode).
    const isPlaceholder = process.env.PAYSTACK_SECRET_KEY === "sk_test_PLACEHOLDER";
    const isVerified =
      isPlaceholder ||
      (paystackData.status && paystackData.data?.status === "success");

    if (!isVerified) {
      return NextResponse.json(
        { error: "Payment verification failed. Please contact support." },
        { status: 402 }
      );
    }

    // ── 2. Build order record ─────────────────────────────────────────────
    const orderId = generateOrderId();
    const supabase = createAdminClient();

    const orderRecord = {
      order_id: orderId,
      student_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      student_id: formData.matricNumber || null,
      gender: formData.gender,
      selected_design: formData.selectedDesign,
      measurements: formData.measurementMethod === "self" ? formData.measurements : null,
      in_person_measurement: formData.measurementMethod === "in-person",
      payment_status: "paid",
      paystack_reference: reference,
      deposit_amount: depositAmount ?? 15000,
      balance_amount: balanceAmount ?? 10000,
    };

    const { data: inserted, error: dbError } = await supabase
      .from("orders")
      .insert(orderRecord)
      .select()
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      // Return orderId anyway so confirmation page can show — log for manual recovery
      return NextResponse.json(
        { error: "Order saved partially. Please contact support with reference: " + reference },
        { status: 500 }
      );
    }

    // ── 3. Send confirmation email ─────────────────────────────────────────
    try {
      await sendOrderConfirmationEmail(inserted);
    } catch (emailErr) {
      // Non-fatal: email failure shouldn't block the user
      console.error("Email send failed:", emailErr);
    }

    return NextResponse.json({ orderId, success: true });
  } catch (err) {
    console.error("verify-payment error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
