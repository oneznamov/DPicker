import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDate,
  CalendarDateTime,
  Time,
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today as currentToday,
  toCalendarDate,
} from "@internationalized/date";
import { CalendarPanel } from "../DateRangePicker/CalendarPanel";
import { TimePicker } from "../DateRangePicker/TimePicker";
import {
  Calendars,
  Footer,
  PopoverBody,
  PopoverContent,
  TimeRow,
} from "../DateRangePicker/styled";
import { usePopover } from "../DateRangePicker/usePopover";
import { combineDateTime } from "../DateRangePicker/utils";
import type { CalendarView } from "../DateRangePicker/types";
import { DateInput } from "./DateInput";
import type { DatePickerProps, DateValue } from "./types";

const yearPageStart = (year: number) => Math.floor(year / 12) * 12;

/**
 * Single-date picker. Same architecture as `DateRangePicker` but with one
 * calendar, no presets, and a single editable input. Supports localization,
 * outside-day rendering, custom input mask, optional time picker, and full
 * keyboard navigation.
 */
export function DatePicker(props: DatePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    showTime = false,
    showOutsideDays = false,
    minValue,
    maxValue,
    disablePast = false,
    label = "Date",
    locale = "en-US",
    mask,
    disabled,
  } = props;

  /* ------------------------------------------------------------------ */
  /* Controlled/uncontrolled value                                      */
  /* ------------------------------------------------------------------ */

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<DateValue | null>(
    defaultValue ?? null,
  );
  const currentValue = isControlled ? (value ?? null) : internalValue;

  const commitValue = (next: DateValue | null) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  /* ------------------------------------------------------------------ */
  /* Popover state                                                      */
  /* ------------------------------------------------------------------ */

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverState = usePopover(triggerRef, popoverRef);

  /* ------------------------------------------------------------------ */
  /* Draft state inside the popover                                     */
  /* ------------------------------------------------------------------ */

  const today = useMemo(() => currentToday(getLocalTimeZone()), []);

  const effectiveMinValue = useMemo(() => {
    if (!disablePast) return minValue;
    if (!minValue) return today;
    return minValue.compare(today) > 0 ? minValue : today;
  }, [disablePast, minValue, today]);

  const initialMonth = useMemo(
    () =>
      startOfMonth(currentValue ? toCalendarDate(currentValue) : today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [draftDate, setDraftDate] = useState<CalendarDate | null>(() =>
    currentValue ? toCalendarDate(currentValue) : null,
  );
  const [draftTime, setDraftTime] = useState<Time>(() =>
    currentValue instanceof CalendarDateTime
      ? new Time(currentValue.hour, currentValue.minute)
      : new Time(0, 0),
  );

  const [focusedDate, setFocusedDate] = useState<CalendarDate>(
    () => (currentValue ? toCalendarDate(currentValue) : today),
  );

  const [visibleMonth, setVisibleMonth] = useState<CalendarDate>(initialMonth);
  const [view, setView] = useState<CalendarView>("day");
  const [yearPage, setYearPage] = useState<number>(
    yearPageStart(initialMonth.year),
  );

  // Reset draft state every time the popover opens.
  useEffect(() => {
    if (!popoverState.isOpen) return;
    if (currentValue) {
      const cd = toCalendarDate(currentValue);
      setDraftDate(cd);
      setDraftTime(
        currentValue instanceof CalendarDateTime
          ? new Time(currentValue.hour, currentValue.minute)
          : new Time(0, 0),
      );
      setVisibleMonth(startOfMonth(cd));
      setFocusedDate(cd);
    } else {
      setDraftDate(null);
      setDraftTime(new Time(0, 0));
      setVisibleMonth(startOfMonth(today));
      setFocusedDate(today);
    }
    setView("day");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popoverState.isOpen]);

  /* ------------------------------------------------------------------ */
  /* Day grid handlers                                                  */
  /* ------------------------------------------------------------------ */

  const handleSelectDate = (date: CalendarDate) => {
    setDraftDate(date);
    setFocusedDate(date);
  };

  const handleFocusChange = (date: CalendarDate) => {
    setFocusedDate(date);
    const monthStart = startOfMonth(visibleMonth);
    const monthEnd = endOfMonth(visibleMonth);
    if (date.compare(monthStart) < 0 || date.compare(monthEnd) > 0) {
      const newMonth = startOfMonth(date);
      setVisibleMonth(newMonth);
      setYearPage(yearPageStart(newMonth.year));
    }
  };

  /* ------------------------------------------------------------------ */
  /* Header navigation                                                  */
  /* ------------------------------------------------------------------ */

  const navigateMonths = (deltaMonths: number) => {
    const next = visibleMonth.add({ months: deltaMonths });
    setVisibleMonth(next);
    setYearPage(yearPageStart(next.year));
  };

  const handleSelectMonth = (m: number) => {
    setVisibleMonth(visibleMonth.set({ month: m }));
    setView("day");
  };
  const handleSelectYear = (y: number) => {
    setVisibleMonth(visibleMonth.set({ year: y }));
    setView("month");
  };

  /* ------------------------------------------------------------------ */
  /* Footer / commit                                                    */
  /* ------------------------------------------------------------------ */

  const handleApply = () => {
    if (!draftDate) {
      commitValue(null);
    } else if (showTime) {
      commitValue(combineDateTime(draftDate, draftTime));
    } else {
      commitValue(draftDate);
    }
    popoverState.close();
  };

  const handleClearInPopover = () => {
    setDraftDate(null);
  };

  const handleClearAll = () => {
    setDraftDate(null);
    commitValue(null);
  };

  const handleCommitField = (next: DateValue) => {
    commitValue(next);
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  // Selected range used for grid highlighting (a single point).
  const selectedRange = draftDate
    ? { start: draftDate, end: draftDate }
    : null;

  return (
    <>
      <div
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={popoverState.isOpen}
      >
        <DateInput
          value={currentValue}
          showTime={showTime}
          label={label}
          isOpen={popoverState.isOpen}
          disabled={disabled}
          mask={mask}
          locale={locale}
          onOpen={popoverState.open}
          onClear={handleClearAll}
          onCommit={handleCommitField}
        />
      </div>

      {popoverState.isOpen && (
      <div ref={popoverRef} className="dp-popover" role="dialog">
        <PopoverContent>
          <PopoverBody>
            <div>
              <Calendars>
                <CalendarPanel
                  visibleMonth={visibleMonth}
                  view={view}
                  yearPageStart={yearPage}
                  side="single"
                  selectedRange={selectedRange}
                  hoveredDate={null}
                  anchorDate={null}
                  focusedDate={focusedDate}
                  ownsFocus
                  shouldAutoFocus={popoverState.isOpen}
                  showOutsideDays={showOutsideDays}
                  minValue={effectiveMinValue}
                  maxValue={maxValue}
                  locale={locale}
                  today={today}
                  onNavigate={navigateMonths}
                  onYearPageNavigate={(d) => setYearPage(yearPage + d)}
                  onSetView={setView}
                  onSelectMonth={handleSelectMonth}
                  onSelectYear={handleSelectYear}
                  onSelectDate={handleSelectDate}
                  onHoverDate={() => {}}
                  onFocusChange={handleFocusChange}
                />
              </Calendars>
              {showTime && (
                <>
                  <div className="dp-divider" />
                  <TimeRow>
                    <TimePicker
                      label="Time"
                      value={draftTime}
                      onChange={setDraftTime}
                    />
                  </TimeRow>
                </>
              )}
            </div>
          </PopoverBody>
          <div className="dp-divider" />
          <Footer>
            <button
              type="button"
              className="dp-action-button dp-action-button-muted"
              onClick={handleClearInPopover}
            >
              Clear
            </button>
            <button
              type="button"
              className="dp-action-button"
              onClick={popoverState.close}
            >
              Cancel
            </button>
            <button
              type="button"
              className="dp-action-button dp-action-button-primary"
              onClick={handleApply}
              disabled={!draftDate}
            >
              Apply
            </button>
          </Footer>
        </PopoverContent>
      </div>
      )}
    </>
  );
}
