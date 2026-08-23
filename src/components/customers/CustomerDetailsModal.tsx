import { Modal } from "../ui/Modal";
import { Badge, bookingStatusTone } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { useData } from "../../context/DataContext";
import { formatShortDate, formatPKR } from "../../utils/format";
import type { Customer } from "../../types/customer";

interface CustomerDetailsModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
  const { getBookingsForCustomer } = useData();
  const bookings = customer ? getBookingsForCustomer(customer.id) : [];

  return (
    <Modal open={!!customer} onClose={onClose} title={customer?.fullName ?? ""} size="lg">
      {customer && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Field label="Phone" value={customer.phone} />
            <Field label="Alt. Phone" value={customer.altPhone} />
            <Field label="Email" value={customer.email} />
            <Field label="CNIC" value={customer.cnic} />
            <Field label="City" value={customer.city} />
            <Field label="Guardian" value={customer.guardianName} />
          </div>
          {customer.address && <Field label="Address" value={customer.address} />}
          {customer.notes && <Field label="Notes" value={customer.notes} />}

          <div className="seal-divider" />

          <div>
            <p className="text-sm font-semibold text-ink-800 dark:text-ivory-100 mb-3">
              Booking History ({bookings.length})
            </p>
            {bookings.length === 0 ? (
              <EmptyState title="No bookings yet" description="This customer has no bookings on record." />
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-ink-100 dark:border-ink-600 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-800 dark:text-ivory-100">
                        {b.eventType} · {b.bookingNumber}
                      </p>
                      <p className="text-xs text-ink-400">{formatShortDate(b.eventDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono-tabular text-ink-600 dark:text-ivory-300">
                        {formatPKR(b.totalAmount)}
                      </span>
                      <Badge tone={bookingStatusTone(b.status)}>{b.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="text-ink-700 dark:text-ivory-200">{value}</p>
    </div>
  );
}
