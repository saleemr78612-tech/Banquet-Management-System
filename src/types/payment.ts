export const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "JazzCash",
  "Easypaisa",
  "Card",
  "Other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string; // ISO yyyy-mm-dd
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export type PaymentFormValues = Omit<Payment, "id" | "createdAt">;
