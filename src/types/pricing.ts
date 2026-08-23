export const WEEKDAY_LABELS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Base rate (PKR) charged for a booking depending on which day of week the event falls on. */
export interface WeekdayRates {
  [dayIndex: number]: number; // 0 = Sunday ... 6 = Saturday
}

/**
 * Multiplier applied on top of the weekday base rate depending on the Hijri month
 * the event date falls in. 1 = no change, >1 = peak season (e.g. wedding season
 * right after Ramadan), <1 = off season / discount (e.g. Muharram, Ramadan).
 */
export interface HijriMonthAdjustments {
  [hijriMonth: number]: number; // 1-12
}

export interface PricingRules {
  weekdayRates: WeekdayRates;
  hijriMonthAdjustments: HijriMonthAdjustments;
}

export const defaultPricingRules: PricingRules = {
  weekdayRates: {
    0: 280000, // Sunday
    1: 220000, // Monday
    2: 220000, // Tuesday
    3: 220000, // Wednesday
    4: 250000, // Thursday
    5: 350000, // Friday
    6: 380000, // Saturday
  },
  hijriMonthAdjustments: {
    1: 0.8, // Muharram — mourning month, low demand
    2: 1.0, // Safar
    3: 1.1, // Rabi al-Awwal — Mawlid season, moderate demand
    4: 1.0, // Rabi al-Thani
    5: 1.0, // Jumada al-Awwal
    6: 1.0, // Jumada al-Thani
    7: 1.0, // Rajab
    8: 1.05, // Shaban — pre-Ramadan events
    9: 0.7, // Ramadan — fasting month, weddings rare
    10: 1.2, // Shawwal — major post-Ramadan wedding season
    11: 1.0, // Dhu al-Qadah
    12: 0.85, // Dhu al-Hijjah — Hajj season, lower demand
  },
};

export function computeSuggestedRate(eventDate: string, rules: PricingRules, hijriMonth: number): number {
  const day = new Date(eventDate).getDay();
  const base = rules.weekdayRates[day] ?? 0;
  const multiplier = rules.hijriMonthAdjustments[hijriMonth] ?? 1;
  return Math.round((base * multiplier) / 1000) * 1000;
}
