import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  CalendarDateTime,
  toCalendarDate,
} from "@internationalized/date";
import { DateRangePicker } from "@/components/DateRangePicker";
import type { DateRange } from "@/components/DateRangePicker";
import { DatePicker } from "@/components/DatePicker";
import type { DateValue } from "@/components/DatePicker";

const MASKS_DATE = [
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY-MM-DD",
  "DD.MM.YYYY",
  "DD-MMM-YYYY",
];
const MASKS_DATETIME = [
  "MM/DD/YYYY HH:mm",
  "DD/MM/YYYY HH:mm",
  "YYYY-MM-DD HH:mm",
  "DD.MM.YYYY HH:mm",
  "DD-MMM-YYYY HH:mm",
];

const LOCALES: { value: string; label: string }[] = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "de-DE", label: "Deutsch" },
  { value: "fr-FR", label: "Français" },
  { value: "es-ES", label: "Español" },
  { value: "ja-JP", label: "日本語" },
];

function formatValue(d: DateValue): string {
  const date = toCalendarDate(d);
  const base = `${String(date.month).padStart(2, "0")}/${String(date.day).padStart(2, "0")}/${date.year}`;
  if (d instanceof CalendarDateTime) {
    return `${base} ${String(d.hour).padStart(2, "0")}:${String(d.minute).padStart(2, "0")}`;
  }
  return base;
}

export default function Home() {
  const [showTime, setShowTime] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const [showOutsideDays, setShowOutsideDays] = useState(false);
  const [disablePast, setDisablePast] = useState(false);
  const [showHoverPreview, setShowHoverPreview] = useState(true);
  const [locale, setLocale] = useState("en-US");
  const [maskIndex, setMaskIndex] = useState(0);

  const [range, setRange] = useState<DateRange | null>(null);
  const [single, setSingle] = useState<DateValue | null>(null);

  const masks = showTime ? MASKS_DATETIME : MASKS_DATE;
  const mask = masks[Math.min(maskIndex, masks.length - 1)];

  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: -0.5 }}
            >
              Date Pickers
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mt: 1 }}
            >
              MUI v7 + React Aria + <code>@internationalized/date</code>.
              Range picker and single-date picker share the same calendar,
              localization, masked input and keyboard logic.
            </Typography>
          </Box>

          {/* ------------------------ Shared options ------------------------ */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", fontWeight: 600 }}
              >
                Options
              </Typography>

              <Stack direction="row" spacing={3} flexWrap="wrap" rowGap={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showTime}
                      onChange={(e) => {
                        setShowTime(e.target.checked);
                        setRange(null);
                        setSingle(null);
                      }}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Time picker</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showPresets}
                      onChange={(e) => setShowPresets(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Presets (range only)
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOutsideDays}
                      onChange={(e) => setShowOutsideDays(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">Show outside days</Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={disablePast}
                      onChange={(e) => {
                        setDisablePast(e.target.checked);
                        setRange(null);
                        setSingle(null);
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">Disable past dates</Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showHoverPreview}
                      onChange={(e) => setShowHoverPreview(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">Hover preview in inputs</Typography>
                  }
                />
              </Stack>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    mb: 0.75,
                    display: "block",
                  }}
                >
                  Locale
                </Typography>
                <ToggleButtonGroup
                  value={locale}
                  exclusive
                  size="small"
                  onChange={(_, v) => v && setLocale(v)}
                  sx={{ flexWrap: "wrap" }}
                >
                  {LOCALES.map((l) => (
                    <ToggleButton
                      key={l.value}
                      value={l.value}
                      sx={{ textTransform: "none", py: 0.5 }}
                    >
                      {l.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    mb: 0.75,
                    display: "block",
                  }}
                >
                  Input mask
                </Typography>
                <ToggleButtonGroup
                  value={maskIndex}
                  exclusive
                  size="small"
                  onChange={(_, v) =>
                    typeof v === "number" && setMaskIndex(v)
                  }
                  sx={{ flexWrap: "wrap" }}
                >
                  {masks.map((m, i) => (
                    <ToggleButton
                      key={m}
                      value={i}
                      sx={{
                        textTransform: "none",
                        py: 0.5,
                        fontFamily: "monospace",
                      }}
                    >
                      {m}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            </Stack>
          </Paper>

          {/* ------------------------ Range picker ------------------------ */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  Date range picker
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    mt: 0.25,
                    display: "block",
                  }}
                >
                  Two calendars, optional presets, range hover preview.
                </Typography>
              </Box>

              <DateRangePicker
                value={range}
                onChange={setRange}
                showTime={showTime}
                showPresets={showPresets}
                showOutsideDays={showOutsideDays}
                disablePast={disablePast}
                locale={locale}
                mask={mask}
                startLabel="Check-in"
                endLabel="Check-out"
                showHoverPreview={showHoverPreview}
              />

              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block" }}
              >
                Type directly using the mask above (digits auto-insert
                separators), or open the calendar. Inside the calendar use
                ←↑→↓, PageUp/PageDown (Shift = year), Home/End, Enter to pick,
                Esc to close.
              </Typography>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    mb: 1,
                    display: "block",
                  }}
                >
                  Selected value
                </Typography>
                {range ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={`Start: ${formatValue(range.start)}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`End: ${formatValue(range.end)}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontStyle: "italic" }}
                  >
                    No range selected
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>

          {/* ------------------------ Single picker ------------------------ */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  Single date picker
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    mt: 0.25,
                    display: "block",
                  }}
                >
                  One calendar, no presets — same masking, localization, and
                  keyboard navigation as the range picker.
                </Typography>
              </Box>

              <DatePicker
                value={single}
                onChange={setSingle}
                showTime={showTime}
                showOutsideDays={showOutsideDays}
                disablePast={disablePast}
                locale={locale}
                mask={mask}
                label="Pick a date"
              />

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    mb: 1,
                    display: "block",
                  }}
                >
                  Selected value
                </Typography>
                {single ? (
                  <Chip
                    label={formatValue(single)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontStyle: "italic" }}
                  >
                    No date selected
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
