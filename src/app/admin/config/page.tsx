"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SiteConfig } from "@/types";

export default function AdminConfigPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  const [config, setConfig] = useState<Partial<SiteConfig>>({
    announcement_text: "",
    pre_orders_open: true,
    pickup_date: "July 26, 2026",
    deposit_amount: 15000,
    balance_amount: 10000,
    whatsapp_number: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("zumbox_admin_authed");
    if (saved === "true") {
      setAuthed(true);
      fetchConfig();
    }
  }, []);

  async function fetchConfig() {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch {
      setError("Failed to load config.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    setError("");
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaveMsg("Configuration saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="bg-white border border-ebony/10 p-8 max-w-sm w-full text-center">
          <p className="font-syne font-bold text-ebony mb-4">
            Please log in via the{" "}
            <button
              onClick={() => router.push("/admin")}
              className="underline text-forest"
            >
              admin dashboard
            </button>{" "}
            first.
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full border border-ebony/20 font-dm text-sm px-4 py-3 bg-white text-ebony focus:outline-none focus:border-forest";
  const labelClass =
    "block text-xs font-dm font-semibold uppercase tracking-[1.5px] text-ebony/70 mb-2";

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-ebony text-cream px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/admin")}
          className="font-syne font-bold text-lg tracking-[3px] uppercase"
        >
          ZumboX Admin
        </button>
        <span className="text-gold text-xs tracking-[2px] uppercase font-dm">
          Configuration
        </span>
      </nav>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-syne font-bold text-2xl uppercase tracking-tight text-ebony mb-8">
          Site Configuration
        </h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Announcement Banner */}
          <div className="bg-white border border-ebony/10 p-6">
            <h2 className="font-syne font-bold text-sm uppercase tracking-[2px] text-forest mb-4">
              Announcement Banner
            </h2>
            <div>
              <label className={labelClass}>Banner Text</label>
              <input
                type="text"
                value={config.announcement_text ?? ""}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, announcement_text: e.target.value }))
                }
                placeholder="Leave blank to hide the banner…"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-ebony/50 font-dm">
                Shown at the top of the gallery page in burgundy.
              </p>
            </div>
          </div>

          {/* Pre-Orders */}
          <div className="bg-white border border-ebony/10 p-6">
            <h2 className="font-syne font-bold text-sm uppercase tracking-[2px] text-forest mb-4">
              Pre-Order Status
            </h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() =>
                  setConfig((p) => ({ ...p, pre_orders_open: !p.pre_orders_open }))
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  config.pre_orders_open ? "bg-forest" : "bg-ebony/30"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    config.pre_orders_open ? "left-7" : "left-1"
                  }`}
                />
              </div>
              <span className="font-dm text-sm text-ebony">
                {config.pre_orders_open ? "Pre-orders are OPEN" : "Pre-orders are CLOSED"}
              </span>
            </label>
            <p className="mt-2 text-xs text-ebony/50 font-dm">
              When closed, the form is disabled and users see a notice.
            </p>
          </div>

          {/* Dates & Amounts */}
          <div className="bg-white border border-ebony/10 p-6 space-y-4">
            <h2 className="font-syne font-bold text-sm uppercase tracking-[2px] text-forest mb-4">
              Dates & Pricing
            </h2>

            <div>
              <label className={labelClass}>Pickup Date</label>
              <input
                type="text"
                value={config.pickup_date ?? ""}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, pickup_date: e.target.value }))
                }
                placeholder="e.g. July 26, 2026"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Deposit Amount (₦)</label>
              <input
                type="number"
                value={config.deposit_amount ?? 15000}
                min={0}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, deposit_amount: Number(e.target.value) }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Balance Amount (₦)</label>
              <input
                type="number"
                value={config.balance_amount ?? 10000}
                min={0}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, balance_amount: Number(e.target.value) }))
                }
                className={inputClass}
              />
            </div>

            <div className="bg-cream/60 border border-ebony/5 px-4 py-3">
              <p className="text-xs font-dm text-ebony/60">
                Full Price:{" "}
                <strong>
                  ₦{((config.deposit_amount ?? 0) + (config.balance_amount ?? 0)).toLocaleString("en-NG")}
                </strong>
              </p>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-white border border-ebony/10 p-6">
            <h2 className="font-syne font-bold text-sm uppercase tracking-[2px] text-forest mb-4">
              Support Contact
            </h2>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input
                type="tel"
                value={config.whatsapp_number ?? ""}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, whatsapp_number: e.target.value }))
                }
                placeholder="+234 800 000 0000"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-ebony/50 font-dm">
                Include country code. Used for support links.
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-burgundy/10 border border-burgundy/30 text-burgundy text-sm font-dm px-4 py-3">
              {error}
            </div>
          )}
          {saveMsg && (
            <div className="bg-forest/10 border border-forest/30 text-forest text-sm font-dm px-4 py-3">
              {saveMsg}
            </div>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-forest text-cream font-syne font-bold text-sm uppercase tracking-[2px] py-4 hover:bg-burgundy transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
