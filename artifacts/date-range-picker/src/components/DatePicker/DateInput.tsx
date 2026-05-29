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
import { InputActions, InputLabel } from "../DateRangePicker/styled";
import {
  applyMask,
  DEFAULT_MASK_DATE,
  DEFAULT_MASK_DATETIME,
  formatWithMask,
  hasMMMToken,
  parseDateInput,
} from "../DateRangePicker/utils";
import type { DateValue } from "../DateRangePicker/types";

export interface DateInputProps {
  value: DateValue | null;
  showTime: boolean;
  label: string;
  isOpen: boolean;
  disabled?: boolean;
  mask?: string;
  /** BCP-47 locale — needed for MMM mask formatting/parsing. */
  locale?: string;
  onOpen: () => void;
  onClear: () => void;
  onCommit: (value: DateValue) => void;
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

/** Single-date input with the same masking + manual editing as the range input. */
export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  function DateInput(props, ref) {
    const {
      value,
      showTime,
      label,
      isOpen,
      disabled,
      mask,
      locale = "en-US",
      onOpen,
      onClear,
      onCommit,
    } = props;

    const inputId = useId();
    const effectiveMask =
      mask ?? (showTime ? DEFAULT_MASK_DATETIME : DEFAULT_MASK_DATE);
    const inputMode = hasMMMToken(effectiveMask) ? "text" : "numeric";

    const [text, setText] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);
    const pendingCursor = useRef<number | null>(null);

    // Restore cursor position after React re-renders the masked value.
    useLayoutEffect(() => {
      if (pendingCursor.current !== null && inputRef.current) {
        const pos = pendingCursor.current;
        inputRef.current.setSelectionRange(pos, pos);
        pendingCursor.current = null;
      }
    });

    useEffect(() => {
      setText(formatWithMask(value, effectiveMask, locale));
    }, [value, effectiveMask, locale]);

    const lastCommitted = () => formatWithMask(value, effectiveMask, locale);

    const commit = (raw: string) => {
      if (raw.trim() === "") {
        setText(lastCommitted());
        return;
      }
      const parsed = parseDateInput(raw, showTime, effectiveMask, locale);
      if (parsed) {
        onCommit(parsed);
      } else {
        setText(lastCommitted());
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      const masked = applyMask(e.target.value, effectiveMask, isBackspace, locale, digitsBeforeCursor);

      pendingCursor.current = findCursorInMasked(masked, digitsBeforeCursor);
      setText(masked);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      commit(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Space or Enter when the popover is closed → open the calendar.
      if ((e.key === " " || e.key === "Spacebar" || e.key === "Enter") && !isOpen) {
        e.preventDefault();
        onOpen();
        return;
      }
      // Enter when the popover is already open → commit the typed value.
      if (e.key === "Enter") {
        e.preventDefault();
        commit((e.target as HTMLInputElement).value);
      }
    };

    // Clicking the input text area opens the calendar.
    const handleInputClick = (e: MouseEvent<HTMLInputElement>) => {
      if (isOpen) return;
      e.stopPropagation();
      onOpen();
    };

    return (
      <Box
        ref={ref}
        sx={{
          display: "inline-flex",
          flexDirection: "column",
          gap: 0.5,
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <InputLabel htmlFor={inputId}>{label}</InputLabel>
        <FormControl focused={isOpen} size="small">
          <OutlinedInput
            inputRef={inputRef}
            id={inputId}
            value={text}
            placeholder={effectiveMask}
            notched={false}
            label={undefined}
            disabled={disabled}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            inputProps={{
              inputMode,
              onClick: handleInputClick,
            }}
            endAdornment={
              <InputAdornment position="end" sx={{ gap: 0.25, ml: 0 }}>
                <InputActions>
                  {value && (
                    <IconButton
                      size="small"
                      aria-label="Clear date"
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
              fontSize: 13.5,
              fontFamily: "inherit",
              minWidth: 280,
              "& input": { padding: "6px 12px", cursor: "text" },
              "& input::placeholder": { color: "text.disabled", opacity: 1 },
            }}
          />
        </FormControl>
      </Box>
    );
  },
);
