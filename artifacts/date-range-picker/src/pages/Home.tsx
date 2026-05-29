import { useState } from "react";
import { CalendarDateTime, toCalendarDate } from "@internationalized/date";
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
  { value: "fr-FR", label: "Francais" },
  { value: "es-ES", label: "Espanol" },
  { value: "ja-JP", label: "Japanese" },
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
    <main className="dp-demo-page">
      <div className="dp-demo-container">
        <div className="dp-demo-stack">
          <header className="dp-demo-header">
            <h1>Date Pickers</h1>
            <p>
              React + CSS + <code>@internationalized/date</code>. Range picker
              and single-date picker share the same calendar, localization,
              masked input and keyboard logic.
            </p>
          </header>

          <section className="dp-demo-panel" aria-labelledby="demo-options">
            <div className="dp-demo-panel-stack">
              <span className="dp-demo-overline" id="demo-options">
                Options
              </span>

              <div className="dp-demo-control-row">
                <label className="dp-demo-switch">
                  <input
                    type="checkbox"
                    checked={showTime}
                    onChange={(e) => {
                      setShowTime(e.target.checked);
                      setRange(null);
                      setSingle(null);
                    }}
                  />
                  <span>Time picker</span>
                </label>
                <label className="dp-demo-switch">
                  <input
                    type="checkbox"
                    checked={showPresets}
                    onChange={(e) => setShowPresets(e.target.checked)}
                  />
                  <span>Presets (range only)</span>
                </label>
                <label className="dp-demo-switch">
                  <input
                    type="checkbox"
                    checked={showOutsideDays}
                    onChange={(e) => setShowOutsideDays(e.target.checked)}
                  />
                  <span>Show outside days</span>
                </label>
                <label className="dp-demo-switch">
                  <input
                    type="checkbox"
                    checked={disablePast}
                    onChange={(e) => {
                      setDisablePast(e.target.checked);
                      setRange(null);
                      setSingle(null);
                    }}
                  />
                  <span>Disable past dates</span>
                </label>
                <label className="dp-demo-switch">
                  <input
                    type="checkbox"
                    checked={showHoverPreview}
                    onChange={(e) => setShowHoverPreview(e.target.checked)}
                  />
                  <span>Hover preview in inputs</span>
                </label>
              </div>

              <div>
                <span className="dp-demo-option-label">Locale</span>
                <div className="dp-demo-toggle-row" role="group" aria-label="Locale">
                  {LOCALES.map((l) => (
                    <button
                      className="dp-demo-toggle"
                      data-active={locale === l.value}
                      key={l.value}
                      onClick={() => setLocale(l.value)}
                      type="button"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="dp-demo-option-label">Input mask</span>
                <div
                  className="dp-demo-toggle-row"
                  role="group"
                  aria-label="Input mask"
                >
                  {masks.map((m, i) => (
                    <button
                      className="dp-demo-toggle dp-demo-toggle-mono"
                      data-active={maskIndex === i}
                      key={m}
                      onClick={() => setMaskIndex(i)}
                      type="button"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="dp-demo-panel" aria-labelledby="range-picker-demo">
            <div className="dp-demo-panel-stack">
              <div>
                <span className="dp-demo-overline" id="range-picker-demo">
                  Date range picker
                </span>
                <p className="dp-demo-caption">
                  Two calendars, optional presets, range hover preview.
                </p>
              </div>

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

              <p className="dp-demo-caption">
                Type directly using the mask above, or open the calendar. Inside
                the calendar use arrow keys, PageUp/PageDown (Shift = year),
                Home/End, Enter to pick, and Esc to close.
              </p>

              <div>
                <span className="dp-demo-option-label">Selected value</span>
                {range ? (
                  <div className="dp-demo-chip-row">
                    <span className="dp-demo-chip">
                      Start: {formatValue(range.start)}
                    </span>
                    <span className="dp-demo-chip">
                      End: {formatValue(range.end)}
                    </span>
                  </div>
                ) : (
                  <p className="dp-demo-empty">No range selected</p>
                )}
              </div>
            </div>
          </section>

          <section className="dp-demo-panel" aria-labelledby="single-picker-demo">
            <div className="dp-demo-panel-stack">
              <div>
                <span className="dp-demo-overline" id="single-picker-demo">
                  Single date picker
                </span>
                <p className="dp-demo-caption">
                  One calendar, no presets. It uses the same masking,
                  localization, and keyboard navigation as the range picker.
                </p>
              </div>

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

              <div className="dp-divider" />

              <div>
                <span className="dp-demo-option-label">Selected value</span>
                {single ? (
                  <div className="dp-demo-chip-row">
                    <span className="dp-demo-chip">{formatValue(single)}</span>
                  </div>
                ) : (
                  <p className="dp-demo-empty">No date selected</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
