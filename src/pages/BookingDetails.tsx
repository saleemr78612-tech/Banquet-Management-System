import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Printer, Wallet, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card";
import { Badge, bookingStatusTone, paymentStatusTone } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { BookingForm } from "../components/bookings/BookingForm";
import { PaymentForm } from "../components/payments/PaymentForm";
import { PrintSlip } from "../components/bookings/PrintSlip";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { getPaymentStatus, getRemainingAmount } from "../types/booking";
import { formatGregorian, formatPKR, formatShortDate } from "../utils/format";
import type { BookingSchemaType } from "../utils/bookingSchema";
import type { PaymentSchemaType } from "../utils/paymentSchema";

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    getBookingById,
    getCustomerById,
    getPaymentsForBooking,
    updateBooking,
    deleteBooking,
    addPayment,
    settings,
  } = useData();

  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const booking = id ? getBookingById(id) : undefined;

  if (!booking) {
    return (
      <EmptyState
        title="Booking not found"
        description="This booking may have been deleted."
        action={
          <Button onClick={() => navigate("/bookings")}>
            <ArrowLeft size={16} /> Back to Bookings
          </Button>
        }
      />
    );
  }

  const customer = getCustomerById(booking.customerId);
  const payments = getPaymentsForBooking(booking.id);
  const remaining = getRemainingAmount(booking.totalAmount, booking.paidAmount);
  const paymentStatus = getPaymentStatus(booking.totalAmount, booking.paidAmount);

  const handleEditSubmit = (values: BookingSchemaType) => {
    const { phone: _phone, ...rest } = values;
    updateBooking(booking.id, rest);
    showToast("Booking updated successfully");
    setEditOpen(false);
  };

  const handlePaymentSubmit = (values: PaymentSchemaType) => {
    addPayment(values);
    showToast("Payment added successfully");
    setPaymentOpen(false);
  };

  const handleDelete = () => {
    deleteBooking(booking.id);
    showToast("Booking deleted successfully");
    navigate("/bookings");
  };

  return (
    <div className="space-y-5">
      <PrintSlip booking={booking} customer={customer} settings={settings} />

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => navigate("/bookings")}
          className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ivory-300 hover:text-maroon-500"
        >
          <ArrowLeft size={15} /> Back to Bookings
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={15} /> Print Slip
          </Button>
          <Button variant="outline" onClick={() => setPaymentOpen(true)} disabled={remaining <= 0}>
            <Wallet size={15} /> Add Payment
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil size={15} /> Edit
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={15} /> Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-2xl font-semibold text-ink-800 dark:text-ivory-100">
              {booking.bookingNumber}
            </h2>
            <Badge tone={bookingStatusTone(booking.status)}>{booking.status}</Badge>
            <Badge tone={paymentStatusTone(paymentStatus)}>{paymentStatus}</Badge>
          </div>
          <p className="text-sm text-ink-400 mt-1">
            {booking.eventType} · {formatGregorian(booking.eventDate)} · {booking.hijriDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 print:hidden">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <InfoField label="Event Type" value={booking.eventType} />
              <InfoField label="Gregorian Date" value={formatGregorian(booking.eventDate)} />
              <InfoField label="Hijri Date" value={booking.hijriDate} />
              <InfoField label="Time" value={`${booking.startTime} – ${booking.endTime}`} />
              <InfoField label="Guests" value={String(booking.guests)} />
              <InfoField label="Venue" value={booking.venue || "—"} />
              <InfoField label="Package" value={booking.package || "—"} />
              <InfoField label="Status" value={booking.status} />
            </CardBody>
            {booking.notes && (
              <CardBody className="pt-0">
                <p className="text-xs text-ink-400 mb-1">Notes</p>
                <p className="text-sm text-ink-600 dark:text-ivory-200">{booking.notes}</p>
              </CardBody>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {payments.length === 0 ? (
                <EmptyState title="No payments recorded" description="Add the first payment for this booking." />
              ) : (
                <div className="divide-y divide-ink-100/60 dark:divide-ink-600/60">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-ink-800 dark:text-ivory-100">{p.method}</p>
                        <p className="text-xs text-ink-400">
                          {formatShortDate(p.paymentDate)}
                          {p.referenceNumber && ` · Ref: ${p.referenceNumber}`}
                        </p>
                      </div>
                      <span className="font-mono-tabular text-sm font-semibold text-success-600 dark:text-success-500">
                        + {formatPKR(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <SummaryRow label="Total Amount" value={formatPKR(booking.totalAmount)} />
              <SummaryRow label="Paid Amount" value={formatPKR(booking.paidAmount)} tone="success" />
              <div className="seal-divider" />
              <SummaryRow label="Remaining" value={formatPKR(remaining)} tone={remaining > 0 ? "warning" : "success"} bold />
            </CardBody>
          </Card>

          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardBody className="space-y-2.5 text-sm">
                <Link to="/customers" className="font-medium text-ink-800 dark:text-ivory-100 hover:text-maroon-500">
                  {customer.fullName}
                </Link>
                <p className="flex items-center gap-2 text-ink-500 dark:text-ivory-300">
                  <Phone size={13} /> {customer.phone}
                </p>
                {customer.email && (
                  <p className="flex items-center gap-2 text-ink-500 dark:text-ivory-300">
                    <Mail size={13} /> {customer.email}
                  </p>
                )}
                {customer.address && (
                  <p className="flex items-center gap-2 text-ink-500 dark:text-ivory-300">
                    <MapPin size={13} /> {customer.address}
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Booking" size="lg">
        <BookingForm
          booking={booking}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditOpen(false)}
          submitLabel="Update Booking"
        />
      </Modal>

      <Modal open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Add Payment" size="md">
        <PaymentForm booking={booking} onSubmit={handlePaymentSubmit} onCancel={() => setPaymentOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Booking"
        message={`Are you sure you want to delete booking ${booking.bookingNumber}? This will also remove its associated payment records.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="text-ink-700 dark:text-ivory-200 font-medium">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
  bold?: boolean;
}) {
  const toneClass =
    tone === "success"
      ? "text-success-600 dark:text-success-500"
      : tone === "warning"
      ? "text-warning-600 dark:text-warning-500"
      : "text-ink-700 dark:text-ivory-200";
  return (
    <div className="flex justify-between items-center">
      <span className="text-ink-500 dark:text-ivory-300">{label}</span>
      <span className={`font-mono-tabular ${bold ? "font-bold text-base" : "font-medium"} ${toneClass}`}>
        {value}
      </span>
    </div>
  );
}
