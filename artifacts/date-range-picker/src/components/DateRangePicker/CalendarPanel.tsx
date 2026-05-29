import { CalendarDate } from "@internationalized/date";
import type { CalendarView, DateOnlyRange } from "./types";
import { CalendarGrid } from "./CalendarGrid";
import { MonthView, YearView } from "./MonthYearView";
import { formatMonth } from "./utils";
import {
  CalendarHeader,
  CalendarHeaderButton,
  CalendarHeaderTitle,
  NavButton,
  YearRangeLabel,
} from "./styled";

interface CalendarPanelProps {
  visibleMonth: CalendarDate;
  view: CalendarView;
  yearPageStart: number;
  /** "left" / "right" hides nav arrows that conflict in two-month layout. Use "single" for a lone calendar. */
  side: "left" | "right" | "single";
  selectedRange: DateOnlyRange | null;
  hoveredDate: CalendarDate | null;
  anchorDate: CalendarDate | null;
  focusedDate: CalendarDate;
  ownsFocus: boolean;
  shouldAutoFocus: boolean;
  showOutsideDays: boolean;
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
  locale: string;
  today: CalendarDate;
  onNavigate: (deltaMonths: number) => void;
  onYearPageNavigate: (delta: number) => void;
  onSetView: (view: CalendarView) => void;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  onSelectDate: (date: CalendarDate) => void;
  onHoverDate: (date: CalendarDate | null) => void;
  onFocusChange: (date: CalendarDate) => void;
}

export function CalendarPanel(props: CalendarPanelProps) {
  const {
    visibleMonth,
    view,
    yearPageStart,
    side,
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
    onNavigate,
    onYearPageNavigate,
    onSetView,
    onSelectMonth,
    onSelectYear,
    onSelectDate,
    onHoverDate,
    onFocusChange,
  } = props;

  // In day view of a two-month layout, hide arrows that would conflict with the other panel.
  const showLeftNav = side !== "right" || view !== "day";
  const showRightNav = side !== "left" || view !== "day";

  const handlePrev = () => {
    if (view === "year") onYearPageNavigate(-12);
    else if (view === "month") onNavigate(-12);
    else onNavigate(-1);
  };

  const handleNext = () => {
    if (view === "year") onYearPageNavigate(12);
    else if (view === "month") onNavigate(12);
    else onNavigate(1);
  };

  const renderTitle = () => {
    if (view === "year") {
      return (
        <YearRangeLabel>
          {yearPageStart} – {yearPageStart + 11}
        </YearRangeLabel>
      );
    }
    return (
      <>
        <CalendarHeaderButton
          active={view === "month"}
          onClick={() => onSetView(view === "month" ? "day" : "month")}
        >
          {formatMonth(visibleMonth.month, locale, "long")}
        </CalendarHeaderButton>
        <CalendarHeaderButton onClick={() => onSetView("year")}>
          {visibleMonth.year}
        </CalendarHeaderButton>
      </>
    );
  };

  return (
    <div className="dp-calendar-panel">
      <CalendarHeader>
        <NavButton
          onClick={handlePrev}
          hidden={!showLeftNav}
          aria-label="Previous"
        >
          <span aria-hidden="true">‹</span>
        </NavButton>
        <CalendarHeaderTitle>{renderTitle()}</CalendarHeaderTitle>
        <NavButton
          onClick={handleNext}
          hidden={!showRightNav}
          aria-label="Next"
        >
          <span aria-hidden="true">›</span>
        </NavButton>
      </CalendarHeader>

      {view === "day" && (
        <CalendarGrid
          visibleMonth={visibleMonth}
          selectedRange={selectedRange}
          hoveredDate={hoveredDate}
          anchorDate={anchorDate}
          focusedDate={focusedDate}
          ownsFocus={ownsFocus}
          shouldAutoFocus={shouldAutoFocus}
          showOutsideDays={showOutsideDays}
          minValue={minValue}
          maxValue={maxValue}
          locale={locale}
          today={today}
          onSelect={onSelectDate}
          onHover={onHoverDate}
          onFocusChange={onFocusChange}
        />
      )}
      {view === "month" && (
        <MonthView
          visibleMonth={visibleMonth}
          locale={locale}
          onSelect={onSelectMonth}
        />
      )}
      {view === "year" && (
        <YearView
          visibleMonth={visibleMonth}
          pageStartYear={yearPageStart}
          onSelect={onSelectYear}
        />
      )}
    </div>
  );
}
