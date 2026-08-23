import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { DatePicker } from "../ui/DatePicker";
import { Button } from "../ui/Button";
import {
  bookingSchema,
  validateTimeRange,
  type BookingSchemaType,
  type BookingSchemaInput,
} from "../../utils/bookingSchema";
import { EVENT_TYPES, BOOKING_STATUSES, type Booking } from "../../types/booking";
import { useData } from "../../context/DataContext";
import { computeSuggestedRate } from "../../types/pricing";
import { gregorianToHijri, HIJRI_MONTHS } from "../../utils/hijri";
import { formatPKR } from "../../utils/format";
import { Sparkles } from "lucide-react";

interface BookingFormProps {
  booking?: Booking;
  onSubmit: (values: BookingSchemaType) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function BookingForm({ booking, onSubmit, onCancel, submitLabel = "Save Booking" }: BookingFormProps) {
  const { customers, getCustomerById, pricingRules } = useData();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingSchemaInput, unknown, BookingSchemaType>({
    resolver: zodResolver(bookingSchema),
    defaultValues: booking
      ? {
          customerId: booking.customerId,
          phone: getCustomerById(booking.customerId)?.phone ?? "",
          eventType: booking.eventType,
          eventDate: booking.eventDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          guests: booking.guests,
          venue: booking.venue ?? "",
          package: booking.package ?? "",
          notes: booking.notes ?? "",
          totalAmount: booking.totalAmount,
          status: booking.status,
        }
      : {
          customerId: "",
          phone: "",
          eventType: "Wedding",
          eventDate: "",
          startTime: "18:00",
          endTime: "23:00",
          guests: 100,
          venue: "",
          package: "",
          notes: "",
          totalAmount: 0,
          status: "Pending",
        },
  });

  const selectedCustomerId = watch("customerId");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const eventDate = watch("eventDate");
  const timeRangeError = validateTimeRange(startTime, endTime);

  const suggestedRateInfo = (() => {
    if (!eventDate) return null;
    const dateObj = new Date(eventDate);
    if (isNaN(dateObj.getTime())) return null;
    const hijri = gregorianToHijri(dateObj);
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const suggested = computeSuggestedRate(eventDate, pricingRules, hijri.month);
    const monthAdjustment = pricingRules.hijriMonthAdjustments[hijri.month] ?? 1;
    return { suggested, weekday, hijriMonthName: HIJRI_MONTHS[hijri.month - 1], monthAdjustment };
  })();

  useEffect(() => {
    if (!selectedCustomerId) return;
    const customer = getCustomerById(selectedCustomerId);
    if (customer) setValue("phone", customer.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerId]);

  const submitWithTimeCheck = (values: BookingSchemaType) => {
    if (validateTimeRange(values.startTime, values.endTime)) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(submitWithTimeCheck)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <Select label="Customer" error={errors.customerId?.message} {...field}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </Select>
          )}
        />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} disabled />
      </div>

      <div className="seal-divider" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="eventType"
          control={control}
          render={({ field }) => (
            <Select label="Event Type" error={errors.eventType?.message} {...field}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          )}
        />
        <DatePicker label="Event Date" error={errors.eventDate?.message} {...register("eventDate")} />
        <Input label="Start Time" type="time" error={errors.startTime?.message} {...register("startTime")} />
        <Input label="End Time" type="time" error={errors.endTime?.message ?? timeRangeError} {...register("endTime")} />
        <Input
          label="Number of Guests"
          type="number"
          error={errors.guests?.message}
          {...register("guests")}
        />
        <Input label="Venue" placeholder="e.g. Grand Hall A" error={errors.venue?.message} {...register("venue")} />
        <Input
          label="Package"
          placeholder="e.g. Gold Package"
          error={errors.package?.message}
          {...register("package")}
        />
        <div>
          <Input
            label="Total Amount (PKR)"
            type="number"
            error={errors.totalAmount?.message}
            {...register("totalAmount")}
          />
          {suggestedRateInfo && (
            <button
              type="button"
              onClick={() => setValue("totalAmount", suggestedRateInfo.suggested)}
              className="mt-1.5 flex items-center gap-1.5 text-xs text-maroon-500 hover:text-maroon-600"
            >
              <Sparkles size={12} />
              Suggested: {formatPKR(suggestedRateInfo.suggested)} ({suggestedRateInfo.weekday} rate ·{" "}
              {suggestedRateInfo.hijriMonthName} {suggestedRateInfo.monthAdjustment === 1
                ? "standard season"
                : suggestedRateInfo.monthAdjustment > 1
                ? `peak season +${Math.round((suggestedRateInfo.monthAdjustment - 1) * 100)}%`
                : `off season ${Math.round((suggestedRateInfo.monthAdjustment - 1) * 100)}%`}
              )
            </button>
          )}
        </div>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select label="Booking Status" error={errors.status?.message} {...field}>
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          )}
        />
      </div>

      <Textarea
        label="Notes"
        placeholder="Additional requirements..."
        error={errors.notes?.message}
        {...register("notes")}
      />

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
