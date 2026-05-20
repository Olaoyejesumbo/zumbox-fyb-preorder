import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

const DEFAULT_CONFIG = {
  id: 1,
  announcement_text: "FYB Week 2026 Pre-Orders are now open! Secure your uniform today.",
  pre_orders_open: true,
  pickup_date: "July 26, 2026",
  deposit_amount: 15000,
  balance_amount: 10000,
  whatsapp_number: "",
};

// GET /api/config — returns site configuration (public, used on gallery & order pages)
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("config")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    // Return defaults if Supabase is not yet connected
    return NextResponse.json(DEFAULT_CONFIG);
  }

  return NextResponse.json(data);
}

// PUT /api/config — updates site configuration (admin only)
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const supabase = createAdminClient();

  const updatePayload: Record<string, unknown> = {};
  if (typeof body.announcement_text === "string")
    updatePayload.announcement_text = body.announcement_text;
  if (typeof body.pre_orders_open === "boolean")
    updatePayload.pre_orders_open = body.pre_orders_open;
  if (typeof body.pickup_date === "string")
    updatePayload.pickup_date = body.pickup_date;
  if (typeof body.deposit_amount === "number")
    updatePayload.deposit_amount = body.deposit_amount;
  if (typeof body.balance_amount === "number")
    updatePayload.balance_amount = body.balance_amount;
  if (typeof body.whatsapp_number === "string")
    updatePayload.whatsapp_number = body.whatsapp_number;

  // Upsert: insert row 1 if it doesn't exist, otherwise update
  const { data, error } = await supabase
    .from("config")
    .upsert({ id: 1, ...updatePayload })
    .select()
    .single();

  if (error) {
    console.error("config PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
