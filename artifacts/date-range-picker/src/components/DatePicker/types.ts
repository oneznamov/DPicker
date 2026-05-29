import type { CalendarDate } from "@internationalized/date";
import type { DateValue } from "../DateRangePicker/types";

export type { DateValue };

export interface DatePickerProps {
  /**
   * Controlled value. Pass `null` to represent an empty/cleared selection.
   * Omit entirely to run the component in uncontrolled mode.
   */
  value?: DateValue | null;
  /**
   * Initial value for uncontrolled mode.
   * Ignored when `value` is provided.
   */
  defaultValue?: DateValue | null;
  /**
   * Called whenever the selected date changes, including when the user
   * clears the selection (receives `null`).
   */
  onChange?: (value: DateValue | null) => void;
  /**
   * Show an hour/minute time picker below the calendar month.
   * When enabled, the value type becomes `CalendarDateTime` and the
   * default mask switches to `"MM/DD/YYYY HH:mm"`.
   * Defaults to `false`.
   */
  showTime?: boolean;
  /**
   * Render days from the previous/next month in the empty cells around the
   * visible month, using subtle styling to distinguish them.
   * Defaults to `false` (out-of-month cells are blank).
   */
  showOutsideDays?: boolean;
  /**
   * The earliest selectable date (inclusive).
   * Dates before this value are disabled in the calendar.
   */
  minValue?: CalendarDate;
  /**
   * The latest selectable date (inclusive).
   * Dates after this value are disabled in the calendar.
   */
  maxValue?: CalendarDate;
  /**
   * Label text rendered above the date input field.
   * Defaults to `"Date"`.
   */
  label?: string;
  /**
   * BCP-47 locale tag (e.g. `"en-US"`, `"de-DE"`).
   * Controls weekday order, and weekday/month name language.
   * Defaults to the browser locale.
   */
  locale?: string;
  /**
   * Input mask string. Use `M` (month digit), `D` (day digit), `Y` (year digit),
   * `H` (hour digit), `m` (minute digit) as slot placeholders; any other
   * character is treated as a literal separator.
   * Defaults to `"MM/DD/YYYY"` (or `"MM/DD/YYYY HH:mm"` when `showTime` is `true`).
   */
  mask?: string;
  /**
   * Disable all dates strictly before today.
   * When both `disablePast` and `minValue` are set the later of the two wins.
   * Defaults to `false`.
   */
  disablePast?: boolean;
  /**
   * Disable the entire control (input + calendar icon button).
   * Defaults to `false`.
   */
  disabled?: boolean;
}
