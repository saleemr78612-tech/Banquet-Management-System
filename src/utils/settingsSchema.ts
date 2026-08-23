import { z } from "zod";

export const settingsSchema = z.object({
  banquetName: z.string().min(2, "Banquet name is required"),
  logoDataUrl: z.string().optional(),
  address: z.string().min(2, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Enter a valid email address"),
  city: z.string().min(1, "City is required"),
});

export type SettingsSchemaType = z.infer<typeof settingsSchema>;
