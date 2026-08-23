import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { customerSchema, type CustomerSchemaType } from "../../utils/customerSchema";
import type { Customer } from "../../types/customer";

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (values: CustomerSchemaType) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function CustomerForm({ customer, onSubmit, onCancel, submitLabel = "Save Customer" }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerSchemaType>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          fullName: customer.fullName,
          guardianName: customer.guardianName ?? "",
          cnic: customer.cnic ?? "",
          phone: customer.phone,
          altPhone: customer.altPhone ?? "",
          email: customer.email ?? "",
          address: customer.address ?? "",
          city: customer.city ?? "",
          notes: customer.notes ?? "",
        }
      : {
          fullName: "",
          guardianName: "",
          cnic: "",
          phone: "",
          altPhone: "",
          email: "",
          address: "",
          city: "",
          notes: "",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" error={errors.fullName?.message} {...register("fullName")} />
        <Input label="Father / Husband Name" error={errors.guardianName?.message} {...register("guardianName")} />
        <Input label="CNIC" placeholder="42101-1234567-1" error={errors.cnic?.message} {...register("cnic")} />
        <Input label="Phone Number" placeholder="0300-1234567" error={errors.phone?.message} {...register("phone")} />
        <Input label="Alternate Phone" error={errors.altPhone?.message} {...register("altPhone")} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="City" error={errors.city?.message} {...register("city")} />
      </div>
      <Textarea label="Address" error={errors.address?.message} {...register("address")} />
      <Textarea label="Notes" error={errors.notes?.message} {...register("notes")} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
