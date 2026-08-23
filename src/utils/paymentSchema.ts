import { z } from "zod";
import { PAYMENT_METHODS } from "../types/payment";

export const paymentSchema = z.object({
  bookingId: z.string().min(1, "Please select a booking"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  method: z.enum(PAYMENT_METHODS),
  paymentDate: z.string().min(1, "Payment date is required"),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentSchemaType = z.output<typeof paymentSchema>;
export type PaymentSchemaInput = z.input<typeof paymentSchema>;
