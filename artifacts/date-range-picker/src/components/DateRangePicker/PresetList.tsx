import {
  CalendarDate,
  getLocalTimeZone,
  today as currentToday,
} from "@internationalized/date";
import type { DateOnlyRange, PresetDefinition } from "./types";
import { isSameDay } from "./utils";
import { PresetButton, PresetsList, PresetsTitle } from "./styled";

interface PresetsProps {
  presets: PresetDefinition[];
  selectedRange: DateOnlyRange | null;
  onSelect: (range: DateOnlyRange) => void;
}

export function Presets({ presets, selectedRange, onSelect }: PresetsProps) {
  const today = currentToday(getLocalTimeZone());

  const matches = (preset: PresetDefinition): boolean => {
    if (!selectedRange) return false;
    const r = preset.getRange(today);
    return (
      isSameDay(selectedRange.start, r.start) &&
      isSameDay(selectedRange.end, r.end)
    );
  };

  return (
    <PresetsList>
      <PresetsTitle>Shortcuts</PresetsTitle>
      {presets.map((preset) => (
        <PresetButton
          key={preset.label}
          active={matches(preset)}
          onClick={() => onSelect(preset.getRange(today))}
        >
          {preset.label}
        </PresetButton>
      ))}
    </PresetsList>
  );
}

// Re-export for convenience
export type { CalendarDate };
