import { z } from "zod";

export const customerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  guardianName: z.string().optional(),
  cnic: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{5}-\d{7}-\d{1}$/.test(v), {
      message: "CNIC format should be 42101-1234567-1",
    }),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((v) => /^0\d{3}-?\d{7}$/.test(v.replace(/\s/g, "")), {
      message: "Enter a valid phone, e.g. 0300-1234567",
    }),
  altPhone: z.string().optional(),
  email: z.string().optional().refine((v) => !v || z.string().email().safeParse(v).success, {
    message: "Enter a valid email address",
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerSchemaType = z.infer<typeof customerSchema>;
