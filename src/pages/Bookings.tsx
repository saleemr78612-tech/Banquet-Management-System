import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, Wallet } from "lucide-react";
import { Button } from "../components/ui/Button";
import { SearchBar } from "../components/ui/SearchBar";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Table, type TableColumn } from "../components/ui/Table";
import { Badge, bookingStatusTone, paymentStatusTone } from "../components/ui/Badge";
import { Pagination } from "../components/ui/Pagination";
import { BookingForm } from "../components/bookings/BookingForm";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { EVENT_TYPES, BOOKING_STATUSES, PAYMENT_STATUSES, getPaymentStatus, getRemainingAmount, type Booking } from "../types/booking";
import type { BookingSchemaType } from "../utils/bookingSchema";
import { formatShortDate, formatPKR } from "../utils/format";

const PAGE_SIZE = 8;

type SortOption = "newest" | "oldest" | "eventDate" | "highest" | "lowest";

export default function Bookings() {
  const { bookings, customers, addBooking, updateBooking, deleteBooking, getCustomerById } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    let result = bookings.filter((b) => {
      const customer = getCustomerById(b.customerId);
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.bookingNumber.toLowerCase().includes(q) ||
        customer?.fullName.toLowerCase().includes(q) ||
        customer?.phone.includes(q);
      const matchesEventType = !eventTypeFilter || b.eventType === eventTypeFilter;
      const matchesStatus = !statusFilter || b.status === statusFilter;
      const matchesPayment = !paymentFilter || getPaymentStatus(b.totalAmount, b.paidAmount) === paymentFilter;
      return matchesSearch && matchesEventType && matchesStatus && matchesPayment;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "eventDate":
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        case "highest":
          return b.totalAmount - a.totalAmount;
        case "lowest":
          return a.totalAmount - b.totalAmount;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [bookings, search, eventTypeFilter, statusFilter, paymentFilter, sort, getCustomerById]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditingBooking(undefined);
    setFormOpen(true);
  };

  const openEdit = (b: Booking) => {
    setEditingBooking(b);
    setFormOpen(true);
  };

  const handleSubmit = (values: BookingSchemaType) => {
    const { phone: _phone, ...rest } = values;
    if (editingBooking) {
      updateBooking(editingBooking.id, rest);
      showToast("Booking updated successfully");
    } else {
      addBooking(rest);
      showToast("Booking created successfully");
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteBooking(deleteTarget.id);
    showToast("Booking deleted successfully");
    setDeleteTarget(null);
  };

  const columns: TableColumn<Booking>[] = [
    {
      key: "bookingNumber",
      header: "Booking #",
      mobilePrimary: true,
      render: (b) => <span className="font-mono-tabular text-xs text-ink-600 dark:text-ivory-300">{b.bookingNumber}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (b) => getCustomerById(b.customerId)?.fullName ?? "—",
    },
    { key: "event", header: "Event", render: (b) => b.eventType },
    { key: "eventDate", header: "Event Date", render: (b) => formatShortDate(b.eventDate) },
    { key: "hijri", header: "Hijri Date", render: (b) => <span className="text-xs text-ink-400">{b.hijriDate}</span> },
    { key: "guests", header: "Guests", render: (b) => b.guests },
    { key: "total", header: "Total", render: (b) => formatPKR(b.totalAmount) },
    { key: "paid", header: "Paid", render: (b) => formatPKR(b.paidAmount) },
    {
      key: "remaining",
      header: "Remaining",
      render: (b) => formatPKR(getRemainingAmount(b.totalAmount, b.paidAmount)),
    },
    {
      key: "status",
      header: "Status",
      render: (b) => (
        <div className="flex flex-col gap-1 items-start">
          <Badge tone={bookingStatusTone(b.status)}>{b.status}</Badge>
          <Badge tone={paymentStatusTone(getPaymentStatus(b.totalAmount, b.paidAmount))}>
            {getPaymentStatus(b.totalAmount, b.paidAmount)}
          </Badge>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (b) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/bookings/${b.id}`);
            }}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ivory-200 dark:hover:bg-ink-600 hover:text-maroon-500"
            title="View"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(b);
            }}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ivory-200 dark:hover:bg-ink-600 hover:text-maroon-500"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/bookings/${b.id}?payment=1`);
            }}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ivory-200 dark:hover:bg-ink-600 hover:text-maroon-500"
            title="Add Payment"
          >
            <Wallet size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(b);
            }}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-100 dark:hover:bg-danger-500/15 hover:text-danger-500"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-800 dark:text-ivory-100">Bookings</h2>
          <p className="text-sm text-ink-400">{filtered.length} of {bookings.length} bookings</p>
        </div>
        <Button onClick={openCreate} disabled={customers.length === 0}>
          <Plus size={16} /> New Booking
        </Button>
      </div>

      <div className="rounded-2xl border border-ink-100/60 dark:border-ink-600/60 bg-white dark:bg-ink-800/60 shadow-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Booking #, customer, phone..."
            className="lg:col-span-2"
          />
          <Select value={eventTypeFilter} onChange={(e) => { setEventTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Event Types</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}>
            <option value="">All Payment Status</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end">
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="w-48">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="eventDate">By Event Date</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100/60 dark:border-ink-600/60 bg-white dark:bg-ink-800/60 shadow-card overflow-hidden">
        <Table
          columns={columns}
          data={paged}
          rowKey={(b) => b.id}
          onRowClick={(b) => navigate(`/bookings/${b.id}`)}
          emptyTitle="No bookings found"
          emptyDescription="Try adjusting your search or filters, or create a new booking."
          emptyAction={
            <Button onClick={openCreate}>
              <Plus size={16} /> Create New Booking
            </Button>
          }
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingBooking ? "Edit Booking" : "New Booking"}
        size="lg"
      >
        <BookingForm
          booking={editingBooking}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitLabel={editingBooking ? "Update Booking" : "Create Booking"}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Booking"
        message={`Are you sure you want to delete booking ${deleteTarget?.bookingNumber}? This will also remove its associated payment records.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
