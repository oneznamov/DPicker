# Source reuse guide

The recommended installation path is the `dpicker` npm package. This guide is
for teams that prefer to copy the source directly into a React + MUI v7 project:
grab the `src/components/DateRangePicker` and/or `src/components/DatePicker`
directories and drop them into your codebase.

## Peer dependencies

Install the following packages in your project if they are not already present:

| Package | Minimum version |
|---|---|
| `react` | `^18.0.0` |
| `react-dom` | `^18.0.0` |
| `@mui/material` | `^7.3.0` |
| `@emotion/react` | `^11.14.0` |
| `@emotion/styled` | `^11.14.0` |
| `@internationalized/date` | `^3.12.0` |
| `react-aria` | `^3.48.0` |
| `react-stately` | `^3.46.0` |

```
npm install @mui/material @emotion/react @emotion/styled \
  @internationalized/date react-aria react-stately
```

---

## DateRangePicker

```tsx
import { DateRangePicker, defaultPresets } from "./components";
import type { DateRange } from "./components";
import { useState } from "react";

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

### Common props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `DateRange \| null` | — | Controlled selection |
| `defaultValue` | `DateRange \| null` | — | Initial value (uncontrolled) |
| `onChange` | `(range: DateRange \| null) => void` | — | Change callback |
| `showTime` | `boolean` | `false` | Show hour/minute pickers |
| `showPresets` | `boolean` | `true` | Show preset shortcuts column |
| `showOutsideDays` | `boolean` | `false` | Render out-of-month days |
| `presets` | `PresetDefinition[]` | `defaultPresets` | Custom preset list |
| `minValue` | `CalendarDate` | — | Earliest selectable date |
| `maxValue` | `CalendarDate` | — | Latest selectable date |
| `disablePast` | `boolean` | `false` | Disable dates before today |
| `locale` | `string` | browser locale | BCP-47 tag, e.g. `"de-DE"` |
| `mask` | `string` | `"MM/DD/YYYY"` | Input mask (`M` `D` `Y` `H` `m` are slot chars) |
| `showHoverPreview` | `boolean` | `true` | Preview hovered range in inputs |
| `disabled` | `boolean` | `false` | Disable the whole control |

---

## DatePicker

```tsx
import { DatePicker } from "./components";
import type { DateValue } from "./components";
import { useState } from "react";

export function App() {
  const [date, setDate] = useState<DateValue | null>(null);

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      label="Appointment"
    />
  );
}
```

### Common props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `DateValue \| null` | — | Controlled selection |
| `defaultValue` | `DateValue \| null` | — | Initial value (uncontrolled) |
| `onChange` | `(value: DateValue \| null) => void` | — | Change callback |
| `showTime` | `boolean` | `false` | Show hour/minute picker |
| `showOutsideDays` | `boolean` | `false` | Render out-of-month days |
| `minValue` | `CalendarDate` | — | Earliest selectable date |
| `maxValue` | `CalendarDate` | — | Latest selectable date |
| `disablePast` | `boolean` | `false` | Disable dates before today |
| `label` | `string` | `"Date"` | Input field label |
| `locale` | `string` | browser locale | BCP-47 tag, e.g. `"de-DE"` |
| `mask` | `string` | `"MM/DD/YYYY"` | Input mask |
| `disabled` | `boolean` | `false` | Disable the whole control |

---

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
        end: today.set({ month: quarterStart + 2, day: 1 }).add({ months: 1 }).subtract({ days: 1 }),
      };
    },
  },
];
```
