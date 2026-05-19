"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types";
import { exportToCSV, formatDate } from "@/lib/utils";

// NOTE: This uses a simple client-side password check for now.
// TODO: Replace with proper NextAuth or Supabase Auth before production.
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "ZUMBOX_ADMIN_2026";

type FilterState = {
  design: string;
  gender: string;
  paymentStatus: string;
  measurementMethod: string;
  search: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    design: "",
    gender: "",
    paymentStatus: "",
    measurementMethod: "",
    search: "",
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("zumbox_admin_authed");
    if (saved === "true") {
      setAuthed(true);
      fetchOrders();
    }
  }, [fetchOrders]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("zumbox_admin_authed", "true");
      setAuthed(true);
      fetchOrders();
    } else {
      setPasswordError("Incorrect password. Try again.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("zumbox_admin_authed");
    setAuthed(false);
    setOrders([]);
  }

  async function markCompleted(orderId: string) {
    await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: "completed" }),
    });
    fetchOrders();
  }

  function handleExport() {
    const rows = filteredOrders.map((o) => ({
      order_id: o.order_id,
      date: formatDate(o.created_at),
      name: o.student_name,
      email: o.email,
      phone: o.phone,
      matric: o.student_id ?? "",
      gender: o.gender,
      design: o.selected_design,
      measurement_method: o.in_person_measurement ? "In-person" : "Self",
      payment_status: o.payment_status,
      deposit: o.deposit_amount,
      balance: o.balance_amount,
      paystack_ref: o.paystack_reference,
    }));
    exportToCSV(rows, `zumbox-orders-${Date.now()}.csv`);
  }

  // Derived stats
  const totalOrders = orders.length;
  const totalDeposits = orders
    .filter((o) => o.payment_status !== "pending")
    .reduce((sum, o) => sum + o.deposit_amount, 0);
  const pendingMeasurements = orders.filter(
    (o) => o.in_person_measurement && o.payment_status !== "completed"
  ).length;

  // Filtered list
  const filteredOrders = orders.filter((o) => {
    const q = filters.search.toLowerCase();
    const matchSearch =
      !q ||
      o.student_name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.order_id.toLowerCase().includes(q);
    const matchDesign = !filters.design || o.selected_design === filters.design;
    const matchGender = !filters.gender || o.gender === filters.gender;
    const matchStatus =
      !filters.paymentStatus || o.payment_status === filters.paymentStatus;
    const matchMeasure =
      !filters.measurementMethod ||
      (filters.measurementMethod === "in-person"
        ? o.in_person_measurement
        : !o.in_person_measurement);
    return matchSearch && matchDesign && matchGender && matchStatus && matchMeasure;
  });

  // Unique designs for filter dropdown
  const uniqueDesigns = orders
    .map((o) => o.selected_design)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-ebony/10">
          <div className="bg-ebony text-cream px-6 py-5 text-center">
            <p className="font-syne font-bold text-lg tracking-[3px] uppercase">
              ZumboX Admin
            </p>
            <p className="text-gold text-xs mt-1 tracking-[2px]">
              Restricted Access
            </p>
          </div>
          <form onSubmit={handleLogin} className="px-6 py-8 space-y-4">
            <div>
              <label className="block text-xs font-dm font-semibold uppercase tracking-[1.5px] text-ebony/70 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Enter password…"
                className="w-full border border-ebony/20 font-dm text-sm px-4 py-3 bg-white text-ebony focus:outline-none focus:border-forest"
                autoFocus
              />
              {passwordError && (
                <p className="mt-1 text-xs text-burgundy font-dm">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-forest text-cream font-syne font-bold text-xs uppercase tracking-[2px] py-3 hover:bg-burgundy transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-ebony text-cream px-6 py-4 flex items-center justify-between">
        <span className="font-syne font-bold text-lg tracking-[3px] uppercase">
          ZumboX Admin
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/config")}
            className="text-xs font-syne uppercase tracking-[1.5px] text-gold border border-gold/40 px-4 py-2 hover:bg-gold/10 transition-colors"
          >
            Config
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-syne uppercase tracking-[1.5px] text-cream/60 hover:text-cream transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Orders" value={totalOrders.toString()} />
          <StatCard
            label="Total Deposits Collected"
            value={`₦${totalDeposits.toLocaleString("en-NG")}`}
          />
          <StatCard
            label="Pending Measurements"
            value={pendingMeasurements.toString()}
            highlight
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-ebony/10 p-4 mb-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, email, or order ID…"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="border border-ebony/20 font-dm text-sm px-3 py-2 flex-1 min-w-48 focus:outline-none focus:border-forest"
          />

          {/* Filters */}
          <FilterSelect
            value={filters.design}
            onChange={(v) => setFilters((p) => ({ ...p, design: v }))}
            label="Design"
            options={uniqueDesigns}
          />
          <FilterSelect
            value={filters.gender}
            onChange={(v) => setFilters((p) => ({ ...p, gender: v }))}
            label="Gender"
            options={["Male", "Female"]}
          />
          <FilterSelect
            value={filters.paymentStatus}
            onChange={(v) => setFilters((p) => ({ ...p, paymentStatus: v }))}
            label="Status"
            options={["pending", "paid", "completed"]}
          />
          <FilterSelect
            value={filters.measurementMethod}
            onChange={(v) =>
              setFilters((p) => ({ ...p, measurementMethod: v }))
            }
            label="Measurement"
            options={["self", "in-person"]}
          />

          <button
            onClick={handleExport}
            className="bg-forest text-cream font-syne font-bold text-xs uppercase tracking-[2px] px-5 py-2 hover:bg-burgundy transition-colors shrink-0"
          >
            Export CSV
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center font-dm text-ebony/60 py-12">
            Loading orders…
          </p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center font-dm text-ebony/60 py-12">
            No orders match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-dm bg-white border border-ebony/10">
              <thead>
                <tr className="bg-ebony text-cream text-xs uppercase tracking-[1.5px]">
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Design</th>
                  <th className="px-4 py-3 text-left">Gender</th>
                  <th className="px-4 py-3 text-left">Measure</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <>
                    <tr
                      key={order.order_id}
                      className="border-b border-ebony/5 hover:bg-cream/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-syne font-bold text-xs tracking-widest text-gold">
                        {order.order_id}
                      </td>
                      <td className="px-4 py-3 text-xs text-ebony/60 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-NG")}
                      </td>
                      <td className="px-4 py-3 font-semibold">{order.student_name}</td>
                      <td className="px-4 py-3 capitalize">{order.selected_design.replace(/-/g, " ")}</td>
                      <td className="px-4 py-3">{order.gender}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] uppercase tracking-[1px] px-2 py-0.5 border font-semibold ${
                            order.in_person_measurement
                              ? "border-burgundy text-burgundy"
                              : "border-forest text-forest"
                          }`}
                        >
                          {order.in_person_measurement ? "In-person" : "Self"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.payment_status} />
                      </td>
                      <td className="px-4 py-3 flex gap-2 flex-wrap">
                        <button
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === order.order_id
                                ? null
                                : order.order_id
                            )
                          }
                          className="text-[10px] uppercase tracking-[1px] border border-ebony/30 text-ebony/60 hover:text-ebony px-2 py-1 transition-colors"
                        >
                          {expandedRow === order.order_id ? "Collapse" : "Details"}
                        </button>
                        {order.payment_status !== "completed" && (
                          <button
                            onClick={() => markCompleted(order.order_id)}
                            className="text-[10px] uppercase tracking-[1px] bg-forest text-cream px-2 py-1 hover:bg-burgundy transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedRow === order.order_id && (
                      <tr key={`${order.order_id}-expanded`} className="bg-cream/60">
                        <td colSpan={8} className="px-6 py-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-dm">
                            <div>
                              <p className="font-bold uppercase tracking-[1.5px] mb-2 text-forest">
                                Contact
                              </p>
                              <p>Email: {order.email}</p>
                              <p>Phone: {order.phone}</p>
                              <p>Matric: {order.student_id ?? "—"}</p>
                              <p>Paystack Ref: {order.paystack_reference}</p>
                            </div>
                            {!order.in_person_measurement && order.measurements && (
                              <div>
                                <p className="font-bold uppercase tracking-[1.5px] mb-2 text-forest">
                                  Measurements (inches)
                                </p>
                                {Object.entries(order.measurements).map(
                                  ([k, v]) => (
                                    <p key={k}>
                                      {k
                                        .replace(/([A-Z])/g, " $1")
                                        .trim()}: {v}&Prime;
                                    </p>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-5 border ${highlight ? "bg-burgundy/10 border-burgundy/20" : "bg-white border-ebony/10"}`}
    >
      <p className="text-xs font-dm uppercase tracking-[1.5px] text-ebony/60 mb-1">
        {label}
      </p>
      <p className="font-syne font-bold text-2xl text-ebony">{value}</p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-ebony/20 font-dm text-xs px-3 py-2 bg-white text-ebony focus:outline-none focus:border-forest"
    >
      <option value="">All {label}s</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-ebony/10 text-ebony/60",
    paid: "bg-forest/10 text-forest",
    completed: "bg-gold/20 text-ebony",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-[1px] px-2 py-0.5 font-semibold ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  );
}
