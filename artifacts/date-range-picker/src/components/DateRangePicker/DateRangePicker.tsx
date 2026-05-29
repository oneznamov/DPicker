import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDate,
  Time,
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today as currentToday,
  toCalendarDate,
} from "@internationalized/date";
import type {
  CalendarView,
  DateOnlyRange,
  DateRange,
  DateRangePickerProps,
  DateValue,
  TimePair,
} from "./types";
import { defaultPresets } from "./presets";
import { Presets } from "./PresetList";
import { CalendarPanel } from "./CalendarPanel";
import { TimePicker } from "./TimePicker";
import { DateRangeInput } from "./DateRangeInput";
import {
  applyTimeToRange,
  extractTimePair,
  orderRange,
} from "./utils";
import { usePopover } from "./usePopover";
import {
  Calendars,
  Footer,
  PopoverBody,
  PopoverContent,
  TimeRow,
} from "./styled";

const yearPageStart = (year: number) => Math.floor(year / 12) * 12;

/**
 * React + CSS + @internationalized/date range picker.
 *
 * Familiar date-range picker behavior:
 *   - Two month calendars side by side
 *   - Click month/year header to switch into month/year picker
 *   - Optional preset shortcuts column
 *   - Optional time pickers below the calendars
 *   - Editable input fields; clicking any field opens the calendar
 */
export function DateRangePicker(props: DateRangePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    showTime = false,
    showPresets = true,
    showOutsideDays = false,
    minValue,
    maxValue,
    disablePast = false,
    presets = defaultPresets,
    startLabel = "Start date",
    endLabel = "End date",
    locale = "en-US",
    mask,
    disabled,
    showHoverPreview = true,
  } = props;

  /* ------------------------------------------------------------------ */
  /* Controlled/uncontrolled value                                      */
  /* ------------------------------------------------------------------ */

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<DateRange | null>(
    defaultValue ?? null,
  );
  const currentValue = isControlled ? (value ?? null) : internalValue;

  const commitValue = (next: DateRange | null) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  /* ------------------------------------------------------------------ */
  /* Popover state                                                      */
  /* ------------------------------------------------------------------ */

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverState = usePopover(triggerRef, popoverRef);

  // Signals which side opened the calendar (set before popoverState.open()).
  // The reset effect reads this ref on the first render after opening.
  const pendingOpenSideRef = useRef<"start" | "end" | null>(null);

  /* ------------------------------------------------------------------ */
  /* Draft state inside the popover                                     */
  /* ------------------------------------------------------------------ */

  const today = useMemo(() => currentToday(getLocalTimeZone()), []);

  // When disablePast is on, clamp minValue to today (taking the later date if
  // the caller also passed an explicit minValue).
  const effectiveMinValue = useMemo(() => {
    if (!disablePast) return minValue;
    if (!minValue) return today;
    return minValue.compare(today) > 0 ? minValue : today;
  }, [disablePast, minValue, today]);

  const initialMonth = useMemo(
    () =>
      startOfMonth(
        currentValue ? toCalendarDate(currentValue.start) : today,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [draftRange, setDraftRange] = useState<DateOnlyRange | null>(() =>
    currentValue
      ? {
          start: toCalendarDate(currentValue.start),
          end: toCalendarDate(currentValue.end),
        }
      : null,
  );
  const [draftTimes, setDraftTimes] = useState<TimePair>(() =>
    extractTimePair(currentValue),
  );

  const [anchorDate, setAnchorDate] = useState<CalendarDate | null>(null);
  const [hoveredDate, setHoveredDate] = useState<CalendarDate | null>(null);
  const [focusedDate, setFocusedDate] = useState<CalendarDate>(
    () => (currentValue ? toCalendarDate(currentValue.start) : today),
  );

  const [leftMonth, setLeftMonth] = useState<CalendarDate>(initialMonth);
  const [leftView, setLeftView] = useState<CalendarView>("day");
  const [rightView, setRightView] = useState<CalendarView>("day");
  const [leftYearPage, setLeftYearPage] = useState<number>(
    yearPageStart(initialMonth.year),
  );
  const [rightYearPage, setRightYearPage] = useState<number>(
    yearPageStart(initialMonth.add({ months: 1 }).year),
  );

  const rightMonth = useMemo(
    () => leftMonth.add({ months: 1 }),
    [leftMonth],
  );

  // Reset draft state every time the popover opens.
  // Reads pendingOpenSideRef to set the correct initial anchor + focus.
  useEffect(() => {
    if (!popoverState.isOpen) return;

    const openSide = pendingOpenSideRef.current;
    pendingOpenSideRef.current = null;

    if (currentValue) {
      const startDate = toCalendarDate(currentValue.start);
      const endDate = toCalendarDate(currentValue.end);
      setDraftRange({ start: startDate, end: endDate });
      setDraftTimes(extractTimePair(currentValue));

      if (openSide === "end") {
        // Open in end-pick mode: navigate so end date is on the right calendar,
        // pre-set anchor to start so the next click finalises the end date.
        const endMonth = startOfMonth(endDate);
        const leftCandidate = endMonth.subtract({ months: 1 });
        setLeftMonth(leftCandidate);
        setLeftYearPage(yearPageStart(leftCandidate.year));
        setRightYearPage(yearPageStart(endMonth.year));
        setFocusedDate(endDate);
        setAnchorDate(startDate);
      } else {
        setLeftMonth(startOfMonth(startDate));
        setLeftYearPage(yearPageStart(startDate.year));
        setRightYearPage(yearPageStart(startDate.add({ months: 1 }).year));
        setFocusedDate(startDate);
        setAnchorDate(null);
      }
    } else {
      setDraftRange(null);
      setDraftTimes({ start: new Time(0, 0), end: new Time(23, 59) });
      setLeftMonth(startOfMonth(today));
      setLeftYearPage(yearPageStart(today.year));
      setRightYearPage(yearPageStart(today.add({ months: 1 }).year));
      setFocusedDate(today);
      setAnchorDate(null);
    }
    setHoveredDate(null);
    setLeftView("day");
    setRightView("day");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popoverState.isOpen]);

  /* ------------------------------------------------------------------ */
  /* Day grid handlers                                                  */
  /* ------------------------------------------------------------------ */

  const handleSelectDate = (date: CalendarDate) => {
    if (!anchorDate) {
      setAnchorDate(date);
      setDraftRange({ start: date, end: date });
      setHoveredDate(null);
    } else {
      const ordered = orderRange({ start: anchorDate, end: date });
      setDraftRange(ordered);
      setAnchorDate(null);
      setHoveredDate(null);
    }
    setFocusedDate(date);
  };

  const handlePresetSelect = (range: DateOnlyRange) => {
    setDraftRange(range);
    setAnchorDate(null);
    setHoveredDate(null);
    setLeftMonth(startOfMonth(range.start));
    setFocusedDate(range.start);
    setLeftView("day");
    setRightView("day");
  };

  // Move keyboard focus to a new date and ensure it stays visible
  // across the two-month window.
  const handleFocusChange = (date: CalendarDate) => {
    setFocusedDate(date);
    const leftStart = startOfMonth(leftMonth);
    const rightEnd = endOfMonth(leftMonth.add({ months: 1 }));
    if (date.compare(leftStart) < 0) {
      setLeftMonth(startOfMonth(date));
      setLeftYearPage(yearPageStart(date.year));
      setRightYearPage(yearPageStart(date.add({ months: 1 }).year));
    } else if (date.compare(rightEnd) > 0) {
      const newLeft = startOfMonth(date.subtract({ months: 1 }));
      setLeftMonth(newLeft);
      setLeftYearPage(yearPageStart(newLeft.year));
      setRightYearPage(yearPageStart(date.year));
    }
    if (anchorDate) setHoveredDate(date);
  };

  /* ------------------------------------------------------------------ */
  /* Header navigation                                                  */
  /* ------------------------------------------------------------------ */

  const navigateMonths = (deltaMonths: number) => {
    const newLeft = leftMonth.add({ months: deltaMonths });
    setLeftMonth(newLeft);
    setLeftYearPage(yearPageStart(newLeft.year));
    setRightYearPage(yearPageStart(newLeft.add({ months: 1 }).year));
  };

  const handleLeftSelectMonth = (m: number) => {
    setLeftMonth(leftMonth.set({ month: m }));
    setLeftView("day");
  };
  const handleLeftSelectYear = (y: number) => {
    setLeftMonth(leftMonth.set({ year: y }));
    setLeftView("month");
  };
  const handleRightSelectMonth = (m: number) => {
    setLeftMonth(rightMonth.set({ month: m }).subtract({ months: 1 }));
    setRightView("day");
  };
  const handleRightSelectYear = (y: number) => {
    setLeftMonth(rightMonth.set({ year: y }).subtract({ months: 1 }));
    setRightView("month");
  };

  /* ------------------------------------------------------------------ */
  /* Footer / commit                                                    */
  /* ------------------------------------------------------------------ */

  const handleApply = () => {
    if (!draftRange) {
      commitValue(null);
    } else {
      commitValue(applyTimeToRange(draftRange, draftTimes, showTime));
    }
    popoverState.close();
  };

  const handleClearInPopover = () => {
    setDraftRange(null);
    setAnchorDate(null);
    setHoveredDate(null);
  };

  const handleClearAll = () => {
    setDraftRange(null);
    setAnchorDate(null);
    setHoveredDate(null);
    commitValue(null);
  };

  /* ------------------------------------------------------------------ */
  /* Direct edits from the input fields                                 */
  /* ------------------------------------------------------------------ */

  const handleCommitField = (side: "start" | "end", parsed: DateValue) => {
    const existing = currentValue ?? { start: parsed, end: parsed };
    const next: DateRange = {
      start: side === "start" ? parsed : existing.start,
      end: side === "end" ? parsed : existing.end,
    };
    const ordered =
      toCalendarDate(next.start).compare(toCalendarDate(next.end)) <= 0
        ? next
        : { start: next.end, end: next.start };
    commitValue(ordered);
  };

  // Called when the user clicks or presses Space on an input field.
  // Sets pendingOpenSideRef before opening so the reset effect sees it.
  const handleOpenAtField = (side: "start" | "end") => {
    if (popoverState.isOpen) return;
    pendingOpenSideRef.current = side;
    popoverState.open();
  };

  // null = closed; "start" = picking start; "end" = picking end (anchor set)
  const activeField: "start" | "end" | null = popoverState.isOpen
    ? anchorDate === null
      ? "start"
      : "end"
    : null;

  // While the user has set an anchor and is hovering a candidate date, derive
  // an ordered preview range so the input fields can display it.
  const hoverRange = useMemo(() => {
    if (!anchorDate || !hoveredDate) return null;
    return orderRange({ start: anchorDate, end: hoveredDate });
  }, [anchorDate, hoveredDate]);

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <>
      <div
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={popoverState.isOpen}
      >
        <DateRangeInput
          range={currentValue}
          showTime={showTime}
          startLabel={startLabel}
          endLabel={endLabel}
          isOpen={popoverState.isOpen}
          disabled={disabled}
          mask={mask}
          activeField={activeField}
          locale={locale}
          hoverRange={hoverRange}
          showHoverPreview={showHoverPreview}
          onOpen={popoverState.open}
          onClear={handleClearAll}
          onCommitField={handleCommitField}
          onOpenAtField={handleOpenAtField}
        />
      </div>

      {popoverState.isOpen && (
      <div ref={popoverRef} className="dp-popover" role="dialog">
        <PopoverContent>
          <PopoverBody>
            {showPresets && (
              <Presets
                presets={presets}
                selectedRange={draftRange}
                onSelect={handlePresetSelect}
              />
            )}
            <div>
              <Calendars>
                <CalendarPanel
                  visibleMonth={leftMonth}
                  view={leftView}
                  yearPageStart={leftYearPage}
                  side="left"
                  selectedRange={draftRange}
                  hoveredDate={hoveredDate}
                  anchorDate={anchorDate}
                  focusedDate={focusedDate}
                  ownsFocus={focusedDate.month === leftMonth.month && focusedDate.year === leftMonth.year}
                  shouldAutoFocus={popoverState.isOpen}
                  showOutsideDays={showOutsideDays}
                  minValue={effectiveMinValue}
                  maxValue={maxValue}
                  locale={locale}
                  today={today}
                  onNavigate={navigateMonths}
                  onYearPageNavigate={(d) =>
                    setLeftYearPage(leftYearPage + d)
                  }
                  onSetView={setLeftView}
                  onSelectMonth={handleLeftSelectMonth}
                  onSelectYear={handleLeftSelectYear}
                  onSelectDate={handleSelectDate}
                  onHoverDate={setHoveredDate}
                  onFocusChange={handleFocusChange}
                />
                <div className="dp-divider-vertical" />
                <CalendarPanel
                  visibleMonth={rightMonth}
                  view={rightView}
                  yearPageStart={rightYearPage}
                  side="right"
                  selectedRange={draftRange}
                  hoveredDate={hoveredDate}
                  anchorDate={anchorDate}
                  focusedDate={focusedDate}
                  ownsFocus={focusedDate.month === rightMonth.month && focusedDate.year === rightMonth.year}
                  shouldAutoFocus={popoverState.isOpen}
                  showOutsideDays={showOutsideDays}
                  minValue={effectiveMinValue}
                  maxValue={maxValue}
                  locale={locale}
                  today={today}
                  onNavigate={navigateMonths}
                  onYearPageNavigate={(d) =>
                    setRightYearPage(rightYearPage + d)
                  }
                  onSetView={setRightView}
                  onSelectMonth={handleRightSelectMonth}
                  onSelectYear={handleRightSelectYear}
                  onSelectDate={handleSelectDate}
                  onHoverDate={setHoveredDate}
                  onFocusChange={handleFocusChange}
                />
              </Calendars>
              {showTime && (
                <>
                  <div className="dp-divider" />
                  <TimeRow>
                    <TimePicker
                      label="Start"
                      value={draftTimes.start}
                      onChange={(t) =>
                        setDraftTimes({ ...draftTimes, start: t })
                      }
                    />
                    <TimePicker
                      label="End"
                      value={draftTimes.end}
                      onChange={(t) =>
                        setDraftTimes({ ...draftTimes, end: t })
                      }
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
              disabled={!draftRange}
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
