import { CalendarDate } from "@internationalized/date";
import { MonthYearButton, MonthYearGrid } from "./styled";
import { formatMonth } from "./utils";

interface MonthViewProps {
  visibleMonth: CalendarDate;
  locale: string;
  onSelect: (month: number) => void;
}

export function MonthView({ visibleMonth, locale, onSelect }: MonthViewProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <MonthYearGrid>
      {months.map((m) => (
        <MonthYearButton
          key={m}
          active={m === visibleMonth.month}
          onClick={() => onSelect(m)}
        >
          {formatMonth(m, locale, "short")}
        </MonthYearButton>
      ))}
    </MonthYearGrid>
  );
}

interface YearViewProps {
  visibleMonth: CalendarDate;
  pageStartYear: number;
  onSelect: (year: number) => void;
}

export function YearView({
  visibleMonth,
  pageStartYear,
  onSelect,
}: YearViewProps) {
  const years = Array.from({ length: 12 }, (_, i) => pageStartYear + i);
  return (
    <MonthYearGrid>
      {years.map((y) => (
        <MonthYearButton
          key={y}
          active={y === visibleMonth.year}
          onClick={() => onSelect(y)}
        >
          {y}
        </MonthYearButton>
      ))}
    </MonthYearGrid>
  );
}
