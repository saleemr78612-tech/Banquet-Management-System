import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardBody } from "../ui/Card";
import { useData } from "../../context/DataContext";
import { EVENT_TYPES } from "../../types/booking";

const COLORS = [
  "var(--color-maroon-500)",
  "var(--color-gold-500)",
  "var(--color-maroon-400)",
  "var(--color-gold-300)",
  "var(--color-maroon-700)",
  "var(--color-gold-600)",
  "var(--color-ink-400)",
  "var(--color-maroon-900)",
];

export function EventTypeChart() {
  const { bookings } = useData();

  const data = useMemo(() => {
    const counts = new Map<string, number>();
    EVENT_TYPES.forEach((t) => counts.set(t, 0));
    bookings.forEach((b) => counts.set(b.eventType, (counts.get(b.eventType) ?? 0) + 1));
    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .filter((d) => d.count > 0);
  }, [bookings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by Type</CardTitle>
      </CardHeader>
      <CardBody className="h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-400">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="type" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--color-ink-100)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
