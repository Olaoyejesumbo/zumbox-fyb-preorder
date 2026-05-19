"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UniformImage from "@/components/UniformImage";
import MeasurementGuideModal from "@/components/MeasurementGuideModal";
import { UNIFORM_DESIGNS, Measurements } from "@/types";
import { nairaToKobo } from "@/lib/utils";

// Paystack types
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata: Record<string, unknown>;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  matricNumber: string;
  gender: string;
  selectedDesign: string;
  measurementMethod: "self" | "in-person";
  measurements: Measurements;
}

function OrderForm() {
  const router = useRouter();
  const params = useSearchParams();
  const designParam = params.get("design") || "";

  const [config, setConfig] = useState({
    depositAmount: 15000,
    balanceAmount: 10000,
    preOrdersOpen: true,
    pickupDate: "July 26, 2026",
  });

  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    matricNumber: "",
    gender: "",
    selectedDesign: designParam,
    measurementMethod: "self",
    measurements: {},
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData | string, string>>>({});
  const [guideOpen, setGuideOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Section refs for smooth scroll
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);
  const section5Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          depositAmount: data.deposit_amount ?? 15000,
          balanceAmount: data.balance_amount ?? 10000,
          preOrdersOpen: data.pre_orders_open ?? true,
          pickupDate: data.pickup_date ?? "July 26, 2026",
        });
      })
      .catch(() => {});
  }, []);

  // Load Paystack script
  useEffect(() => {
    if (document.getElementById("paystack-script")) {
      setPaystackLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => setPaystackLoaded(true);
    document.head.appendChild(script);
  }, []);

  const selectedDesignObj = UNIFORM_DESIGNS.find(
    (d) => d.id === form.selectedDesign
  );

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function updateMeasurement(key: keyof Measurements, value: string) {
    setForm((prev) => ({
      ...prev,
      measurements: { ...prev.measurements, [key]: value },
    }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "A valid email address is required.";
    if (!form.phone.trim() || form.phone.trim().length < 7)
      next.phone = "A valid phone number is required.";
    if (!form.matricNumber.trim()) next.matricNumber = "Matric number is required.";
    if (!form.gender) next.gender = "Please select your gender.";
    if (!form.selectedDesign) next.selectedDesign = "Please select a design.";
    if (form.measurementMethod === "self") {
      if (!form.measurements.chest?.trim()) next["measurements.chest"] = "Chest/Bust measurement required.";
      if (!form.measurements.waist?.trim()) next["measurements.waist"] = "Waist measurement required.";
      if (!form.measurements.hips?.trim()) next["measurements.hips"] = "Hips measurement required.";
      if (!form.measurements.shoulderWidth?.trim()) next["measurements.shoulderWidth"] = "Shoulder width required.";
      if (!form.measurements.shirtLength?.trim()) next["measurements.shirtLength"] = "Shirt length required.";
      if (!form.measurements.shortsSkirtLength?.trim()) next["measurements.shortsSkirtLength"] = "Shorts/Skirt length required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handlePay() {
    if (!validate()) {
      // Scroll to first error section
      const firstError = Object.keys(errors)[0];
      if (firstError.startsWith("measurements")) {
        section3Ref.current?.scrollIntoView({ behavior: "smooth" });
      } else if (["fullName", "email", "phone", "matricNumber", "gender"].includes(firstError)) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        section2Ref.current?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      setPayError("Payment system not loaded. Please refresh and try again.");
      return;
    }

    setPayError("");
    setPaying(true);

    const ref = `ZBX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: form.email,
      amount: nairaToKobo(config.depositAmount),
      currency: "NGN",
      ref,
      metadata: {
        custom_fields: [
          { display_name: "Student Name", variable_name: "student_name", value: form.fullName },
          { display_name: "Matric Number", variable_name: "matric_number", value: form.matricNumber },
          { display_name: "Selected Design", variable_name: "selected_design", value: form.selectedDesign },
        ],
      },
      onClose: () => {
        setPaying(false);
        setPayError("Payment was cancelled. You can try again below.");
      },
      callback: async (response) => {
        try {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              formData: form,
              depositAmount: config.depositAmount,
              balanceAmount: config.balanceAmount,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Verification failed");
          router.push(`/fyb-week/confirmation?order=${data.orderId}`);
        } catch (err) {
          setPaying(false);
          setPayError(
            err instanceof Error ? err.message : "Something went wrong. Contact support."
          );
        }
      },
    });

    handler.openIframe();
  }

  const totalPrice = config.depositAmount + config.balanceAmount;

  const inputClass = (field: string) =>
    `w-full border font-dm text-sm px-4 py-3 bg-white text-ebony placeholder:text-ebony/40 focus:outline-none focus:border-forest transition-colors ${
      errors[field] ? "border-burgundy" : "border-ebony/20"
    }`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-ebony text-cream px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/fyb-week")}
          className="font-syne font-bold text-lg tracking-[3px] uppercase"
        >
          ZumboX
        </button>
        <span className="text-gold text-xs tracking-[2px] uppercase font-dm hidden sm:block">
          Pre-Order Form
        </span>
      </nav>

      {/* Header */}
      <div className="bg-forest text-cream px-6 py-10 text-center">
        <p className="text-gold text-xs tracking-[4px] uppercase font-dm mb-2">
          FYB Week 2026
        </p>
        <h1 className="font-syne font-bold text-2xl sm:text-4xl uppercase tracking-tight">
          Complete Your Pre-Order
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Section 1: Personal Info ── */}
        <section>
          <SectionHeader number={1} title="Personal Information" />
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="e.g. Adeola Okafor"
                className={inputClass("fullName")}
              />
              {errors.fullName && <FieldError msg={errors.fullName} />}
            </div>

            <div>
              <label className={labelClass}>Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@example.com"
                className={inputClass("email")}
              />
              {errors.email && <FieldError msg={errors.email} />}
            </div>

            <div>
              <label className={labelClass}>Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+234 800 000 0000"
                className={inputClass("phone")}
              />
              {errors.phone && <FieldError msg={errors.phone} />}
            </div>

            <div>
              <label className={labelClass}>Matric Number *</label>
              <input
                type="text"
                value={form.matricNumber}
                onChange={(e) => updateField("matricNumber", e.target.value)}
                placeholder="e.g. CSC/2021/001"
                className={inputClass("matricNumber")}
              />
              {errors.matricNumber && <FieldError msg={errors.matricNumber} />}
            </div>

            <div>
              <label className={labelClass}>Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                className={inputClass("gender")}
              >
                <option value="">Select gender…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <FieldError msg={errors.gender} />}
            </div>
          </div>
        </section>

        {/* ── Section 2: Design Selection ── */}
        <section ref={section2Ref}>
          <SectionHeader number={2} title="Design Selection" />

          {selectedDesignObj && (
            <div className="mb-4 border border-ebony/10 flex gap-4 p-4 bg-white">
              <div className="w-20 h-20 relative shrink-0">
                <UniformImage
                  design={selectedDesignObj}
                  className="absolute inset-0"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-syne font-bold text-sm uppercase tracking-wide">
                  {selectedDesignObj.name}
                </p>
                <p className="text-xs text-ebony/60 font-dm mt-1">
                  {selectedDesignObj.gender}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Change Design</label>
            <select
              value={form.selectedDesign}
              onChange={(e) => updateField("selectedDesign", e.target.value)}
              className={inputClass("selectedDesign")}
            >
              <option value="">Choose a design…</option>
              {UNIFORM_DESIGNS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.gender})
                </option>
              ))}
            </select>
            {errors.selectedDesign && <FieldError msg={errors.selectedDesign} />}
          </div>
        </section>

        {/* ── Section 3: Measurements ── */}
        <section ref={section3Ref}>
          <SectionHeader number={3} title="Measurements" />

          <div className="flex gap-3 mb-6">
            {(["self", "in-person"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, measurementMethod: method }))
                }
                className={`flex-1 py-3 font-syne font-bold text-xs uppercase tracking-[1.5px] border transition-colors ${
                  form.measurementMethod === method
                    ? "bg-forest text-cream border-forest"
                    : "bg-white text-forest border-forest hover:bg-forest/5"
                }`}
              >
                {method === "self" ? "I'll Measure Myself" : "In-Person Session"}
              </button>
            ))}
          </div>

          {form.measurementMethod === "self" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-ebony/60 font-dm">
                  Enter all values in <strong>inches</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="text-xs font-syne font-bold uppercase tracking-[1.5px] text-gold border border-gold px-3 py-1.5 hover:bg-gold hover:text-ebony transition-colors"
                >
                  Measurement Guide
                </button>
              </div>

              {(
                [
                  ["chest", "Chest / Bust (in)"],
                  ["waist", "Waist (in)"],
                  ["hips", "Hips (in)"],
                  ["shoulderWidth", "Shoulder Width (in)"],
                  ["shirtLength", "Shirt Length (in)"],
                  ["shortsSkirtLength", "Shorts / Skirt Length (in)"],
                ] as [keyof Measurements, string][]
              ).map(([key, label]) => (
                <div key={key}>
                  <label className={labelClass}>{label} *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={form.measurements[key] || ""}
                    onChange={(e) => updateMeasurement(key, e.target.value)}
                    placeholder="e.g. 38"
                    className={inputClass(`measurements.${key}`)}
                  />
                  {errors[`measurements.${key}`] && (
                    <FieldError msg={errors[`measurements.${key}`]!} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-forest/10 border border-forest/20 px-5 py-5 text-sm font-dm text-forest leading-relaxed">
              <p className="font-bold mb-1">You&apos;re all set for now.</p>
              <p>
                You&apos;ll be contacted within <strong>2 business days</strong> to
                schedule your in-person measurement session. Make sure your phone
                number is correct above.
              </p>
            </div>
          )}
        </section>

        {/* ── Section 4: Order Summary ── */}
        <section ref={section4Ref}>
          <SectionHeader number={4} title="Order Summary" />
          <div className="bg-white border border-ebony/10 divide-y divide-ebony/5">
            <SummaryRow
              label="Selected Design"
              value={selectedDesignObj?.name ?? "None selected"}
            />
            <SummaryRow
              label="Full Price"
              value={`₦${totalPrice.toLocaleString("en-NG")}`}
            />
            <SummaryRow
              label="Deposit Due Now"
              value={`₦${config.depositAmount.toLocaleString("en-NG")}`}
              highlight="green"
            />
            <SummaryRow
              label="Balance on Pickup"
              value={`₦${config.balanceAmount.toLocaleString("en-NG")}`}
            />
            <SummaryRow
              label="Pickup Date"
              value={config.pickupDate}
            />
          </div>
        </section>

        {/* ── Section 5: Payment ── */}
        <section ref={section5Ref}>
          <SectionHeader number={5} title="Payment" />

          <div className="bg-white border border-ebony/10 p-6 text-center space-y-4">
            <p className="font-dm text-sm text-ebony/70 leading-relaxed">
              Clicking the button below will open a secure Paystack payment popup.
              Only the deposit of{" "}
              <strong>₦{config.depositAmount.toLocaleString("en-NG")}</strong> is
              charged now. The balance is paid on pickup.
            </p>

            {payError && (
              <div className="bg-burgundy/10 border border-burgundy/30 text-burgundy text-sm font-dm px-4 py-3">
                {payError}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying || !config.preOrdersOpen}
              className="w-full bg-forest text-cream font-syne font-bold text-sm uppercase tracking-[2px] py-4 hover:bg-burgundy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paying
                ? "Processing…"
                : `Pay ₦${config.depositAmount.toLocaleString("en-NG")} Deposit`}
            </button>

            <p className="text-[11px] text-ebony/40 font-dm">
              Secured by Paystack · SSL Encrypted · No card details stored
            </p>
          </div>
        </section>
      </div>

      <MeasurementGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Footer */}
      <footer className="bg-forest text-cream/60 text-center py-6 px-4 text-xs font-dm tracking-wider mt-10">
        <p className="font-syne font-bold text-cream tracking-[3px] uppercase mb-1">
          ZumboX Fashion
        </p>
        <p>The Rare Form &mdash; FYB Week 2026</p>
      </footer>
    </div>
  );
}

// ── Small helper components ───────────────────────────────────────────────────

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-7 h-7 bg-forest text-cream flex items-center justify-center font-syne font-bold text-xs shrink-0">
        {number}
      </span>
      <h2 className="font-syne font-bold text-base uppercase tracking-[2px] text-ebony">
        {title}
      </h2>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="mt-1 text-xs text-burgundy font-dm">{msg}</p>;
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green";
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-xs font-dm uppercase tracking-wide text-ebony/60">
        {label}
      </span>
      <span
        className={`font-syne font-bold text-sm ${
          highlight === "green" ? "text-forest" : "text-ebony"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

const labelClass =
  "block text-xs font-dm font-semibold uppercase tracking-[1.5px] text-ebony/70 mb-2";

// Suspense boundary required for useSearchParams
export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <p className="font-syne text-forest">Loading…</p>
        </div>
      }
    >
      <OrderForm />
    </Suspense>
  );
}
