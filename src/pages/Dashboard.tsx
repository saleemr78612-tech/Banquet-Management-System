import { useMemo } from "react";
import { CalendarCheck, CalendarClock, Users, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";
import { MonthlyBookingsChart, RevenueChart } from "../components/dashboard/RevenueCharts";
import { EventTypeChart } from "../components/dashboard/EventTypeChart";
import { UpcomingEvents } from "../components/dashboard/UpcomingEvents";
import { ReminderCards } from "../components/dashboard/ReminderCards";
import { useData } from "../context/DataContext";
import { formatPKR } from "../utils/format";
import { daysFromToday } from "../utils/format";

export default function Dashboard() {
  const { bookings, customers } = useData();

  const stats = useMemo(() => {
    const activeBookings = bookings.filter((b) => b.status !== "Cancelled");
    const upcomingEvents = activeBookings.filter((b) => daysFromToday(b.eventDate) >= 0).length;
    const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const amountReceived = activeBookings.reduce((sum, b) => sum + b.paidAmount, 0);
    const remainingAmount = totalRevenue - amountReceived;

    return {
      totalBookings: bookings.length,
      upcomingEvents,
      totalCustomers: customers.length,
      totalRevenue,
      amountReceived,
      remainingAmount,
    };
  }, [bookings, customers]);

  return (
    <div className="space-y-6">
      <ReminderCards />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <StatCard label="Total Bookings" value={String(stats.totalBookings)} icon={CalendarCheck} tone="maroon" />
        <StatCard label="Upcoming Events" value={String(stats.upcomingEvents)} icon={CalendarClock} tone="gold" />
        <StatCard label="Total Customers" value={String(stats.totalCustomers)} icon={Users} tone="maroon" />
        <StatCard label="Total Revenue" value={formatPKR(stats.totalRevenue)} icon={TrendingUp} tone="success" />
        <StatCard label="Amount Received" value={formatPKR(stats.amountReceived)} icon={Wallet} tone="success" />
        <StatCard label="Remaining Amount" value={formatPKR(stats.remainingAmount)} icon={AlertCircle} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyBookingsChart />
        </div>
        <EventTypeChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <UpcomingEvents />
      </div>
    </div>
  );
}
