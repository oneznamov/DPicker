import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import { Box, FormControl, IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { InputActions, InputLabel } from "./styled";
import type { DateOnlyRange, DateRange, DateValue } from "./types";
import {
  applyMask,
  DEFAULT_MASK_DATE,
  DEFAULT_MASK_DATETIME,
  formatWithMask,
  hasMMMToken,
  parseDateInput,
} from "./utils";

export interface DateRangeInputProps {
  range: DateRange | null;
  showTime: boolean;
  startLabel: string;
  endLabel: string;
  isOpen: boolean;
  disabled?: boolean;
  /** Custom input mask, e.g. `"DD/MM/YYYY"` or `"DD-MMM-YYYY"`. */
  mask?: string;
  /**
   * Which field the calendar is currently filling.
   * `"start"` or `"end"` while the popover is open; `null` when closed.
   * Used to highlight the active field.
   */
  activeField?: "start" | "end" | null;
  /** BCP-47 locale — needed for MMM mask formatting/parsing. */
  locale?: string;
  /**
   * Preview range derived from the anchor + hovered date while picking.
   * When set and `showHoverPreview` is true, the input fields display these
   * dates instead of the committed range. Display-only — no state is mutated.
   */
  hoverRange?: DateOnlyRange | null;
  /**
   * When `false`, the hover preview is suppressed in the input fields even if
   * `hoverRange` is provided. Defaults to `true`.
   */
  showHoverPreview?: boolean;
  onOpen: () => void;
  onClear: () => void;
  onCommitField: (side: "start" | "end", value: DateValue) => void;
  /**
   * Called when the user clicks or presses Space/Enter on an input field.
   * The parent uses this to open the calendar focused on the correct side.
   */
  onOpenAtField?: (side: "start" | "end") => void;
}

/**
 * Given a masked output string, returns the character index after the Nth digit.
 * Used to restore cursor position after the mask reformats the input.
 */
function findCursorInMasked(masked: string, digitCount: number): number {
  let count = 0;
  for (let i = 0; i < masked.length; i++) {
    if (/\d/.test(masked[i])) {
      count++;
      if (count === digitCount) return i + 1;
    }
  }
  return masked.length;
}

export const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(
  function DateRangeInput(props, ref) {
    const {
      range,
      showTime,
      startLabel,
      endLabel,
      isOpen,
      disabled,
      mask,
      activeField = null,
      locale = "en-US",
      hoverRange = null,
      showHoverPreview = true,
      onOpen,
      onClear,
      onCommitField,
      onOpenAtField,
    } = props;

    const startId = useId();
    const endId = useId();
    const effectiveMask =
      mask ?? (showTime ? DEFAULT_MASK_DATETIME : DEFAULT_MASK_DATE);
    const placeholder = effectiveMask;
    const inputMode = hasMMMToken(effectiveMask) ? "text" : "numeric";

    const [startText, setStartText] = useState("");
    const [endText, setEndText] = useState("");

    const startInputRef = useRef<HTMLInputElement>(null);
    const endInputRef = useRef<HTMLInputElement>(null);
    const pendingStartCursor = useRef<number | null>(null);
    const pendingEndCursor = useRef<number | null>(null);

    // Restore cursor position after React re-renders the masked value.
    useLayoutEffect(() => {
      if (pendingStartCursor.current !== null && startInputRef.current) {
        const pos = pendingStartCursor.current;
        startInputRef.current.setSelectionRange(pos, pos);
        pendingStartCursor.current = null;
      }
    });

    useLayoutEffect(() => {
      if (pendingEndCursor.current !== null && endInputRef.current) {
        const pos = pendingEndCursor.current;
        endInputRef.current.setSelectionRange(pos, pos);
        pendingEndCursor.current = null;
      }
    });

    // Sync text whenever the controlled value or mask changes.
    useEffect(() => {
      setStartText(formatWithMask(range?.start, effectiveMask, locale));
    }, [range?.start, effectiveMask, locale]);

    useEffect(() => {
      setEndText(formatWithMask(range?.end, effectiveMask, locale));
    }, [range?.end, effectiveMask, locale]);

    const lastCommitted = (side: "start" | "end") =>
      formatWithMask(
        side === "start" ? range?.start : range?.end,
        effectiveMask,
        locale,
      );

    const commit = (side: "start" | "end", text: string) => {
      if (text.trim() === "") {
        if (side === "start") setStartText(lastCommitted("start"));
        else setEndText(lastCommitted("end"));
        return;
      }
      const parsed = parseDateInput(text, showTime, effectiveMask, locale);
      if (parsed) {
        onCommitField(side, parsed);
      } else {
        if (side === "start") setStartText(lastCommitted("start"));
        else setEndText(lastCommitted("end"));
      }
    };

    const handleChange =
      (side: "start" | "end") => (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const cursorBefore = e.target.selectionStart ?? raw.length;
        const digitsBeforeCursor = raw
          .slice(0, cursorBefore)
          .replace(/\D/g, "").length;

        const inputType =
          (e.nativeEvent as InputEvent).inputType ?? "insertText";
        const isBackspace =
          inputType === "deleteContentBackward" ||
          inputType === "deleteContentForward" ||
          inputType === "deleteByCut";
        const masked = applyMask(raw, effectiveMask, isBackspace, locale, digitsBeforeCursor);
        const newCursor = findCursorInMasked(masked, digitsBeforeCursor);

        if (side === "start") {
          pendingStartCursor.current = newCursor;
          setStartText(masked);
        } else {
          pendingEndCursor.current = newCursor;
          setEndText(masked);
        }
      };

    const handleBlur =
      (side: "start" | "end") => (e: FocusEvent<HTMLInputElement>) => {
        commit(side, e.target.value);
      };

    const handleKeyDown =
      (side: "start" | "end") => (e: KeyboardEvent<HTMLInputElement>) => {
        // Space or Enter when the popover is closed → open the calendar.
        if ((e.key === " " || e.key === "Spacebar" || e.key === "Enter") && !isOpen) {
          e.preventDefault();
          if (onOpenAtField) {
            onOpenAtField(side);
          } else {
            onOpen();
          }
          return;
        }
        // Enter when the popover is already open → commit the typed value.
        if (e.key === "Enter") {
          e.preventDefault();
          commit(side, (e.target as HTMLInputElement).value);
        }
      };

    // Click on the input text area opens the calendar (not just the icon).
    // Stops propagation so the icon button click doesn't double-fire.
    const handleInputClick =
      (side: "start" | "end") => (e: MouseEvent<HTMLInputElement>) => {
        if (isOpen) return;
        e.stopPropagation();
        if (onOpenAtField) {
          onOpenAtField(side);
        } else {
          onOpen();
        }
      };

    // When hovering a candidate end date, optionally override what the fields
    // display. This is purely presentational — startText/endText not mutated.
    const effectiveHoverRange = showHoverPreview ? hoverRange : null;
    const displayStartText = effectiveHoverRange
      ? formatWithMask(effectiveHoverRange.start, effectiveMask, locale)
      : startText;
    const displayEndText = effectiveHoverRange
      ? formatWithMask(effectiveHoverRange.end, effectiveMask, locale)
      : endText;

    // Shared sx for each OutlinedInput — keeps font consistent.
    const inputSx = {
      fontSize: 13.5,
      fontFamily: "inherit",
      "& input": { padding: "6px 12px", cursor: "text" },
      "& input::placeholder": { color: "text.disabled", opacity: 1 },
    } as const;

    return (
      <Box
        ref={ref}
        sx={{
          display: "flex",
          alignItems: "flex-end",
          minWidth: 320,
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        {/* ── Start field ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <InputLabel htmlFor={startId}>{startLabel}</InputLabel>
          <FormControl
            focused={activeField === "start"}
            size="small"
            sx={{ width: "100%" }}
          >
            <OutlinedInput
              inputRef={startInputRef}
              id={startId}
              value={displayStartText}
              placeholder={placeholder}
              notched={false}
              label={undefined}
              onChange={handleChange("start")}
              onBlur={handleBlur("start")}
              onKeyDown={handleKeyDown("start")}
              inputProps={{
                inputMode,
                onClick: handleInputClick("start"),
              }}
              sx={{
                ...inputSx,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                "& .MuiOutlinedInput-notchedOutline": { borderRight: "none" },
              }}
            />
          </FormControl>
        </Box>

        {/* ── End field ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <InputLabel htmlFor={endId}>{endLabel}</InputLabel>
          <FormControl
            focused={activeField === "end"}
            size="small"
            sx={{ width: "100%" }}
          >
            <OutlinedInput
              inputRef={endInputRef}
              id={endId}
              value={displayEndText}
              placeholder={placeholder}
              notched={false}
              label={undefined}
              onChange={handleChange("end")}
              onBlur={handleBlur("end")}
              onKeyDown={handleKeyDown("end")}
              inputProps={{
                inputMode,
                onClick: handleInputClick("end"),
              }}
              endAdornment={
                <InputAdornment position="end" sx={{ gap: 0.25, ml: 0 }}>
                  <InputActions>
                    {range && (
                      <IconButton
                        size="small"
                        aria-label="Clear date range"
                        onClick={onClear}
                        sx={{ color: "text.secondary" }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      aria-label="Open calendar"
                      onClick={onOpen}
                      sx={{ color: "text.secondary" }}
                    >
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputActions>
                </InputAdornment>
              }
              sx={{
                ...inputSx,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            />
          </FormControl>
        </Box>
      </Box>
    );
  },
);
