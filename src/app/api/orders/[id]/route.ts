import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/orders/[id] — fetch a single order by order_id
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/orders/[id] — update an order (e.g. mark completed)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const supabase = createAdminClient();

  // Whitelist only safe fields to update
  const allowed: Record<string, unknown> = {};
  if (body.payment_status) allowed.payment_status = body.payment_status;

  const { data, error } = await supabase
    .from("orders")
    .update(allowed)
    .eq("order_id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
