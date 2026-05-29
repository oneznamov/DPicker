import { CalendarDate } from "@internationalized/date";
import type { PresetDefinition } from "./types";

export const defaultPresets: PresetDefinition[] = [
  /** today − 1 year → today */
  {
    label: "Past year",
    getRange: (today: CalendarDate) => ({
      start: today.subtract({ years: 1 }),
      end: today,
    }),
  },
  /** today − 1 month → today */
  {
    label: "Past month",
    getRange: (today: CalendarDate) => ({
      start: today.subtract({ months: 1 }),
      end: today,
    }),
  },
  /** today − 7 days → today */
  {
    label: "Past week",
    getRange: (today: CalendarDate) => ({
      start: today.subtract({ weeks: 1 }),
      end: today,
    }),
  },
  /** yesterday → yesterday */
  {
    label: "Yesterday",
    getRange: (today: CalendarDate) => {
      const y = today.subtract({ days: 1 });
      return { start: y, end: y };
    },
  },
  /** today → today */
  {
    label: "Today",
    getRange: (today: CalendarDate) => ({ start: today, end: today }),
  },
  /** tomorrow → tomorrow */
  {
    label: "Tomorrow",
    getRange: (today: CalendarDate) => {
      const t = today.add({ days: 1 });
      return { start: t, end: t };
    },
  },
  /** today → today + 7 days */
  {
    label: "Next week",
    getRange: (today: CalendarDate) => ({
      start: today,
      end: today.add({ weeks: 1 }),
    }),
  },
  /** today → today + 1 month */
  {
    label: "Next month",
    getRange: (today: CalendarDate) => ({
      start: today,
      end: today.add({ months: 1 }),
    }),
  },
  /** today → today + 1 year */
  {
    label: "Next year",
    getRange: (today: CalendarDate) => ({
      start: today,
      end: today.add({ years: 1 }),
    }),
  },
];
