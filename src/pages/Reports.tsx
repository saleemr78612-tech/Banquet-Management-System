import { useMemo, useState } from "react";
import { Printer, Download, CalendarCheck, TrendingUp, Wallet, AlertCircle, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card";
import { StatCard } from "../components/dashboard/StatCard";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { SearchBar } from "../components/ui/SearchBar";
import { Table, type TableColumn } from "../components/ui/Table";
import { Badge, bookingStatusTone } from "../components/ui/Badge";
import { useData } from "../context/DataContext";
import { EVENT_TYPES, type Booking } from "../types/booking";
import type { Payment } from "../types/payment";
import { formatPKR, formatShortDate } from "../utils/format";
import { exportToCsv } from "../utils/csv";

type ReportTab = "bookings" | "revenue" | "eventTypes" | "payments";

export default function Reports() {
  const { bookings, customers, payments, getCustomerById, getBookingById } = useData();

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    bookings.forEach((b) => years.add(new Date(b.eventDate).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [bookings]);

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [tab, setTab] = useState<ReportTab>("bookings");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const yearBookings = useMemo(
    () => bookings.filter((b) => new Date(b.eventDate).getFullYear() === year),
    [bookings, year]
  );

  const yearCustomerIds = useMemo(() => new Set(yearBookings.map((b) => b.customerId)), [yearBookings]);

  const yearStats = useMemo(() => {
    const active = yearBookings.filter((b) => b.status !== "Cancelled");
    const totalRevenue = active.reduce((s, b) => s + b.totalAmount, 0);
    const totalCollected = active.reduce((s, b) => s + b.paidAmount, 0);
    return {
      totalBookings: yearBookings.length,
      totalRevenue,
      totalCollected,
      outstanding: totalRevenue - totalCollected,
      totalCustomers: yearCustomerIds.size,
    };
  }, [yearBookings, yearCustomerIds]);

  const eventTypeStats = useMemo(() => {
    const counts = new Map<string, number>();
    EVENT_TYPES.forEach((t) => counts.set(t, 0));
    yearBookings.forEach((b) => counts.set(b.eventType, (counts.get(b.eventType) ?? 0) + 1));
    return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
  }, [yearBookings]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return yearBookings.filter((b) => {
      if (dateFrom && b.eventDate < dateFrom) return false;
      if (dateTo && b.eventDate > dateTo) return false;
      const customer = getCustomerById(b.customerId);
      return !q || b.bookingNumber.toLowerCase().includes(q) || customer?.fullName.toLowerCase().includes(q);
    });
  }, [yearBookings, search, dateFrom, dateTo, getCustomerById]);

  const yearPayments = useMemo(() => {
    const bookingIds = new Set(yearBookings.map((b) => b.id));
    return payments.filter((p) => bookingIds.has(p.bookingId));
  }, [yearBookings, payments]);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return yearPayments.filter((p) => {
      if (dateFrom && p.paymentDate < dateFrom) return false;
      if (dateTo && p.paymentDate > dateTo) return false;
      const booking = getBookingById(p.bookingId);
      const customer = booking ? getCustomerById(booking.customerId) : undefined;
      return !q || booking?.bookingNumber.toLowerCase().includes(q) || customer?.fullName.toLowerCase().includes(q);
    });
  }, [yearPayments, search, dateFrom, dateTo, getBookingById, getCustomerById]);

  const handleExportCsv = () => {
    if (tab === "bookings") {
      exportToCsv(
        `bookings-report-${year}`,
        filteredBookings.map((b) => ({
          BookingNumber: b.bookingNumber,
          Customer: getCustomerById(b.customerId)?.fullName ?? "",
          EventType: b.eventType,
          EventDate: b.eventDate,
          HijriDate: b.hijriDate,
          Guests: b.guests,
          Total: b.totalAmount,
          Paid: b.paidAmount,
          Status: b.status,
        }))
      );
    } else if (tab === "payments") {
      exportToCsv(
        `payments-report-${year}`,
        filteredPayments.map((p) => ({
          BookingNumber: getBookingById(p.bookingId)?.bookingNumber ?? "",
          Customer: getCustomerById(getBookingById(p.bookingId)?.customerId ?? "")?.fullName ?? "",
          Amount: p.amount,
          Method: p.method,
          Date: p.paymentDate,
          Reference: p.referenceNumber ?? "",
        }))
      );
    } else if (tab === "eventTypes") {
      exportToCsv(`event-type-report-${year}`, eventTypeStats.map((e) => ({ EventType: e.type, Count: e.count })));
    } else {
      exportToCsv(`revenue-report-${year}`, [
        { Metric: "Total Revenue", Value: yearStats.totalRevenue },
        { Metric: "Paid Amount", Value: yearStats.totalCollected },
        { Metric: "Outstanding Amount", Value: yearStats.outstanding },
      ]);
    }
  };

  const bookingColumns: TableColumn<Booking>[] = [
    { key: "bookingNumber", header: "Booking #", mobilePrimary: true, render: (b) => b.bookingNumber },
    { key: "customer", header: "Customer", render: (b) => getCustomerById(b.customerId)?.fullName ?? "—" },
    { key: "event", header: "Event", render: (b) => b.eventType },
    { key: "date", header: "Event Date", render: (b) => formatShortDate(b.eventDate) },
    { key: "total", header: "Total", render: (b) => formatPKR(b.totalAmount) },
    { key: "paid", header: "Paid", render: (b) => formatPKR(b.paidAmount) },
    { key: "status", header: "Status", render: (b) => <Badge tone={bookingStatusTone(b.status)}>{b.status}</Badge> },
  ];

  const paymentColumns: TableColumn<Payment>[] = [
    {
      key: "booking",
      header: "Booking #",
      mobilePrimary: true,
      render: (p) => getBookingById(p.bookingId)?.bookingNumber ?? "—",
    },
    {
      key: "customer",
      header: "Customer",
      render: (p) => {
        const b = getBookingById(p.bookingId);
        return b ? getCustomerById(b.customerId)?.fullName ?? "—" : "—";
      },
    },
    { key: "amount", header: "Amount", render: (p) => formatPKR(p.amount) },
    { key: "method", header: "Method", render: (p) => p.method },
    { key: "date", header: "Date", render: (p) => formatShortDate(p.paymentDate) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-800 dark:text-ivory-100">Reports</h2>
          <p className="text-sm text-ink-400">Yearly performance and detailed records</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28">
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={15} /> Print
          </Button>
          <Button onClick={handleExportCsv}>
            <Download size={15} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 print:hidden">
        <StatCard label="Total Bookings" value={String(yearStats.totalBookings)} icon={CalendarCheck} tone="maroon" />
        <StatCard label="Total Revenue" value={formatPKR(yearStats.totalRevenue)} icon={TrendingUp} tone="success" />
        <StatCard label="Total Collected" value={formatPKR(yearStats.totalCollected)} icon={Wallet} tone="success" />
        <StatCard label="Outstanding" value={formatPKR(yearStats.outstanding)} icon={AlertCircle} tone="warning" />
        <StatCard label="Total Customers" value={String(yearStats.totalCustomers)} icon={Users} tone="gold" />
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Events by Type — {year}</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {eventTypeStats.map((e) => (
            <div key={e.type} className="rounded-lg border border-ink-100 dark:border-ink-600 px-3 py-2.5 text-center">
              <p className="text-lg font-display font-semibold text-ink-800 dark:text-ivory-100">{e.count}</p>
              <p className="text-xs text-ink-400">{e.type}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="print:hidden">
        <div className="flex rounded-lg border border-ink-100 dark:border-ink-600 overflow-hidden w-fit mb-3">
          {(
            [
              ["bookings", "Booking Report"],
              ["revenue", "Revenue Report"],
              ["eventTypes", "Event Type Report"],
              ["payments", "Payment Report"],
            ] as [ReportTab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                tab === key
                  ? "bg-maroon-500 text-ivory-50"
                  : "text-ink-600 dark:text-ivory-300 hover:bg-ivory-200 dark:hover:bg-ink-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {(tab === "bookings" || tab === "payments") && (
          <Card className="p-4 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search booking # or customer..." />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-ink-100 dark:border-ink-600 bg-ivory-50 dark:bg-ink-800 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-ink-100 dark:border-ink-600 bg-ivory-50 dark:bg-ink-800 px-3 py-2 text-sm"
            />
          </Card>
        )}
      </div>

      <Card className="overflow-hidden">
        {tab === "bookings" && (
          <Table columns={bookingColumns} data={filteredBookings} rowKey={(b) => b.id} emptyTitle="No bookings this year" />
        )}
        {tab === "payments" && (
          <Table columns={paymentColumns} data={filteredPayments} rowKey={(p) => p.id} emptyTitle="No payments this year" />
        )}
        {tab === "revenue" && (
          <CardBody className="space-y-3">
            <ReportRow label="Total Revenue" value={formatPKR(yearStats.totalRevenue)} />
            <ReportRow label="Paid Amount" value={formatPKR(yearStats.totalCollected)} tone="success" />
            <ReportRow label="Outstanding Amount" value={formatPKR(yearStats.outstanding)} tone="warning" />
          </CardBody>
        )}
        {tab === "eventTypes" && (
          <CardBody className="space-y-2">
            {eventTypeStats.map((e) => (
              <ReportRow key={e.type} label={e.type} value={String(e.count)} />
            ))}
          </CardBody>
        )}
      </Card>

      <p className="text-xs text-ink-400 print:hidden">
        Showing data for {customers.length} total customers across {bookings.length} total bookings in the system.
      </p>
    </div>
  );
}

function ReportRow({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  const toneClass =
    tone === "success"
      ? "text-success-600 dark:text-success-500"
      : tone === "warning"
      ? "text-warning-600 dark:text-warning-500"
      : "text-ink-700 dark:text-ivory-200";
  return (
    <div className="flex justify-between items-center border-b border-ink-100/60 dark:border-ink-600/60 pb-2 last:border-0">
      <span className="text-sm text-ink-500 dark:text-ivory-300">{label}</span>
      <span className={`font-mono-tabular font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}
