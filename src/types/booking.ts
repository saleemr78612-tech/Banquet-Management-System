export const EVENT_TYPES = [
  "Wedding",
  "Mehndi",
  "Walima",
  "Birthday",
  "Engagement",
  "Corporate Event",
  "Conference",
  "Other",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ["Unpaid", "Partially Paid", "Fully Paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  eventType: EventType;
  eventDate: string; // ISO yyyy-mm-dd
  hijriDate: string; // formatted display string
  startTime: string;
  endTime: string;
  guests: number;
  venue?: string;
  package?: string;
  notes?: string;
  totalAmount: number;
  paidAmount: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export type BookingFormValues = Omit<
  Booking,
  "id" | "bookingNumber" | "hijriDate" | "paidAmount" | "createdAt" | "updatedAt"
>;

export function getPaymentStatus(totalAmount: number, paidAmount: number): PaymentStatus {
  if (paidAmount <= 0) return "Unpaid";
  if (paidAmount >= totalAmount) return "Fully Paid";
  return "Partially Paid";
}

export function getRemainingAmount(totalAmount: number, paidAmount: number): number {
  return Math.max(totalAmount - paidAmount, 0);
}
