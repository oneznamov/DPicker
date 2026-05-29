import { useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import {
  CalendarDate,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "@internationalized/date";
import type { DateOnlyRange } from "./types";
import { getWeekdayLabels, isInRange, isSameDay, orderRange } from "./utils";
import {
  DayButton,
  DayCell,
  GridRoot,
  WeekDayCell,
  WeekRow,
} from "./styled";

interface CalendarGridProps {
  visibleMonth: CalendarDate;
  selectedRange: DateOnlyRange | null;
  hoveredDate: CalendarDate | null;
  anchorDate: CalendarDate | null;
  focusedDate: CalendarDate;
  /** Whether this grid is the one that "owns" the focused date right now. */
  ownsFocus: boolean;
  /** When true, the focused day is auto-focused on mount / when focusedDate changes. */
  shouldAutoFocus: boolean;
  /** Render dimmed days from prev/next month in the surrounding cells. */
  showOutsideDays: boolean;
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
  locale: string;
  today: CalendarDate;
  onSelect: (date: CalendarDate) => void;
  onHover: (date: CalendarDate | null) => void;
  onFocusChange: (date: CalendarDate) => void;
}

export function CalendarGrid(props: CalendarGridProps) {
  const {
    visibleMonth,
    selectedRange,
    hoveredDate,
    anchorDate,
    focusedDate,
    ownsFocus,
    shouldAutoFocus,
    showOutsideDays,
    minValue,
    maxValue,
    locale,
    today,
    onSelect,
    onHover,
    onFocusChange,
  } = props;

  const focusedRef = useRef<HTMLButtonElement | null>(null);

  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const monthEnd = endOfMonth(visibleMonth);
    const gridStart = startOfWeek(monthStart, locale);

    const result: CalendarDate[][] = [];
    let cursor = gridStart;
    for (let w = 0; w < 6; w++) {
      const week: CalendarDate[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(cursor);
        cursor = cursor.add({ days: 1 });
      }
      result.push(week);
      if (week[6].compare(monthEnd) >= 0 && w >= 4) break;
    }
    return result;
  }, [visibleMonth, locale]);

  // While the user is hovering after selecting a first date, render a preview range.
  const previewRange = useMemo(
    () =>
      anchorDate && hoveredDate
        ? orderRange({ start: anchorDate, end: hoveredDate })
        : null,
    [anchorDate, hoveredDate],
  );

  // Auto-focus the focused day when the popover opens or focus moves to a new date.
  useEffect(() => {
    if (ownsFocus && shouldAutoFocus && focusedRef.current) {
      focusedRef.current.focus();
    }
  }, [focusedDate, ownsFocus, shouldAutoFocus]);

  const isDisabled = (date: CalendarDate): boolean => {
    if (minValue && date.compare(minValue) < 0) return true;
    if (maxValue && date.compare(maxValue) > 0) return true;
    return false;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: CalendarDate | null = null;
    switch (e.key) {
      case "ArrowLeft":
        next = focusedDate.subtract({ days: 1 });
        break;
      case "ArrowRight":
        next = focusedDate.add({ days: 1 });
        break;
      case "ArrowUp":
        next = focusedDate.subtract({ weeks: 1 });
        break;
      case "ArrowDown":
        next = focusedDate.add({ weeks: 1 });
        break;
      case "Home":
        next = startOfWeek(focusedDate, locale);
        break;
      case "End":
        next = endOfWeek(focusedDate, locale);
        break;
      case "PageUp":
        next = e.shiftKey
          ? focusedDate.subtract({ years: 1 })
          : focusedDate.subtract({ months: 1 });
        break;
      case "PageDown":
        next = e.shiftKey
          ? focusedDate.add({ years: 1 })
          : focusedDate.add({ months: 1 });
        break;
      case "Enter":
      case " ":
        if (!isDisabled(focusedDate)) {
          e.preventDefault();
          onSelect(focusedDate);
        }
        return;
      default:
        return;
    }
    e.preventDefault();
    onFocusChange(next);
  };

  return (
    <GridRoot
      onKeyDown={handleKeyDown}
      onMouseLeave={() => onHover(null)}
    >
      <WeekRow className="dp-week-row-head">
        {weekdayLabels.map((d, i) => (
          <WeekDayCell key={i}>{d}</WeekDayCell>
        ))}
      </WeekRow>

      {weeks.map((week, wi) => (
        <WeekRow key={wi}>
          {week.map((date) => {
            const inMonth = date.month === visibleMonth.month;

            // Hide outside days entirely if disabled.
            if (!inMonth && !showOutsideDays) {
              return <DayCell key={date.toString()} />;
            }

            const disabled = isDisabled(date);
            const isToday = isSameDay(date, today);

            const inSelected =
              !!selectedRange &&
              isInRange(date, selectedRange.start, selectedRange.end);
            const isSelectedStart =
              !!selectedRange && isSameDay(date, selectedRange.start);
            const isSelectedEnd =
              !!selectedRange && isSameDay(date, selectedRange.end);
            const isSinglePoint =
              !!selectedRange &&
              isSameDay(selectedRange.start, selectedRange.end) &&
              isSameDay(date, selectedRange.start);

            const inPreview =
              !!previewRange &&
              isInRange(date, previewRange.start, previewRange.end);
            const isPreviewStart =
              !!previewRange && isSameDay(date, previewRange.start);
            const isPreviewEnd =
              !!previewRange && isSameDay(date, previewRange.end);

            const isAnchor = !!anchorDate && isSameDay(date, anchorDate);

            // Outside days never participate in range highlight visuals,
            // to keep the visible month visually distinct.
            const inHighlight = inMonth && (inSelected || inPreview);
            const isHighlightStart =
              inMonth && (isSelectedStart || isPreviewStart || isAnchor);
            const isHighlightEnd =
              inMonth &&
              (isSelectedEnd || isPreviewEnd || (isAnchor && !hoveredDate));

            const showHighlight = inHighlight && !isSinglePoint;
            const isEndpoint = isHighlightStart || isHighlightEnd;

            const isFocused =
              ownsFocus && inMonth && isSameDay(date, focusedDate);

            return (
              <DayCell
                key={date.toString()}
                highlighted={showHighlight}
                isStart={isHighlightStart}
                isEnd={isHighlightEnd}
                onMouseEnter={() => onHover(inMonth ? date : null)}
              >
                <DayButton
                  ref={isFocused ? focusedRef : undefined}
                  disabled={disabled}
                  outsideMonth={!inMonth}
                  selected={isEndpoint}
                  isToday={isToday}
                  onClick={() => onSelect(date)}
                  tabIndex={isFocused ? 0 : -1}
                  aria-label={`${date.month}/${date.day}/${date.year}`}
                  aria-pressed={isEndpoint}
                >
                  {date.day}
                </DayButton>
              </DayCell>
            );
          })}
        </WeekRow>
      ))}
    </GridRoot>
  );
}
