import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardBody } from "../ui/Card";
import { useData } from "../../context/DataContext";
import { formatPKR } from "../../utils/format";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthlyBookingsChart() {
  const { bookings } = useData();

  const data = useMemo(() => {
    const year = new Date().getFullYear();
    const counts = Array(12).fill(0);
    bookings.forEach((b) => {
      const d = new Date(b.eventDate);
      if (d.getFullYear() === year) counts[d.getMonth()] += 1;
    });
    return MONTH_LABELS.map((m, i) => ({ month: m, bookings: counts[i] }));
  }, [bookings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Bookings</CardTitle>
      </CardHeader>
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink-100)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--color-ink-100)",
                fontSize: 13,
              }}
            />
            <Bar dataKey="bookings" fill="var(--color-maroon-500)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

export function RevenueChart() {
  const { bookings } = useData();

  const data = useMemo(() => {
    const year = new Date().getFullYear();
    const totals = Array(12).fill(0);
    bookings.forEach((b) => {
      const d = new Date(b.eventDate);
      if (d.getFullYear() === year) totals[d.getMonth()] += b.paidAmount;
    });
    return MONTH_LABELS.map((m, i) => ({ month: m, revenue: totals[i] }));
  }, [bookings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
      </CardHeader>
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink-100)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-ink-400)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              formatter={(value) => formatPKR(Number(value))}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--color-ink-100)",
                fontSize: 13,
              }}
            />
            <Line type="monotone" dataKey="revenue" stroke="var(--color-gold-500)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
