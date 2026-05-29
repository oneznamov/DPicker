import type {
  CalendarDate,
  CalendarDateTime,
  Time,
} from "@internationalized/date";

/** A date value — either a date-only or a date+time value from `@internationalized/date`. */
export type DateValue = CalendarDate | CalendarDateTime;

/** An inclusive date range with a start and end value. */
export interface DateRange {
  start: DateValue;
  end: DateValue;
}

/** A single preset shortcut shown in the left-hand presets column. */
export interface PresetDefinition {
  /** Button label shown to the user (e.g. `"Past week"`). */
  label: string;
  /**
   * Returns the start/end pair for this preset.
   * Receives today's `CalendarDate` as a convenience argument.
   */
  getRange: (today: CalendarDate) => { start: CalendarDate; end: CalendarDate };
}

export interface DateRangePickerProps {
  /**
   * Controlled value. Pass `null` to represent an empty/cleared selection.
   * Omit entirely to run the component in uncontrolled mode.
   */
  value?: DateRange | null;
  /**
   * Initial value for uncontrolled mode.
   * Ignored when `value` is provided.
   */
  defaultValue?: DateRange | null;
  /**
   * Called whenever the selected range changes, including when the user
   * clears the selection (receives `null`).
   */
  onChange?: (range: DateRange | null) => void;
  /**
   * Show hour/minute time pickers below each calendar month.
   * When enabled, the value type becomes `CalendarDateTime` and the
   * default mask switches to `"MM/DD/YYYY HH:mm"`.
   * Defaults to `false`.
   */
  showTime?: boolean;
  /**
   * Show the preset shortcuts column on the left side of the popover.
   * Defaults to `true`.
   */
  showPresets?: boolean;
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
   * Custom preset shortcuts to display in the left column.
   * Replaces the built-in `defaultPresets`.
   * Has no effect when `showPresets` is `false`.
   */
  presets?: PresetDefinition[];
  /**
   * Label text rendered above the start-date input field.
   * Defaults to `"Start date"`.
   */
  startLabel?: string;
  /**
   * Label text rendered above the end-date input field.
   * Defaults to `"End date"`.
   */
  endLabel?: string;
  /**
   * BCP-47 locale tag (e.g. `"en-US"`, `"de-DE"`, `"fr-FR"`).
   * Controls weekday order, and weekday/month name language.
   * Defaults to the browser locale.
   */
  locale?: string;
  /**
   * Input mask string. Use `M` (month digit), `D` (day digit), `Y` (year digit),
   * `H` (hour digit), `m` (minute digit) as slot placeholders; any other
   * character is treated as a literal separator.
   * Defaults to `"MM/DD/YYYY"` (or `"MM/DD/YYYY HH:mm"` when `showTime` is `true`).
   * Examples: `"DD/MM/YYYY"`, `"YYYY-MM-DD"`, `"DD.MM.YYYY"`.
   */
  mask?: string;
  /**
   * Disable all dates strictly before today.
   * When both `disablePast` and `minValue` are set the later of the two wins.
   * Defaults to `false`.
   */
  disablePast?: boolean;
  /**
   * Disable the entire control (inputs + calendar icon button).
   * Defaults to `false`.
   */
  disabled?: boolean;
  /**
   * When `true` (default), the input fields show a live text preview of the
   * hovered date range while the user is mid-pick in the calendar.
   * Set to `false` to keep the inputs static during hover.
   * Calendar cell highlighting is unaffected by this prop.
   */
  showHoverPreview?: boolean;
}

export type CalendarView = "day" | "month" | "year";

export interface TimePair {
  start: Time;
  end: Time;
}

export interface DateOnlyRange {
  start: CalendarDate;
  end: CalendarDate;
}
