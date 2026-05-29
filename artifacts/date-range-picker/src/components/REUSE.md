# Source reuse guide

The recommended installation path is the `dpicker` npm package. This guide is
for teams that prefer to copy the source directly into a React project: grab the
`src/components/DateRangePicker`, `src/components/DatePicker`, and
`src/styles.css` files and drop them into your codebase.

## Dependencies

Install the following packages in your project if they are not already present:

| Package | Minimum version |
|---|---|
| `react` | `^18.0.0` |
| `react-dom` | `^18.0.0` |
| `@internationalized/date` | `^3.12.0` |

```bash
npm install @internationalized/date
```

Import the stylesheet once near your app root:

```tsx
import "./styles.css";
```

## DateRangePicker

```tsx
import { useState } from "react";
import { DateRangePicker, defaultPresets } from "./components";
import type { DateRange } from "./components";

export function App() {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      presets={defaultPresets}
      startLabel="Check-in"
      endLabel="Check-out"
    />
  );
}
```

## DatePicker

```tsx
import { useState } from "react";
import { DatePicker } from "./components";
import type { DateValue } from "./components";

export function App() {
  const [date, setDate] = useState<DateValue | null>(null);

  return <DatePicker value={date} onChange={setDate} label="Appointment" />;
}
```

## Common props

Both pickers support controlled and uncontrolled usage, `locale`, `mask`,
`minValue`, `maxValue`, `disablePast`, `showOutsideDays`, `showTime`, and
`disabled`. The range picker also supports `presets`, `showPresets`, custom
start/end labels, and input hover preview.

## Creating custom presets

```ts
import type { PresetDefinition } from "./components";

const myPresets: PresetDefinition[] = [
  {
    label: "This quarter",
    getRange: (today) => {
      const month = today.month;
      const quarterStart = month - ((month - 1) % 3);
      return {
        start: today.set({ month: quarterStart, day: 1 }),
        end: today
          .set({ month: quarterStart + 2, day: 1 })
          .add({ months: 1 })
          .subtract({ days: 1 }),
      };
    },
  },
];
```
