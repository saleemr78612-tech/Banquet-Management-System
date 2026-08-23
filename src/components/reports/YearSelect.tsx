import { Select } from "../ui/Select";

interface YearSelectProps {
  value: number;
  onChange: (year: number) => void;
  years: number[];
}

export function YearSelect({ value, onChange, years }: YearSelectProps) {
  return (
    <Select value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-32">
      {years.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </Select>
  );
}
