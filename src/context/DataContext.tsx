import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Customer, CustomerFormValues } from "../types/customer";
import type { Booking, BookingFormValues } from "../types/booking";
import { getPaymentStatus, getRemainingAmount } from "../types/booking";
import type { Payment, PaymentFormValues } from "../types/payment";
import type { BusinessSettings } from "../types/dashboard";
import type { PricingRules } from "../types/pricing";
import {
  ensureSeeded,
  getCustomers,
  saveCustomers,
  getBookings,
  saveBookings,
  getPayments,
  savePayments,
  getSettings,
  saveSettings,
  getPricingRules,
  savePricingRules,
  getNextBookingNumber,
  generateId,
} from "../utils/storage";
import { formatHijri } from "../utils/hijri";

interface DataContextValue {
  customers: Customer[];
  bookings: Booking[];
  payments: Payment[];
  settings: BusinessSettings;
  pricingRules: PricingRules;

  addCustomer: (values: CustomerFormValues) => Customer;
  updateCustomer: (id: string, values: CustomerFormValues) => void;
  deleteCustomer: (id: string) => void;

  addBooking: (values: BookingFormValues) => Booking;
  updateBooking: (id: string, values: BookingFormValues) => void;
  deleteBooking: (id: string) => void;

  addPayment: (values: PaymentFormValues) => void;
  deletePayment: (id: string) => void;

  updateSettings: (values: BusinessSettings) => void;
  updatePricingRules: (rules: PricingRules) => void;

  getCustomerById: (id: string) => Customer | undefined;
  getBookingById: (id: string) => Booking | undefined;
  getPaymentsForBooking: (bookingId: string) => Payment[];
  getBookingsForCustomer: (customerId: string) => Booking[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    ensureSeeded();
  }, []);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    ensureSeeded();
    return getCustomers();
  });
  const [bookings, setBookings] = useState<Booking[]>(() => getBookings());
  const [payments, setPayments] = useState<Payment[]>(() => getPayments());
  const [settings, setSettings] = useState<BusinessSettings>(() => getSettings());
  const [pricingRules, setPricingRules] = useState<PricingRules>(() => getPricingRules());

  // ---------- Customers ----------
  const addCustomer = (values: CustomerFormValues): Customer => {
    const customer: Customer = {
      ...values,
      id: generateId("cust"),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const next = [customer, ...customers];
    setCustomers(next);
    saveCustomers(next);
    return customer;
  };

  const updateCustomer = (id: string, values: CustomerFormValues) => {
    const next = customers.map((c) => (c.id === id ? { ...c, ...values } : c));
    setCustomers(next);
    saveCustomers(next);
  };

  const deleteCustomer = (id: string) => {
    const next = customers.filter((c) => c.id !== id);
    setCustomers(next);
    saveCustomers(next);
  };

  // ---------- Bookings ----------
  const addBooking = (values: BookingFormValues): Booking => {
    const eventDateObj = new Date(values.eventDate);
    const booking: Booking = {
      ...values,
      id: generateId("book"),
      bookingNumber: getNextBookingNumber(values.eventDate),
      hijriDate: formatHijri(eventDateObj),
      paidAmount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    const next = [booking, ...bookings];
    setBookings(next);
    saveBookings(next);
    return booking;
  };

  const updateBooking = (id: string, values: BookingFormValues) => {
    const eventDateObj = new Date(values.eventDate);
    const next = bookings.map((b) =>
      b.id === id
        ? {
            ...b,
            ...values,
            hijriDate: formatHijri(eventDateObj),
            updatedAt: new Date().toISOString().slice(0, 10),
          }
        : b
    );
    setBookings(next);
    saveBookings(next);
  };

  const deleteBooking = (id: string) => {
    const next = bookings.filter((b) => b.id !== id);
    setBookings(next);
    saveBookings(next);
    // Cascade: remove associated payments
    const nextPayments = payments.filter((p) => p.bookingId !== id);
    setPayments(nextPayments);
    savePayments(nextPayments);
  };

  // ---------- Payments ----------
  const addPayment = (values: PaymentFormValues) => {
    const booking = bookings.find((b) => b.id === values.bookingId);
    if (!booking) return;

    const remaining = getRemainingAmount(booking.totalAmount, booking.paidAmount);
    const amount = Math.min(values.amount, remaining);
    if (amount <= 0) return;

    const payment: Payment = {
      ...values,
      amount,
      id: generateId("pay"),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const nextPayments = [payment, ...payments];
    setPayments(nextPayments);
    savePayments(nextPayments);

    const newPaidAmount = booking.paidAmount + amount;
    const nextBookings = bookings.map((b) =>
      b.id === booking.id ? { ...b, paidAmount: newPaidAmount, updatedAt: new Date().toISOString().slice(0, 10) } : b
    );
    setBookings(nextBookings);
    saveBookings(nextBookings);
  };

  const deletePayment = (id: string) => {
    const payment = payments.find((p) => p.id === id);
    if (!payment) return;
    const nextPayments = payments.filter((p) => p.id !== id);
    setPayments(nextPayments);
    savePayments(nextPayments);

    const booking = bookings.find((b) => b.id === payment.bookingId);
    if (booking) {
      const newPaidAmount = Math.max(booking.paidAmount - payment.amount, 0);
      const nextBookings = bookings.map((b) =>
        b.id === booking.id ? { ...b, paidAmount: newPaidAmount, updatedAt: new Date().toISOString().slice(0, 10) } : b
      );
      setBookings(nextBookings);
      saveBookings(nextBookings);
    }
  };

  // ---------- Settings ----------
  const updateSettings = (values: BusinessSettings) => {
    setSettings(values);
    saveSettings(values);
  };

  const updatePricingRules = (rules: PricingRules) => {
    setPricingRules(rules);
    savePricingRules(rules);
  };

  // ---------- Lookups ----------
  const getCustomerById = (id: string) => customers.find((c) => c.id === id);
  const getBookingById = (id: string) => bookings.find((b) => b.id === id);
  const getPaymentsForBooking = (bookingId: string) => payments.filter((p) => p.bookingId === bookingId);
  const getBookingsForCustomer = (customerId: string) => bookings.filter((b) => b.customerId === customerId);

  const value = useMemo<DataContextValue>(
    () => ({
      customers,
      bookings,
      payments,
      settings,
      pricingRules,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addBooking,
      updateBooking,
      deleteBooking,
      addPayment,
      deletePayment,
      updateSettings,
      updatePricingRules,
      getCustomerById,
      getBookingById,
      getPaymentsForBooking,
      getBookingsForCustomer,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers, bookings, payments, settings, pricingRules]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export { getPaymentStatus };
