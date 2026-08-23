import type { Customer } from "../types/customer";
import type { Booking } from "../types/booking";
import type { Payment } from "../types/payment";
import type { BusinessSettings } from "../types/dashboard";
import type { PricingRules } from "../types/pricing";
import { seedCustomers, seedBookings, seedPayments, defaultSettings } from "../data/mockData";
import { defaultPricingRules } from "../types/pricing";

const KEYS = {
  customers: "bm_customers",
  bookings: "bm_bookings",
  payments: "bm_payments",
  settings: "bm_settings",
  pricingRules: "bm_pricing_rules",
  bookingSeq: "bm_booking_seq",
  seeded: "bm_seeded_v1",
  theme: "bm_theme",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Seed demo data once, on first run only. Never overwrites existing user data. */
export function ensureSeeded(): void {
  if (localStorage.getItem(KEYS.seeded)) return;
  write(KEYS.customers, seedCustomers);
  write(KEYS.bookings, seedBookings);
  write(KEYS.payments, seedPayments);
  write(KEYS.settings, defaultSettings);
  write(KEYS.pricingRules, defaultPricingRules);
  localStorage.setItem(KEYS.bookingSeq, String(seedBookings.length));
  localStorage.setItem(KEYS.seeded, "1");
}

// ---------- Customers ----------
export function getCustomers(): Customer[] {
  return read<Customer[]>(KEYS.customers, []);
}
export function saveCustomers(customers: Customer[]): void {
  write(KEYS.customers, customers);
}

// ---------- Bookings ----------
export function getBookings(): Booking[] {
  return read<Booking[]>(KEYS.bookings, []);
}
export function saveBookings(bookings: Booking[]): void {
  write(KEYS.bookings, bookings);
}

/** Generates the next unique booking number, e.g. BOOK-2026-0001 */
export function getNextBookingNumber(eventDate: string): string {
  const year = new Date(eventDate).getFullYear() || new Date().getFullYear();
  const seq = read<number>(KEYS.bookingSeq, 0) + 1;
  localStorage.setItem(KEYS.bookingSeq, String(seq));
  return `BOOK-${year}-${String(seq).padStart(4, "0")}`;
}

// ---------- Payments ----------
export function getPayments(): Payment[] {
  return read<Payment[]>(KEYS.payments, []);
}
export function savePayments(payments: Payment[]): void {
  write(KEYS.payments, payments);
}

// ---------- Settings ----------
export function getSettings(): BusinessSettings {
  return read<BusinessSettings>(KEYS.settings, defaultSettings);
}
export function saveSettings(settings: BusinessSettings): void {
  write(KEYS.settings, settings);
}

// ---------- Pricing Rules ----------
export function getPricingRules(): PricingRules {
  return read<PricingRules>(KEYS.pricingRules, defaultPricingRules);
}
export function savePricingRules(rules: PricingRules): void {
  write(KEYS.pricingRules, rules);
}

// ---------- Theme ----------
export function getTheme(): "light" | "dark" {
  return read<"light" | "dark">(KEYS.theme, "light");
}
export function saveTheme(theme: "light" | "dark"): void {
  write(KEYS.theme, theme);
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
