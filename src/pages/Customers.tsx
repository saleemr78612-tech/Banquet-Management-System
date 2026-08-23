import { useMemo, useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { SearchBar } from "../components/ui/SearchBar";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Table, type TableColumn } from "../components/ui/Table";
import { Pagination } from "../components/ui/Pagination";
import { CustomerForm } from "../components/customers/CustomerForm";
import { CustomerDetailsModal } from "../components/customers/CustomerDetailsModal";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import type { Customer } from "../types/customer";
import type { CustomerSchemaType } from "../utils/customerSchema";

const PAGE_SIZE = 8;

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, getBookingsForCustomer } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.cnic?.includes(q)
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditingCustomer(undefined);
    setFormOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormOpen(true);
  };

  const handleSubmit = (values: CustomerSchemaType) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, values);
      showToast("Customer updated successfully");
    } else {
      addCustomer(values);
      showToast("Customer added successfully");
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCustomer(deleteTarget.id);
    showToast("Customer deleted successfully");
    setDeleteTarget(null);
  };

  const columns: TableColumn<Customer>[] = [
    { key: "fullName", header: "Full Name", mobilePrimary: true, render: (c) => c.fullName },
    { key: "phone", header: "Phone", render: (c) => c.phone },
    { key: "email", header: "Email", render: (c) => c.email ?? "—" },
    { key: "city", header: "City", render: (c) => c.city ?? "—" },
    {
      key: "bookings",
      header: "Bookings",
      render: (c) => getBookingsForCustomer(c.id).length,
    },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewingCustomer(c);
            }}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ivory-200 dark:hover:bg-ink-600 hover:text-maroon-500"
            title="View"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(c);
            }}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ivory-200 dark:hover:bg-ink-600 hover:text-maroon-500"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(c);
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
          <h2 className="font-display text-xl font-semibold text-ink-800 dark:text-ivory-100">Customers</h2>
          <p className="text-sm text-ink-400">{filtered.length} of {customers.length} customers</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Customer
        </Button>
      </div>

      <div className="rounded-2xl border border-ink-100/60 dark:border-ink-600/60 bg-white dark:bg-ink-800/60 shadow-card p-4">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name, phone, email, or CNIC..."
          className="max-w-md"
        />
      </div>

      <div className="rounded-2xl border border-ink-100/60 dark:border-ink-600/60 bg-white dark:bg-ink-800/60 shadow-card overflow-hidden">
        <Table
          columns={columns}
          data={paged}
          rowKey={(c) => c.id}
          onRowClick={(c) => setViewingCustomer(c)}
          emptyTitle="No customers found"
          emptyDescription="Try a different search, or add your first customer."
          emptyAction={
            <Button onClick={openCreate}>
              <Plus size={16} /> Add Customer
            </Button>
          }
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
        size="lg"
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitLabel={editingCustomer ? "Update Customer" : "Add Customer"}
        />
      </Modal>

      <CustomerDetailsModal customer={viewingCustomer} onClose={() => setViewingCustomer(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}? This does not delete their existing bookings.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
