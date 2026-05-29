import { Time } from "@internationalized/date";
import { TimeRowItem, TimeRowLabel } from "./styled";

interface TimePickerProps {
  label: string;
  value: Time;
  onChange: (time: Time) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export function TimePicker({ label, value, onChange }: TimePickerProps) {
  return (
    <TimeRowItem>
      <TimeRowLabel>{label}</TimeRowLabel>
      <select
        className="dp-time-select"
        value={value.hour}
        onChange={(e) =>
          onChange(new Time(Number(e.target.value), value.minute))
        }
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className="dp-time-separator">:</span>
      <select
        className="dp-time-select"
        value={value.minute}
        onChange={(e) =>
          onChange(new Time(value.hour, Number(e.target.value)))
        }
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
    </TimeRowItem>
  );
}
