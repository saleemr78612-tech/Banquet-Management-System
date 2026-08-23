import { z } from "zod";
import { EVENT_TYPES, BOOKING_STATUSES } from "../types/booking";

export const bookingSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  phone: z.string().min(1),
  eventType: z.enum(EVENT_TYPES),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  guests: z.coerce.number().int().min(1, "Guest count must be at least 1"),
  venue: z.string().optional(),
  package: z.string().optional(),
  notes: z.string().optional(),
  totalAmount: z.coerce.number().min(1, "Total amount must be greater than 0"),
  status: z.enum(BOOKING_STATUSES),
});

export type BookingSchemaType = z.output<typeof bookingSchema>;
export type BookingSchemaInput = z.input<typeof bookingSchema>;

/** Cross-field check done separately from the schema to keep resolver typing simple. */
export function validateTimeRange(startTime: string, endTime: string): string | undefined {
  if (endTime <= startTime) return "End time must be after start time";
  return undefined;
}
