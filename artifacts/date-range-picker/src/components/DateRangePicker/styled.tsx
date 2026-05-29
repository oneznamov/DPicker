import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LabelHTMLAttributes,
} from "react";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export const InputLabel = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(function InputLabel({ className, ...props }, ref) {
  return <label ref={ref} className={cx("dp-input-label", className)} {...props} />;
});

export const InputActions = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function InputActions({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-input-actions", className)} {...props} />;
});

export const PopoverContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function PopoverContent({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-popover-content", className)} {...props} />;
});

export const PopoverBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function PopoverBody({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-popover-body", className)} {...props} />;
});

export const Calendars = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Calendars({ className, ...props }, ref) {
    return <div ref={ref} className={cx("dp-calendars", className)} {...props} />;
  },
);

export const PresetsList = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function PresetsList({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-presets", className)} {...props} />;
});

export const PresetsTitle = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function PresetsTitle({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-presets-title", className)} {...props} />;
});

export const PresetButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
>(function PresetButton({ className, active, type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("dp-preset-button", className)}
      data-active={active ? "true" : undefined}
      {...props}
    />
  );
});

export const CalendarHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CalendarHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-calendar-header", className)} {...props} />;
});

export const CalendarHeaderTitle = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CalendarHeaderTitle({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cx("dp-calendar-header-title", className)} {...props} />
  );
});

export const CalendarHeaderButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
>(function CalendarHeaderButton(
  { className, active, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("dp-header-button", className)}
      data-active={active ? "true" : undefined}
      {...props}
    />
  );
});

export const NavButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { hidden?: boolean }
>(function NavButton({ className, hidden, type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("dp-nav-button", className)}
      data-hidden={hidden ? "true" : undefined}
      {...props}
    />
  );
});

export const GridRoot = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function GridRoot({ className, ...props }, ref) {
    return <div ref={ref} className={cx("dp-grid-root", className)} {...props} />;
  },
);

export const WeekRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function WeekRow({ className, ...props }, ref) {
    return <div ref={ref} className={cx("dp-week-row", className)} {...props} />;
  },
);

export const WeekDayCell = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function WeekDayCell({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-weekday", className)} {...props} />;
});

export const DayCell = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    highlighted?: boolean;
    isStart?: boolean;
    isEnd?: boolean;
  }
>(function DayCell(
  { className, highlighted, isStart, isEnd, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("dp-day-cell", className)}
      data-highlighted={highlighted ? "true" : undefined}
      data-start={isStart ? "true" : undefined}
      data-end={isEnd ? "true" : undefined}
      {...props}
    />
  );
});

export const DayButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    outsideMonth?: boolean;
    selected?: boolean;
    isToday?: boolean;
  }
>(function DayButton(
  { className, outsideMonth, selected, isToday, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("dp-day-button", className)}
      data-outside={outsideMonth ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-today={isToday ? "true" : undefined}
      {...props}
    />
  );
});

export const MonthYearGrid = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function MonthYearGrid({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-month-year-grid", className)} {...props} />;
});

export const MonthYearButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
>(function MonthYearButton(
  { className, active, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("dp-month-year-button", className)}
      data-active={active ? "true" : undefined}
      {...props}
    />
  );
});

export const YearRangeLabel = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function YearRangeLabel({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-year-range", className)} {...props} />;
});

export const TimeRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TimeRow({ className, ...props }, ref) {
    return <div ref={ref} className={cx("dp-time-row", className)} {...props} />;
  },
);

export const TimeRowItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function TimeRowItem({ className, ...props }, ref) {
  return <div ref={ref} className={cx("dp-time-item", className)} {...props} />;
});

export const TimeRowLabel = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(function TimeRowLabel({ className, ...props }, ref) {
  return <span ref={ref} className={cx("dp-time-label", className)} {...props} />;
});

export const Footer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Footer({ className, ...props }, ref) {
    return <div ref={ref} className={cx("dp-footer", className)} {...props} />;
  },
);
