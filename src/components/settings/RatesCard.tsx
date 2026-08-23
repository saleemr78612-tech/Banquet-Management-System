import { useState } from "react";
import { Save, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { WEEKDAY_LABELS_FULL, type PricingRules } from "../../types/pricing";
import { HIJRI_MONTHS } from "../../utils/hijri";

export function RatesCard() {
  const { pricingRules, updatePricingRules } = useData();
  const { showToast } = useToast();
  const [rules, setRules] = useState<PricingRules>(pricingRules);

  const setWeekdayRate = (day: number, value: number) => {
    setRules((r) => ({ ...r, weekdayRates: { ...r.weekdayRates, [day]: value } }));
  };

  const setHijriAdjustment = (month: number, percent: number) => {
    setRules((r) => ({
      ...r,
      hijriMonthAdjustments: { ...r.hijriMonthAdjustments, [month]: 1 + percent / 100 },
    }));
  };

  const handleSave = () => {
    updatePricingRules(rules);
    showToast("Rate settings updated successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Management</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        <div>
          <p className="text-sm font-medium text-ink-700 dark:text-ivory-200 mb-1">Day-of-Week Base Rates (PKR)</p>
          <p className="text-xs text-ink-400 mb-3">
            Base hall rate depending on which day of the week the event falls on. Weekends are usually priced higher.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {WEEKDAY_LABELS_FULL.map((label, day) => (
              <Input
                key={day}
                label={label}
                type="number"
                value={rules.weekdayRates[day] ?? 0}
                onChange={(e) => setWeekdayRate(day, Number(e.target.value))}
              />
            ))}
          </div>
        </div>

        <div className="seal-divider" />

        <div>
          <p className="text-sm font-medium text-ink-700 dark:text-ivory-200 mb-1">Islamic (Hijri) Season Adjustment</p>
          <p className="text-xs text-ink-400 mb-3">
            Percentage adjustment on top of the day rate depending on the Hijri month — e.g. discount during Ramadan,
            premium during Shawwal wedding season.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HIJRI_MONTHS.map((name, i) => {
              const month = i + 1;
              const multiplier = rules.hijriMonthAdjustments[month] ?? 1;
              const percent = Math.round((multiplier - 1) * 100);
              const Icon = percent > 0 ? TrendingUp : percent < 0 ? TrendingDown : Minus;
              const tone =
                percent > 0
                  ? "text-success-600 dark:text-success-500"
                  : percent < 0
                  ? "text-danger-500"
                  : "text-ink-400";
              return (
                <div
                  key={month}
                  className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 dark:border-ink-600 px-3 py-2"
                >
                  <span className="text-sm text-ink-700 dark:text-ivory-200">{name}</span>
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={tone} />
                    <input
                      type="number"
                      value={percent}
                      onChange={(e) => setHijriAdjustment(month, Number(e.target.value))}
                      className="w-16 rounded-md border border-ink-100 dark:border-ink-600 bg-ivory-50 dark:bg-ink-800 px-2 py-1 text-sm text-right font-mono-tabular"
                    />
                    <span className="text-xs text-ink-400">%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave}>
            <Save size={15} /> Save Rate Settings
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
