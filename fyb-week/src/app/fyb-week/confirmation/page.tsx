"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import UniformImage from "@/components/UniformImage";
import { UNIFORM_DESIGNS } from "@/types";
import { formatDate } from "@/lib/utils";
import type { Order } from "@/types";

function ConfirmationContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order ID found.");
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setOrder(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-syne text-forest text-sm tracking-widest uppercase animate-pulse">
          Loading your order…
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-4">
        <p className="font-syne text-burgundy font-bold text-lg">
          {error || "Order not found."}
        </p>
        <button
          onClick={() => router.push("/fyb-week")}
          className="bg-forest text-cream font-syne font-bold text-xs uppercase tracking-[2px] px-6 py-3 hover:bg-burgundy transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const design = UNIFORM_DESIGNS.find((d) => d.id === order.selected_design);

  const nextSteps = [
    "Check your email for your order confirmation.",
    order.in_person_measurement
      ? "We'll contact you within 2 business days to schedule your measurement session."
      : "Your self-measurements have been saved.",
    "Your uniform will be ready for pickup by July 26, 2026.",
    "You'll receive a notification when your uniform is ready for collection.",
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-ebony text-cream px-6 py-4 flex items-center justify-between no-print">
        <span className="font-syne font-bold text-lg tracking-[3px] uppercase">
          ZumboX
        </span>
        <span className="text-gold text-xs tracking-[2px] uppercase font-dm hidden sm:block">
          Order Confirmed
        </span>
      </nav>

      {/* Success hero */}
      <div className="bg-forest text-cream text-center px-6 py-16 sm:py-20">
        <div className="text-5xl mb-4" aria-hidden="true">
          🎉
        </div>
        <h1 className="font-syne font-bold text-3xl sm:text-5xl uppercase tracking-tight mb-3">
          Order Confirmed!
        </h1>
        <p className="text-cream/70 font-dm text-sm sm:text-base">
          Your FYB Week 2026 uniform pre-order is confirmed.
        </p>
      </div>

      {/* Order card */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        <div className="bg-white border border-ebony/10">
          {/* Order ID */}
          <div className="bg-ebony text-center py-4">
            <p className="text-gold/60 text-[10px] uppercase tracking-[3px] font-dm mb-1">
              Order ID
            </p>
            <p className="font-syne font-bold text-gold text-2xl tracking-[4px]">
              {order.order_id}
            </p>
          </div>

          {/* Design thumbnail */}
          {design && (
            <div className="flex gap-4 items-center p-5 border-b border-ebony/5">
              <div className="w-20 h-20 relative shrink-0">
                <UniformImage design={design} className="absolute inset-0" />
              </div>
              <div>
                <p className="font-syne font-bold text-sm uppercase tracking-wide text-ebony">
                  {design.name}
                </p>
                <p className="text-xs text-ebony/60 font-dm mt-1">
                  {order.gender}
                </p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="divide-y divide-ebony/5">
            <DetailRow label="Name" value={order.student_name} />
            <DetailRow label="Email" value={order.email} />
            <DetailRow label="Matric Number" value={order.student_id ?? "—"} />
            <DetailRow
              label="Measurements"
              value={order.in_person_measurement ? "In-person session" : "Self-measured"}
            />
            <DetailRow
              label="Date"
              value={formatDate(order.created_at)}
            />
          </div>

          {/* Payment summary */}
          <div className="bg-cream/60 divide-y divide-ebony/5">
            <DetailRow
              label="Deposit Paid ✓"
              value={`₦${order.deposit_amount.toLocaleString("en-NG")}`}
              valueClass="text-forest font-bold"
            />
            <DetailRow
              label="Balance on Pickup"
              value={`₦${order.balance_amount.toLocaleString("en-NG")}`}
              valueClass="text-burgundy font-bold"
            />
          </div>

          {/* Email note */}
          <div className="px-5 py-4 bg-gold/10 border-t border-gold/20">
            <p className="text-xs font-dm text-ebony/70 text-center leading-relaxed">
              A confirmation email has been sent to <strong>{order.email}</strong>
            </p>
          </div>
        </div>

        {/* Next steps */}
        <div className="mt-6 bg-white border border-ebony/10 p-6">
          <h2 className="font-syne font-bold text-sm uppercase tracking-[2px] text-forest mb-4">
            Next Steps
          </h2>
          <ol className="space-y-3">
            {nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="w-6 h-6 bg-forest text-cream flex items-center justify-center font-syne font-bold text-xs shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm font-dm text-ebony/80 leading-relaxed">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="flex-1 border border-forest text-forest font-syne font-bold text-xs uppercase tracking-[2px] py-3 hover:bg-forest hover:text-cream transition-colors"
          >
            View / Print Receipt
          </button>
          <button
            onClick={() => router.push("/fyb-week")}
            className="flex-1 bg-forest text-cream font-syne font-bold text-xs uppercase tracking-[2px] py-3 hover:bg-burgundy transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-forest text-cream/60 text-center py-6 px-4 text-xs font-dm tracking-wider no-print">
        <p className="font-syne font-bold text-cream tracking-[3px] uppercase mb-1">
          ZumboX Fashion
        </p>
        <p>The Rare Form &mdash; FYB Week 2026</p>
      </footer>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-xs font-dm uppercase tracking-wide text-ebony/50">
        {label}
      </span>
      <span className={`text-sm font-dm text-ebony ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <p className="font-syne text-forest">Loading…</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
