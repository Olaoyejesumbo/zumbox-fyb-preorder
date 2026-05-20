import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/orders — returns all orders (admin use only)
// TODO: Replace the header-based auth check with a proper session/JWT check.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("x-admin-password");
  // Relaxed check for same-origin admin UI calls; tighten before production.
  if (authHeader && authHeader !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("orders GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
