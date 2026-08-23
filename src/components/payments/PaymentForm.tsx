import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { DatePicker } from "../ui/DatePicker";
import { Button } from "../ui/Button";
import { paymentSchema, type PaymentSchemaType, type PaymentSchemaInput } from "../../utils/paymentSchema";
import { PAYMENT_METHODS } from "../../types/payment";
import { getRemainingAmount, type Booking } from "../../types/booking";
import { formatPKR } from "../../utils/format";

interface PaymentFormProps {
  booking: Booking;
  onSubmit: (values: PaymentSchemaType) => void;
  onCancel: () => void;
}

export function PaymentForm({ booking, onSubmit, onCancel }: PaymentFormProps) {
  const remaining = getRemainingAmount(booking.totalAmount, booking.paidAmount);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PaymentSchemaInput, unknown, PaymentSchemaType>({
    resolver: zodResolver(
      paymentSchema.refine((v) => v.amount <= remaining, {
        message: `Amount cannot exceed remaining balance of ${formatPKR(remaining)}`,
        path: ["amount"],
      })
    ),
    defaultValues: {
      bookingId: booking.id,
      amount: remaining,
      method: "Cash",
      paymentDate: new Date().toISOString().slice(0, 10),
      referenceNumber: "",
      notes: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-lg bg-ivory-200 dark:bg-ink-600/30 px-4 py-3 text-sm flex justify-between">
        <span className="text-ink-500 dark:text-ivory-300">Remaining balance</span>
        <span className="font-mono-tabular font-semibold text-ink-800 dark:text-ivory-100">
          {formatPKR(remaining)}
        </span>
      </div>

      <input type="hidden" {...register("bookingId")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Amount (PKR)"
          type="number"
          error={errors.amount?.message}
          {...register("amount")}
        />
        <Controller
          name="method"
          control={control}
          render={({ field }) => (
            <Select label="Payment Method" error={errors.method?.message} {...field}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
          )}
        />
        <DatePicker label="Payment Date" error={errors.paymentDate?.message} {...register("paymentDate")} />
        <Input label="Reference Number" error={errors.referenceNumber?.message} {...register("referenceNumber")} />
      </div>

      <Textarea label="Notes" error={errors.notes?.message} {...register("notes")} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || remaining <= 0}>
          Add Payment
        </Button>
      </div>
    </form>
  );
}
