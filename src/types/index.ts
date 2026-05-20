// ─── Domain types ────────────────────────────────────────────────────────────

export type Gender = "Male" | "Female";

export type PaymentStatus = "pending" | "paid" | "completed";

export type MeasurementMethod = "self" | "in-person";

export interface Measurements {
  chest?: string;
  waist?: string;
  hips?: string;
  shoulderWidth?: string;
  shirtLength?: string;
  shortsSkirtLength?: string;
}

export interface Order {
  id: string;
  order_id: string;
  created_at: string;
  student_name: string;
  email: string;
  phone: string;
  student_id?: string;
  gender: Gender;
  selected_design: string;
  measurements?: Measurements;
  in_person_measurement: boolean;
  payment_status: PaymentStatus;
  paystack_reference: string;
  deposit_amount: number;
  balance_amount: number;
}

export interface SiteConfig {
  id: number;
  announcement_text: string;
  pre_orders_open: boolean;
  pickup_date: string;
  deposit_amount: number;
  balance_amount: number;
  whatsapp_number: string;
}

// ─── Uniform designs ─────────────────────────────────────────────────────────

export interface UniformDesign {
  id: string;
  name: string;
  gender: Gender;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  imageSrc?: string;
  backImageSrc?: string;
}

export const UNIFORM_DESIGNS: UniformDesign[] = [
  {
    id: "classic-green",
    name: "Classic Green",
    gender: "Male",
    primaryColor: "#1B3A2D",
    secondaryColor: "#F5F0E8",
    accentColor: "#C9A96E",
  },
  {
    id: "midnight-black",
    name: "Midnight Black",
    gender: "Male",
    primaryColor: "#0D0D0D",
    secondaryColor: "#1B3A2D",
    accentColor: "#C9A96E",
  },
  {
    id: "burgundy-prep",
    name: "Burgundy Prep",
    gender: "Female",
    primaryColor: "#4A0E1A",
    secondaryColor: "#F5F0E8",
    accentColor: "#C9A96E",
  },
  {
    id: "cream-edition",
    name: "Cream Edition",
    gender: "Female",
    primaryColor: "#F5F0E8",
    secondaryColor: "#1B3A2D",
    accentColor: "#4A0E1A",
  },
];
