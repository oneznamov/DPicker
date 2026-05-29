import { MenuItem, Select } from "@mui/material";
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
  const selectSx = {
    fontSize: 13,
    minWidth: 64,
    ".MuiSelect-select": { py: 0.5, px: 1 },
  };

  return (
    <TimeRowItem>
      <TimeRowLabel>{label}</TimeRowLabel>
      <Select
        size="small"
        value={value.hour}
        onChange={(e) =>
          onChange(new Time(Number(e.target.value), value.minute))
        }
        sx={selectSx}
        MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
      >
        {HOURS.map((h) => (
          <MenuItem key={h} value={h} sx={{ fontSize: 13 }}>
            {String(h).padStart(2, "0")}
          </MenuItem>
        ))}
      </Select>
      <span style={{ color: "#888" }}>:</span>
      <Select
        size="small"
        value={value.minute}
        onChange={(e) =>
          onChange(new Time(value.hour, Number(e.target.value)))
        }
        sx={selectSx}
        MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
      >
        {MINUTES.map((m) => (
          <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>
            {String(m).padStart(2, "0")}
          </MenuItem>
        ))}
      </Select>
    </TimeRowItem>
  );
}
