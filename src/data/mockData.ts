import type { Customer } from "../types/customer";
import type { Booking, EventType, BookingStatus } from "../types/booking";
import type { Payment, PaymentMethod } from "../types/payment";
import type { BusinessSettings } from "../types/dashboard";
import { formatHijri } from "../utils/hijri";

export const defaultSettings: BusinessSettings = {
  banquetName: "Al-Noor Banquet & Convention Hall",
  address: "Plot 14-C, Shahrah-e-Faisal, Karachi",
  phone: "+92 300 1234567",
  email: "info@alnoorbanquet.pk",
  city: "Karachi",
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const today = new Date();

const customerSeed: Array<Omit<Customer, "id" | "createdAt">> = [
  { fullName: "Ahmed Raza Khan", guardianName: "S/O Iqbal Khan", cnic: "42101-1234567-1", phone: "0300-1112233", email: "ahmed.raza@example.com", city: "Karachi", address: "House 12, Block 4, Gulshan-e-Iqbal" },
  { fullName: "Sana Fatima", guardianName: "D/O Muhammad Aslam", cnic: "42201-2345678-2", phone: "0321-2223344", email: "sana.fatima@example.com", city: "Karachi", address: "Flat 7B, Bahadurabad" },
  { fullName: "Bilal Ahmed Siddiqui", guardianName: "S/O Nasir Siddiqui", cnic: "42301-3456789-3", phone: "0333-3334455", email: "bilal.siddiqui@example.com", city: "Karachi", address: "House 45, DHA Phase 6" },
  { fullName: "Ayesha Malik", guardianName: "D/O Tariq Malik", cnic: "42101-4567890-4", phone: "0345-4445566", email: "ayesha.malik@example.com", city: "Karachi", address: "House 3, PECHS Block 2" },
  { fullName: "Usman Ghani", guardianName: "S/O Abdul Ghani", cnic: "35201-5678901-5", phone: "0312-5556677", email: "usman.ghani@example.com", city: "Lahore", address: "House 88, Model Town" },
  { fullName: "Hira Sheikh", guardianName: "D/O Aslam Sheikh", cnic: "42401-6789012-6", phone: "0301-6667788", email: "hira.sheikh@example.com", city: "Karachi", address: "Flat 22, Clifton Block 5" },
  { fullName: "Zeeshan Iqbal", guardianName: "S/O Muhammad Iqbal", cnic: "42101-7890123-7", phone: "0322-7778899", email: "zeeshan.iqbal@example.com", city: "Karachi", address: "House 9, North Nazimabad" },
  { fullName: "Mahnoor Aslam", guardianName: "D/O Rashid Aslam", cnic: "42501-8901234-8", phone: "0334-8889900", email: "mahnoor.aslam@example.com", city: "Karachi", address: "House 15, Gulistan-e-Johar" },
  { fullName: "Faisal Mehmood", guardianName: "S/O Anwar Mehmood", cnic: "42101-9012345-9", phone: "0344-9990011", email: "faisal.mehmood@example.com", city: "Karachi", address: "Flat 4A, Federal B Area" },
  { fullName: "Komal Yousuf", guardianName: "D/O Yousuf Ali", cnic: "42301-0123456-0", phone: "0302-0001122", email: "komal.yousuf@example.com", city: "Karachi", address: "House 61, Malir Cantt" },
  { fullName: "Hamza Sultan", guardianName: "S/O Sultan Mahmood", cnic: "42101-1122334-1", phone: "0313-1223344", email: "hamza.sultan@example.com", city: "Karachi", address: "House 27, Gulshan-e-Maymar" },
  { fullName: "Rabia Naveed", guardianName: "D/O Naveed Ahmed", cnic: "42101-2233445-2", phone: "0335-2334455", email: "rabia.naveed@example.com", city: "Karachi", address: "Flat 9, Saddar" },
];

export const seedCustomers: Customer[] = customerSeed.map((c, i) => ({
  ...c,
  id: `cust_${i + 1}`,
  createdAt: iso(addDays(today, -(120 - i * 6))),
}));

const eventTypes: EventType[] = [
  "Wedding",
  "Mehndi",
  "Walima",
  "Birthday",
  "Engagement",
  "Corporate Event",
  "Conference",
  "Wedding",
  "Mehndi",
  "Walima",
  "Other",
  "Wedding",
  "Birthday",
  "Engagement",
  "Walima",
  "Wedding",
  "Corporate Event",
];

const venues = ["Grand Hall A", "Grand Hall B", "Rooftop Lawn", "Diamond Hall", "Emerald Hall"];
const packages = ["Silver Package", "Gold Package", "Platinum Package", "Custom Package"];

// Offsets relative to today: mix of past (completed), very near (reminders), and future bookings
const dayOffsets = [-45, -30, -20, -12, -5, 0, 1, 2, 4, 5, 9, 15, 25, 40, 60, 90, 120];

function statusForOffset(offset: number): BookingStatus {
  if (offset < -3) return "Completed";
  if (offset < 0) return "Confirmed";
  const roll = Math.abs(offset) % 5;
  if (roll === 0) return "Pending";
  if (roll === 4) return "Cancelled";
  return "Confirmed";
}

const totalsByIndex = [
  350000, 280000, 500000, 150000, 220000, 400000, 180000, 600000, 320000, 275000,
  90000, 450000, 160000, 210000, 380000, 520000, 300000,
];

const paidRatioByIndex = [1, 0.6, 0.35, 1, 0, 0.5, 1, 0.25, 0.8, 1, 0.4, 0, 1, 0.55, 0.7, 0.15, 1];

export const seedBookings: Booking[] = dayOffsets.map((offset, i) => {
  const eventDate = addDays(today, offset);
  const totalAmount = totalsByIndex[i];
  const paidAmount = Math.round((totalAmount * paidRatioByIndex[i]) / 5000) * 5000;
  const status = statusForOffset(offset);
  const customer = seedCustomers[i % seedCustomers.length];
  return {
    id: `book_${i + 1}`,
    bookingNumber: `BOOK-${eventDate.getFullYear()}-${String(i + 1).padStart(4, "0")}`,
    customerId: customer.id,
    eventType: eventTypes[i],
    eventDate: iso(eventDate),
    hijriDate: formatHijri(eventDate),
    startTime: i % 2 === 0 ? "18:00" : "16:00",
    endTime: i % 2 === 0 ? "23:00" : "21:00",
    guests: 150 + (i % 6) * 60,
    venue: venues[i % venues.length],
    package: packages[i % packages.length],
    notes: i % 4 === 0 ? "Stage decoration in maroon and gold theme requested." : undefined,
    totalAmount,
    paidAmount,
    status,
    createdAt: iso(addDays(eventDate, -30)),
    updatedAt: iso(addDays(eventDate, -5)),
  };
});

const methods: PaymentMethod[] = ["Cash", "Bank Transfer", "JazzCash", "Easypaisa", "Card"];

export const seedPayments: Payment[] = seedBookings.flatMap((b, i) => {
  if (b.paidAmount <= 0) return [];
  const payments: Payment[] = [];
  const firstInstallment = Math.min(b.paidAmount, Math.round(b.totalAmount * 0.3 / 5000) * 5000 || b.paidAmount);
  const remaining = b.paidAmount - firstInstallment;
  payments.push({
    id: `pay_${b.id}_1`,
    bookingId: b.id,
    amount: firstInstallment,
    method: methods[i % methods.length],
    paymentDate: b.createdAt,
    referenceNumber: `REF-${1000 + i}`,
    notes: "Advance / booking confirmation payment",
    createdAt: b.createdAt,
  });
  if (remaining > 0) {
    payments.push({
      id: `pay_${b.id}_2`,
      bookingId: b.id,
      amount: remaining,
      method: methods[(i + 1) % methods.length],
      paymentDate: b.updatedAt,
      referenceNumber: `REF-${2000 + i}`,
      notes: "Balance payment",
      createdAt: b.updatedAt,
    });
  }
  return payments;
});
