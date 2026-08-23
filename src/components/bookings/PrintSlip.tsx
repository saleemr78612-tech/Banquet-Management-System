import { getPaymentStatus, getRemainingAmount, type Booking } from "../../types/booking";
import type { Customer } from "../../types/customer";
import type { BusinessSettings } from "../../types/dashboard";
import { formatGregorian, formatPKR } from "../../utils/format";

interface PrintSlipProps {
  booking: Booking;
  customer?: Customer;
  settings: BusinessSettings;
}

export function PrintSlip({ booking, customer, settings }: PrintSlipProps) {
  const remaining = getRemainingAmount(booking.totalAmount, booking.paidAmount);
  const status = getPaymentStatus(booking.totalAmount, booking.paidAmount);

  return (
    <div id="print-slip" className="hidden print:block bg-white text-black p-10 font-body">
      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 rounded-full border-2 border-black flex items-center justify-center font-display text-xl font-bold overflow-hidden">
            {settings.logoDataUrl ? (
              <img src={settings.logoDataUrl} alt={settings.banquetName} className="h-full w-full object-cover" />
            ) : (
              settings.banquetName.charAt(0)
            )}
          </div>
          <div>
            <p className="font-display text-2xl font-bold">{settings.banquetName}</p>
            <p className="text-xs">{settings.address}</p>
            <p className="text-xs">{settings.phone} · {settings.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">Booking Slip</p>
          <p className="font-mono text-lg font-semibold">{booking.bookingNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Customer</p>
          <p className="font-semibold">{customer?.fullName ?? "—"}</p>
          <p className="text-sm">{customer?.phone}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Event</p>
          <p className="font-semibold">{booking.eventType}</p>
          <p className="text-sm">{booking.venue}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Gregorian Date</p>
          <p className="font-semibold">{formatGregorian(booking.eventDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Hijri Date</p>
          <p className="font-semibold">{booking.hijriDate}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Event Time</p>
          <p className="font-semibold">{booking.startTime} – {booking.endTime}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Guest Count</p>
          <p className="font-semibold">{booking.guests}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <tbody>
          <tr className="border-t border-black">
            <td className="py-2 text-sm">Total Amount</td>
            <td className="py-2 text-right font-mono font-semibold">{formatPKR(booking.totalAmount)}</td>
          </tr>
          <tr>
            <td className="py-2 text-sm">Paid Amount</td>
            <td className="py-2 text-right font-mono">{formatPKR(booking.paidAmount)}</td>
          </tr>
          <tr className="border-b-2 border-black">
            <td className="py-2 text-sm font-semibold">Remaining Amount</td>
            <td className="py-2 text-right font-mono font-bold">{formatPKR(remaining)}</td>
          </tr>
          <tr>
            <td className="py-2 text-sm">Payment Status</td>
            <td className="py-2 text-right font-semibold">{status}</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Terms & Conditions</p>
        <ul className="text-xs list-disc list-inside space-y-0.5 text-gray-700">
          <li>Advance payment is non-refundable in case of cancellation within 15 days of the event.</li>
          <li>Guest count and menu must be finalized 7 days prior to the event.</li>
          <li>Venue timing must be strictly observed; overtime charges apply beyond booked hours.</li>
          <li>Any damages to venue property will be charged separately.</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-12 mt-16">
        <div className="border-t border-black pt-2 text-center text-sm">Customer Signature</div>
        <div className="border-t border-black pt-2 text-center text-sm">Authorized Signature</div>
      </div>
    </div>
  );
}
