export interface Customer {
  id: string;
  fullName: string;
  guardianName?: string;
  cnic?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  createdAt: string;
}

export type CustomerFormValues = Omit<Customer, "id" | "createdAt">;
