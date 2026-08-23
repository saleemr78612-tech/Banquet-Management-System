import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/Button";
import { SearchBar } from "../components/ui/SearchBar";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Table, type TableColumn } from "../components/ui/Table";
import { Pagination } from "../components/ui/Pagination";
import { PaymentForm } from "../components/payments/PaymentForm";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { PAYMENT_METHODS, type Payment } from "../types/payment";
import { formatShortDate, formatPKR } from "../utils/format";

const PAGE_SIZE = 10;

export default function Payments() {
  const { payments, bookings, getBookingById, getCustomerById, addPayment, deletePayment } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [bookingIdForNew, setBookingIdForNew] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [page, setPage] = useState(1);

  const eligibleBookings = bookings.filter((b) => b.paidAmount < b.totalAmount);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      const booking = getBookingById(p.bookingId);
      const customer = booking ? getCustomerById(booking.customerId) : undefined;
      const matchesSearch =
        !q ||
        booking?.bookingNumber.toLowerCase().includes(q) ||
        customer?.fullName.toLowerCase().includes(q) ||
        p.referenceNumber?.toLowerCase().includes(q);
      const matchesMethod = !methodFilter || p.method === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [payments, search, methodFilter, getBookingById, getCustomerById]);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedBooking = bookingIdForNew ? getBookingById(bookingIdForNew) : undefined;

  const handleSubmit = (values: Parameters<typeof addPayment>[0]) => {
    addPayment(values);
    showToast("Payment added successfully");
    setFormOpen(false);
    setBookingIdForNew("");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePayment(deleteTarget.id);
    showToast("Payment removed and booking balance updated");
    setDeleteTarget(null);
  };

  const columns: TableColumn<Payment>[] = [
    {
      key: "booking",
      header: "Booking #",
      mobilePrimary: true,
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/bookings/${p.bookingId}`);
          }}
          className="flex items-center gap-1 font-mono-tabular text-xs text-maroon-500 hover:underline"
        >
          {getBookingById(p.bookingId)?.bookingNumber ?? "—"} <ExternalLink size={11} />
        </button>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (p) => {
        const booking = getBookingById(p.bookingId);
        return booking ? getCustomerById(booking.customerId)?.fullName ?? "—" : "—";
      },
    },
    { key: "amount", header: "Amount", render: (p) => formatPKR(p.amount) },
    { key: "method", header: "Method", render: (p) => p.method },
    { key: "date", header: "Payment Date", render: (p) => formatShortDate(p.paymentDate) },
    { key: "reference", header: "Reference", render: (p) => p.referenceNumber || "—" },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(p);
          }}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-100 dark:hover:bg-danger-500/15 hover:text-danger-500"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-800 dark:text-ivory-100">Payments</h2>
          <p className="text-sm text-ink-400">{filtered.length} of {payments.length} payments</p>
        </div>
        <Button onClick={() => setFormOpen(true)} disabled={eligibleBookings.length === 0}>
          <Plus size={16} /> Add Payment
        </Button>
      </div>

      <div className="rounded-2xl border border-ink-100/60 dark:border-ink-600/60 bg-white dark:bg-ink-800/60 shadow-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Booking #, customer, reference..."
          className="sm:col-span-2"
        />
        <Select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}>
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </Select>
      </div>

      <div className="rounded-2xl border border-ink-100/60 dark:border-ink-600/60 bg-white dark:bg-ink-800/60 shadow-card overflow-hidden">
        <Table
          columns={columns}
          data={paged}
          rowKey={(p) => p.id}
          emptyTitle="No payments found"
          emptyDescription="Payments will appear here once recorded against a booking."
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setBookingIdForNew("");
        }}
        title="Add Payment"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Select Booking"
            value={bookingIdForNew}
            onChange={(e) => setBookingIdForNew(e.target.value)}
          >
            <option value="">Choose a booking with outstanding balance</option>
            {eligibleBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bookingNumber} — {getCustomerById(b.customerId)?.fullName}
              </option>
            ))}
          </Select>
          {selectedBooking && (
            <PaymentForm
              booking={selectedBooking}
              onSubmit={handleSubmit}
              onCancel={() => {
                setFormOpen(false);
                setBookingIdForNew("");
              }}
            />
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? The booking's paid and remaining amounts will be recalculated."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
