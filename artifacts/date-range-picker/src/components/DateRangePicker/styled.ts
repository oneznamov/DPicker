import { Box, ButtonBase, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";

/* -------------------------------------------------------------------------- */
/* Input field                                                                */
/* -------------------------------------------------------------------------- */

export const InputLabel: any = styled("label")(({ theme }) => ({
  fontSize: 10.5,
  fontWeight: 500,
  lineHeight: 1.2,
  color: theme.palette.text.secondary,
}));

export const InputActions: any = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.25),
}));

/* -------------------------------------------------------------------------- */
/* Popover layout                                                             */
/* -------------------------------------------------------------------------- */

export const PopoverContent: any = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

export const PopoverBody: any = styled(Box)({
  display: "flex",
  alignItems: "stretch",
});

export const Calendars: any = styled(Box)({
  display: "flex",
  alignItems: "stretch",
});

/* -------------------------------------------------------------------------- */
/* Presets                                                                    */
/* -------------------------------------------------------------------------- */

export const PresetsList: any = styled(Box)(({ theme }) => ({
  width: 168,
  borderRight: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  display: "flex",
  flexDirection: "column",
  gap: 2,
  backgroundColor: "rgba(0, 0, 0, 0.015)",
}));

export const PresetsTitle: any = styled("div")(({ theme }) => ({
  padding: `${theme.spacing(1)} ${theme.spacing(2)} ${theme.spacing(0.5)}`,
  fontSize: 11,
  letterSpacing: 0.5,
  fontWeight: 600,
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
}));

export const PresetButton: any = styled(ButtonBase, {
  shouldForwardProp: (p) => p !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  justifyContent: "flex-start",
  padding: `${theme.spacing(0.875)} ${theme.spacing(2)}`,
  fontSize: 13,
  fontWeight: active ? 600 : 400,
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  textAlign: "left",
  backgroundColor: active ? "rgba(25, 118, 210, 0.08)" : "transparent",
  borderRadius: 0,
  transition: "background-color 120ms ease",
  "&:hover": {
    backgroundColor: active
      ? "rgba(25, 118, 210, 0.12)"
      : "rgba(0, 0, 0, 0.04)",
  },
}));

/* -------------------------------------------------------------------------- */
/* Calendar header                                                            */
/* -------------------------------------------------------------------------- */

export const CalendarHeader: any = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${theme.spacing(1.5)} ${theme.spacing(1.5)} ${theme.spacing(0.5)}`,
}));

export const CalendarHeaderTitle: any = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

export const CalendarHeaderButton: any = styled(ButtonBase, {
  shouldForwardProp: (p) => p !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  fontSize: 14,
  fontWeight: 600,
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  borderRadius: theme.shape.borderRadius,
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

export const NavButton: any = styled(IconButton, {
  shouldForwardProp: (p) => p !== "hidden",
})<{ hidden?: boolean }>(({ theme, hidden }) => ({
  visibility: hidden ? "hidden" : "visible",
  color: theme.palette.text.secondary,
}));

/* -------------------------------------------------------------------------- */
/* Calendar grid                                                              */
/* -------------------------------------------------------------------------- */

export const GridRoot: any = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  width: 280,
}));

export const WeekRow: any = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
});

export const WeekDayCell: any = styled(Box)(({ theme }) => ({
  textAlign: "center",
  fontSize: 12,
  color: theme.palette.text.secondary,
  fontWeight: 500,
  padding: `${theme.spacing(0.75)} 0`,
}));

interface DayCellProps {
  highlighted?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
}

export const DayCell: any = styled(Box, {
  shouldForwardProp: (p) =>
    p !== "highlighted" && p !== "isStart" && p !== "isEnd",
})<DayCellProps>(({ highlighted, isStart, isEnd }) => ({
  position: "relative",
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: highlighted ? "rgba(25, 118, 210, 0.12)" : "transparent",
  borderTopLeftRadius: isStart ? 18 : 0,
  borderBottomLeftRadius: isStart ? 18 : 0,
  borderTopRightRadius: isEnd ? 18 : 0,
  borderBottomRightRadius: isEnd ? 18 : 0,
}));

interface DayButtonProps {
  outsideMonth?: boolean;
  selected?: boolean;
  isToday?: boolean;
}

export const DayButton: any = styled(ButtonBase, {
  shouldForwardProp: (p) =>
    p !== "outsideMonth" && p !== "selected" && p !== "isToday",
})<DayButtonProps>(({ theme, outsideMonth, selected, isToday }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  fontSize: outsideMonth ? 11.5 : 13,
  fontWeight: selected ? 600 : outsideMonth ? 300 : 400,
  fontStyle: outsideMonth && !selected ? "italic" : "normal",
  color: outsideMonth && !selected
    ? "rgba(0, 0, 0, 0.32)"
    : selected
      ? "#fff"
      : theme.palette.text.primary,
  backgroundColor: selected ? theme.palette.primary.main : "transparent",
  border: isToday && !selected ? `1px solid ${theme.palette.primary.main}` : "none",
  opacity: outsideMonth && !selected ? 0.85 : 1,
  "&:hover": {
    backgroundColor: selected
      ? theme.palette.primary.dark
      : outsideMonth
        ? "rgba(0, 0, 0, 0.03)"
        : "rgba(0, 0, 0, 0.06)",
  },
  "&.Mui-focusVisible, &:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
  "&.Mui-disabled": {
    color: theme.palette.text.disabled,
    opacity: 0.4,
  },
}));

/* -------------------------------------------------------------------------- */
/* Month/year picker                                                          */
/* -------------------------------------------------------------------------- */

export const MonthYearGrid: any = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  width: 280,
  height: 252,
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: theme.spacing(0.5),
}));

export const MonthYearButton: any = styled(ButtonBase, {
  shouldForwardProp: (p) => p !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  borderRadius: Number(theme.shape.borderRadius) * 2,
  fontSize: 13,
  fontWeight: active ? 600 : 400,
  color: active ? "#fff" : theme.palette.text.primary,
  backgroundColor: active ? theme.palette.primary.main : "transparent",
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : "rgba(0, 0, 0, 0.06)",
  },
}));

export const YearRangeLabel: any = styled(Box)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  color: theme.palette.text.primary,
  padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
}));

/* -------------------------------------------------------------------------- */
/* Time row                                                                   */
/* -------------------------------------------------------------------------- */

export const TimeRow: any = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-around",
  gap: theme.spacing(2),
  padding: `${theme.spacing(1.25)} ${theme.spacing(2)}`,
}));

export const TimeRowItem: any = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const TimeRowLabel: any = styled("span")(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
  minWidth: 36,
  fontWeight: 500,
}));

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

export const Footer: any = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
}));
