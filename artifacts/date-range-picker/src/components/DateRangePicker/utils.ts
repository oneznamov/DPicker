import {
  CalendarDate,
  CalendarDateTime,
  Time,
  endOfMonth,
  getLocalTimeZone,
  startOfWeek,
  toCalendarDate,
  toCalendarDateTime,
} from "@internationalized/date";
import type { DateRange, DateValue, TimePair } from "./types";

/* -------------------------------------------------------------------------- */
/* Default masks                                                              */
/* -------------------------------------------------------------------------- */

export const DEFAULT_MASK_DATE = "MM/DD/YYYY";
export const DEFAULT_MASK_DATETIME = "MM/DD/YYYY HH:mm";

/* -------------------------------------------------------------------------- */
/* Localization                                                               */
/* -------------------------------------------------------------------------- */

const monthFmtCache = new Map<string, Intl.DateTimeFormat>();
const weekdayCache = new Map<string, string[]>();
const monthAbbrCache = new Map<string, string[]>();

function getMonthFormatter(
  locale: string,
  format: "long" | "short",
): Intl.DateTimeFormat {
  const key = `${locale}|${format}`;
  let fmt = monthFmtCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, { month: format });
    monthFmtCache.set(key, fmt);
  }
  return fmt;
}

/** Localized month name. `month` is 1-indexed (1 = January). */
export function formatMonth(
  month: number,
  locale: string,
  format: "long" | "short" = "long",
): string {
  const fmt = getMonthFormatter(locale, format);
  return fmt.format(new Date(2024, month - 1, 15));
}

function getMonthAbbreviations(locale: string): string[] {
  const cached = monthAbbrCache.get(locale);
  if (cached) return cached;
  const abbrs: string[] = [];
  for (let m = 1; m <= 12; m++) {
    abbrs.push(formatMonth(m, locale, "short").replace(/\.$/, "").toLowerCase());
  }
  monthAbbrCache.set(locale, abbrs);
  return abbrs;
}

/** Returns 1-indexed month number for a (possibly partial) abbreviation, or null. */
function lookupMonthAbbr(abbr: string, locale: string): number | null {
  const lower = abbr.toLowerCase().replace(/\.$/, "");
  if (!lower) return null;
  const abbrs = getMonthAbbreviations(locale);
  const exact = abbrs.findIndex((a) => a === lower);
  if (exact >= 0) return exact + 1;
  const prefix = abbrs.findIndex((a) => a.startsWith(lower));
  return prefix >= 0 ? prefix + 1 : null;
}

/**
 * 7 short weekday labels starting from the locale's first day of week.
 */
export function getWeekdayLabels(locale: string): string[] {
  const cached = weekdayCache.get(locale);
  if (cached) return cached;

  const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const reference = new CalendarDate(2024, 1, 7); // a Sunday
  const start = startOfWeek(reference, locale);
  const tz = getLocalTimeZone();
  const labels: string[] = [];
  let cursor = start;
  for (let i = 0; i < 7; i++) {
    labels.push(fmt.format(cursor.toDate(tz)));
    cursor = cursor.add({ days: 1 });
  }
  weekdayCache.set(locale, labels);
  return labels;
}

/* -------------------------------------------------------------------------- */
/* Range helpers                                                              */
/* -------------------------------------------------------------------------- */

export function isSameDay(a: CalendarDate, b: CalendarDate): boolean {
  return a.compare(b) === 0;
}

export function isInRange(
  date: CalendarDate,
  start: CalendarDate,
  end: CalendarDate,
): boolean {
  const ordered = orderRange({ start, end });
  return date.compare(ordered.start) >= 0 && date.compare(ordered.end) <= 0;
}

export function orderRange(range: {
  start: CalendarDate;
  end: CalendarDate;
}): { start: CalendarDate; end: CalendarDate } {
  return range.start.compare(range.end) <= 0
    ? range
    : { start: range.end, end: range.start };
}

/* -------------------------------------------------------------------------- */
/* Mask segment types                                                         */
/* -------------------------------------------------------------------------- */

type DigitField = "D" | "Y" | "H" | "m";
type MaskField = "M" | "D" | "Y" | "H" | "m";

type MaskSegment =
  | { kind: "numMonth"; count: number }
  | { kind: "abbrMonth" }
  | { kind: "digit"; field: DigitField; count: number }
  | { kind: "literal"; chars: string };

/** Decompose a mask string into typed segments. */
function parseMaskToSegments(mask: string): MaskSegment[] {
  const segments: MaskSegment[] = [];
  let i = 0;
  while (i < mask.length) {
    const ch = mask[i];
    if (ch === "M") {
      let count = 0;
      while (i < mask.length && mask[i] === "M") {
        count++;
        i++;
      }
      segments.push(
        count === 3 ? { kind: "abbrMonth" } : { kind: "numMonth", count },
      );
    } else if ("DYHm".includes(ch)) {
      const field = ch as DigitField;
      let count = 0;
      while (i < mask.length && mask[i] === ch) {
        count++;
        i++;
      }
      segments.push({ kind: "digit", field, count });
    } else {
      let chars = "";
      while (i < mask.length && !"MDYHm".includes(mask[i])) {
        chars += mask[i++];
      }
      segments.push({ kind: "literal", chars });
    }
  }
  return segments;
}

/** Returns true if the mask contains a `MMM` (abbreviated-month) token. */
export function hasMMMToken(mask: string): boolean {
  return parseMaskToSegments(mask).some((s) => s.kind === "abbrMonth");
}

/* -------------------------------------------------------------------------- */
/* applyMask — re-format raw input as the user types                         */
/* -------------------------------------------------------------------------- */

/**
 * Re-formats `input` according to `mask`.
 *
 * @param digitsBeforeCursor - Number of digit characters that appeared before
 *   the cursor in the raw string after the edit. Pass this when `isBackspace`
 *   is true to enable slot-aware editing that prevents mid-string deletions
 *   from pulling later digits (e.g. time values) into earlier slots.
 */
export function applyMask(
  input: string,
  mask: string,
  isBackspace: boolean,
  locale: string = "en-US",
  digitsBeforeCursor?: number,
): string {
  const segments = parseMaskToSegments(mask);
  const hasAbbr = segments.some((s) => s.kind === "abbrMonth");
  return hasAbbr
    ? applyMixedMask(input, segments, isBackspace, locale)
    : applyDigitMask(input, segments, isBackspace, digitsBeforeCursor);
}

/* -------------------------------------------------------------------------- */
/* applyDigitMask — digit-only masks                                         */
/* -------------------------------------------------------------------------- */

type SlotInfo = {
  kind: "numMonth" | "digit";
  size: number;
  field?: DigitField;
};

function applyDigitMask(
  input: string,
  segments: MaskSegment[],
  isBackspace: boolean,
  digitsBeforeCursor?: number,
): string {
  const allDigits = input.replace(/\D/g, "");
  if (allDigits.length === 0) return "";

  // Collect digit-bearing slots in order.
  const slots: SlotInfo[] = [];
  for (const seg of segments) {
    if (seg.kind === "numMonth") slots.push({ kind: "numMonth", size: seg.count });
    else if (seg.kind === "digit") slots.push({ kind: "digit", size: seg.count, field: seg.field });
  }

  const values: string[] = new Array(slots.length).fill("");

  const usesBidir =
    isBackspace &&
    digitsBeforeCursor !== undefined &&
    digitsBeforeCursor < allDigits.length;

  if (usesBidir) {
    // Bidirectional fill: before-cursor digits fill from the left;
    // after-cursor digits fill remaining slots from the left starting after
    // the boundary slot. This prevents a deletion in the middle (e.g. inside
    // the year) from pulling time digits forward into earlier slots.
    const beforeDigits = allDigits.slice(0, digitsBeforeCursor);
    const afterDigits = allDigits.slice(digitsBeforeCursor!);

    // Left pass — consume beforeDigits into slots from the start.
    let bi = 0;
    let leftBoundary = slots.length;
    for (let i = 0; i < slots.length && bi < beforeDigits.length; i++) {
      const chunk = beforeDigits.slice(bi, bi + slots[i].size);
      values[i] = chunk;
      bi += chunk.length;
      if (chunk.length < slots[i].size) {
        // Partial slot — after-cursor digits start at the NEXT slot.
        leftBoundary = i + 1;
        break;
      }
      leftBoundary = i + 1;
    }

    // Right pass — fill remaining (unfilled) slots from afterDigits.
    let ai = 0;
    for (let i = leftBoundary; i < slots.length && ai < afterDigits.length; i++) {
      const chunk = afterDigits.slice(ai, ai + slots[i].size);
      values[i] = chunk;
      ai += chunk.length;
      if (chunk.length < slots[i].size) break;
    }
  } else {
    // Normal forward-only fill (typing forward, or backspacing at the end).
    let maxDigits = 0;
    for (const s of slots) maxDigits += s.size;
    const used = allDigits.slice(0, maxDigits);
    let di = 0;
    for (let i = 0; i < slots.length && di < used.length; i++) {
      const chunk = used.slice(di, di + slots[i].size);
      values[i] = chunk;
      di += chunk.length;
      if (chunk.length < slots[i].size) break;
    }
  }

  // Apply clamping for fully filled slots.
  const filled: Partial<Record<MaskField, number>> = {};
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (values[i].length !== s.size) continue;
    const num = Number(values[i]);
    if (s.kind === "numMonth") {
      const clamped = Math.min(12, Math.max(1, num));
      values[i] = String(clamped).padStart(s.size, "0");
      filled["M"] = clamped;
    } else if (s.field === "D") {
      const m = filled["M"] ?? 1;
      const y = filled["Y"] ?? 2000;
      const lastDay = endOfMonth(new CalendarDate(y, m, 1)).day;
      const clamped = Math.min(lastDay, Math.max(1, num));
      values[i] = String(clamped).padStart(s.size, "0");
      filled["D"] = clamped;
    } else if (s.field) {
      filled[s.field] = num;
    }
  }

  // Reconstruct the masked string from segments + slot values.
  let result = "";
  let si = 0;
  let anyFilled = false;
  for (const seg of segments) {
    if (seg.kind === "literal") {
      if (!anyFilled) break;
      // Suppress trailing separator if no slot after it has content
      // (standard backspace UX — don't leave a dangling "/").
      const hasMore = values.slice(si).some((v) => v.length > 0);
      if (!hasMore && isBackspace) break;
      result += seg.chars;
    } else if (seg.kind === "numMonth" || seg.kind === "digit") {
      const val = values[si];
      if (!val || val.length === 0) {
        si++;
        break;
      }
      result += val;
      anyFilled = true;
      si++;
    }
  }

  return result;
}

// Matches Unicode letters including Latin Extended (ä, é, ö, ü, à, ô …).
const UNICODE_LETTER_RE = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F]/;

function applyMixedMask(
  input: string,
  segments: MaskSegment[],
  isBackspace: boolean,
  _locale: string,
): string {
  const digits = input.replace(/\D/g, "");
  let rawLetters = "";
  for (const ch of input) {
    if (UNICODE_LETTER_RE.test(ch)) rawLetters += ch;
    if (rawLetters.length === 3) break;
  }
  const letters =
    rawLetters.length > 0
      ? rawLetters[0].toUpperCase() + rawLetters.slice(1).toLowerCase()
      : "";

  if (digits.length === 0 && letters.length === 0) return "";

  const numericFallback = letters.length === 0;

  let maxDigits = 0;
  for (const seg of segments) {
    if (seg.kind === "digit" || seg.kind === "numMonth") maxDigits += seg.count;
    else if (seg.kind === "abbrMonth" && numericFallback) maxDigits += 2;
  }

  const usedDigits = digits.slice(0, maxDigits);
  const usedLetters = letters.slice(0, 3);
  const totalAvailable = usedDigits.length + usedLetters.length;

  let result = "";
  let di = 0;
  let li = 0;
  const consumed = () => di + li;

  for (const seg of segments) {
    if (di >= usedDigits.length && li >= usedLetters.length) break;

    if (seg.kind === "literal") {
      if (consumed() === 0) break;
      if (consumed() === totalAvailable && isBackspace) break;
      result += seg.chars;
    } else if (seg.kind === "abbrMonth") {
      if (numericFallback) {
        const chunk = usedDigits.slice(di, di + 2);
        if (chunk.length === 0) break;
        result += chunk;
        di += chunk.length;
      } else {
        const chunk = usedLetters.slice(li, li + 3);
        if (chunk.length === 0) break;
        result += chunk;
        li += chunk.length;
      }
    } else {
      const slotSize = seg.count;
      const chunk = usedDigits.slice(di, di + slotSize);
      if (chunk.length === 0) break;
      result += chunk;
      di += chunk.length;
      if (chunk.length < slotSize) break;
    }
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function formatWithMask(
  value: DateValue | null | undefined,
  mask: string,
  locale: string = "en-US",
): string {
  if (!value) return "";
  const segments = parseMaskToSegments(mask);
  let result = "";
  for (const seg of segments) {
    if (seg.kind === "literal") {
      result += seg.chars;
    } else if (seg.kind === "abbrMonth") {
      result += formatMonth(value.month, locale, "short").replace(/\.$/, "");
    } else if (seg.kind === "numMonth") {
      result += String(value.month).padStart(seg.count, "0");
    } else {
      let num = 0;
      switch (seg.field) {
        case "D":
          num = value.day;
          break;
        case "Y":
          num = value.year;
          break;
        case "H":
          num = value instanceof CalendarDateTime ? value.hour : 0;
          break;
        case "m":
          num = value instanceof CalendarDateTime ? value.minute : 0;
          break;
      }
      result += String(num).padStart(seg.count, "0");
    }
  }
  return result;
}

/** Compatibility helper used by demo code. */
export function formatDateTime(
  value: DateValue | null | undefined,
  showTime: boolean,
  mask?: string,
  locale?: string,
): string {
  if (!value) return "";
  const m = mask ?? (showTime ? DEFAULT_MASK_DATETIME : DEFAULT_MASK_DATE);
  return formatWithMask(value, m, locale);
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

function parseWithMask(
  text: string,
  mask: string,
  locale: string = "en-US",
): Partial<Record<MaskField, number>> | null {
  const segments = parseMaskToSegments(mask);
  const out: Partial<Record<MaskField, number>> = {};
  let ti = 0;

  for (const seg of segments) {
    if (seg.kind === "literal") {
      for (const ch of seg.chars) {
        if (ti >= text.length) {
          const remainingChars = seg.chars.slice(seg.chars.indexOf(ch));
          const restMask = remainingChars;
          if (/^[\s:]*$/.test(restMask) && out.M !== undefined && out.D !== undefined && out.Y !== undefined) {
            return out;
          }
          return null;
        }
        if (text[ti] !== ch) return null;
        ti++;
      }
    } else if (seg.kind === "abbrMonth") {
      let raw = "";
      while (raw.length < 4 && ti < text.length && UNICODE_LETTER_RE.test(text[ti])) {
        raw += text[ti++];
      }
      if (raw.length > 0) {
        const monthNum = lookupMonthAbbr(raw, locale);
        if (!monthNum) return null;
        out["M"] = monthNum;
      } else {
        let num = "";
        while (num.length < 2 && ti < text.length && /\d/.test(text[ti])) {
          num += text[ti++];
        }
        if (num.length === 0) return null;
        out["M"] = Number(num);
      }
    } else {
      const field: MaskField =
        seg.kind === "numMonth" ? "M" : seg.field;
      const slotSize = seg.count;
      let raw = "";
      while (raw.length < slotSize && ti < text.length && /\d/.test(text[ti])) {
        raw += text[ti++];
      }
      if (raw.length === 0) {
        if (field === "H" || field === "m") break;
        return null;
      }
      out[field] = Number(raw);
    }
  }

  if (out.M === undefined || out.D === undefined || out.Y === undefined) {
    return null;
  }
  return out;
}

export function parseDateInput(
  text: string,
  showTime: boolean,
  mask?: string,
  locale: string = "en-US",
): DateValue | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const m = mask ?? (showTime ? DEFAULT_MASK_DATETIME : DEFAULT_MASK_DATE);
  const fields = parseWithMask(trimmed, m, locale);
  if (!fields) return null;

  const year = fields.Y!;
  const month = Math.min(12, Math.max(1, fields.M!));
  const lastDay = endOfMonth(new CalendarDate(year, month, 1)).day;
  const day = Math.min(lastDay, Math.max(1, fields.D!));
  const hour = fields.H ?? 0;
  const minute = fields.m ?? 0;

  if (showTime && (hour < 0 || hour > 23 || minute < 0 || minute > 59)) return null;

  try {
    if (showTime) {
      return new CalendarDateTime(year, month, day, hour, minute);
    }
    return new CalendarDate(year, month, day);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Time helpers                                                               */
/* -------------------------------------------------------------------------- */

export function extractTimePair(range: DateRange | null): TimePair {
  const startTime =
    range?.start instanceof CalendarDateTime
      ? new Time(range.start.hour, range.start.minute)
      : new Time(0, 0);
  const endTime =
    range?.end instanceof CalendarDateTime
      ? new Time(range.end.hour, range.end.minute)
      : new Time(23, 59);
  return { start: startTime, end: endTime };
}

export function combineDateTime(
  date: DateValue,
  time: Time,
): CalendarDateTime {
  return toCalendarDateTime(toCalendarDate(date)).set({
    hour: time.hour,
    minute: time.minute,
    second: 0,
    millisecond: 0,
  });
}

export function applyTimeToRange(
  range: { start: CalendarDate; end: CalendarDate },
  times: TimePair,
  showTime: boolean,
): DateRange {
  if (!showTime) return { start: range.start, end: range.end };
  return {
    start: combineDateTime(range.start, times.start),
    end: combineDateTime(range.end, times.end),
  };
}
