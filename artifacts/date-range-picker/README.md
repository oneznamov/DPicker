# DPicker

DPicker is a lightweight, customizable React date picker and date-range picker
for apps that want typed date values, accessible calendar behavior, and CSS3
styling without a large date-picker framework.

It ships two components:

- `DatePicker` for a single date or date-time value.
- `DateRangePicker` for an inclusive start/end range with optional presets.

<p><a href="https://fuji2003.github.io/DPicker/"><strong>Play live demo</strong></a></p>

## Installation

```bash
npm install dpicker @internationalized/date
```

React and React DOM are peer dependencies. DPicker works with React 18 or newer.
Import the stylesheet once in your app:

```tsx
import "dpicker/styles.css";
```

## Quick Start

```tsx
import { useState } from "react";
import { DateRangePicker, type DateRange } from "dpicker";
import "dpicker/styles.css";

export function BookingDates() {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      startLabel="Check-in"
      endLabel="Check-out"
    />
  );
}
```

For a single date:

```tsx
import { useState } from "react";
import { DatePicker, type DateValue } from "dpicker";
import "dpicker/styles.css";

export function AppointmentDate() {
  const [date, setDate] = useState<DateValue | null>(null);

  return <DatePicker value={date} onChange={setDate} label="Appointment" />;
}
```

## Public API

Root imports are convenient and still tree-shake in modern bundlers:

```ts
import {
  DatePicker,
  DateRangePicker,
  defaultPresets,
  type DateValue,
  type DateRange,
  type DatePickerProps,
  type DateRangePickerProps,
  type PresetDefinition,
} from "dpicker";
import "dpicker/styles.css";
```

For the smallest import path, use direct subpath exports:

```ts
import { DatePicker, type DatePickerProps } from "dpicker/date-picker";
import {
  DateRangePicker,
  defaultPresets,
  type DateRange,
} from "dpicker/date-range-picker";
import "dpicker/styles.css";
```

Values use `@internationalized/date`:

```ts
type DateValue = CalendarDate | CalendarDateTime;

interface DateRange {
  start: DateValue;
  end: DateValue;
}
```

## DateRangePicker Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `DateRange \| null` | - | Controlled selection. |
| `defaultValue` | `DateRange \| null` | - | Initial uncontrolled selection. |
| `onChange` | `(range: DateRange \| null) => void` | - | Called when the range changes or clears. |
| `showTime` | `boolean` | `false` | Adds hour/minute pickers and returns `CalendarDateTime`. |
| `showPresets` | `boolean` | `true` | Shows preset shortcut buttons. |
| `showOutsideDays` | `boolean` | `false` | Shows previous/next month days in blank calendar cells. |
| `presets` | `PresetDefinition[]` | `defaultPresets` | Replaces the built-in preset list. |
| `minValue` | `CalendarDate` | - | Earliest selectable date. |
| `maxValue` | `CalendarDate` | - | Latest selectable date. |
| `disablePast` | `boolean` | `false` | Disables dates before today. |
| `locale` | `string` | browser locale | BCP-47 locale such as `en-US` or `de-DE`. |
| `mask` | `string` | `MM/DD/YYYY` | Input mask using `M`, `D`, `Y`, `H`, and `m`. |
| `startLabel` | `string` | `Start date` | Start input label. |
| `endLabel` | `string` | `End date` | End input label. |
| `showHoverPreview` | `boolean` | `true` | Shows the hovered range preview in inputs. |
| `disabled` | `boolean` | `false` | Disables the whole control. |

## DatePicker Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `DateValue \| null` | - | Controlled selection. |
| `defaultValue` | `DateValue \| null` | - | Initial uncontrolled selection. |
| `onChange` | `(value: DateValue \| null) => void` | - | Called when the date changes or clears. |
| `showTime` | `boolean` | `false` | Adds an hour/minute picker and returns `CalendarDateTime`. |
| `showOutsideDays` | `boolean` | `false` | Shows previous/next month days in blank calendar cells. |
| `minValue` | `CalendarDate` | - | Earliest selectable date. |
| `maxValue` | `CalendarDate` | - | Latest selectable date. |
| `disablePast` | `boolean` | `false` | Disables dates before today. |
| `locale` | `string` | browser locale | BCP-47 locale such as `en-US` or `de-DE`. |
| `mask` | `string` | `MM/DD/YYYY` | Input mask using `M`, `D`, `Y`, `H`, and `m`. |
| `label` | `string` | `Date` | Input label. |
| `disabled` | `boolean` | `false` | Disables the whole control. |

## Custom Presets

```tsx
import { DateRangePicker, type PresetDefinition } from "dpicker";

const presets: PresetDefinition[] = [
  {
    label: "Next 7 days",
    getRange: (today) => ({
      start: today,
      end: today.add({ days: 6 }),
    }),
  },
];

export function ReportRange() {
  return <DateRangePicker presets={presets} />;
}
```

## Localization and Masks

`locale` controls weekday order plus month and weekday names. Pass any BCP-47
locale supported by the browser:

```tsx
<DatePicker locale="de-DE" mask="DD.MM.YYYY" />
```

Masks use date/time slot characters:

- `M` month digit
- `D` day digit
- `Y` year digit
- `H` hour digit
- `m` minute digit

Examples: `MM/DD/YYYY`, `DD/MM/YYYY`, `YYYY-MM-DD`, `DD.MM.YYYY`,
`MM/DD/YYYY HH:mm`.

## Accessibility

DPicker uses semantic controls, ARIA dialog attributes, outside-click handling,
Escape handling, and keyboard-friendly calendar grids. Users can type into
masked inputs, open the calendar from the icon button, move through days with
arrow keys, jump by month or year with PageUp/PageDown, use Home/End for week
boundaries, press Enter or Space to select, and press Escape to close.

## Styling and Customization

The components ship a plain CSS3 stylesheet at `dpicker/styles.css`. You can
import it as-is, override the `.dp-*` classes in your app stylesheet, or copy
the source CSS if you need full control. Labels, locale, input masks, presets,
min/max dates, disabled state, outside days, time picking, and hover preview
behavior are all controlled by props.

## Package Size and Tree Shaking

DPicker publishes ESM and CJS builds with direct picker entrypoints. JavaScript
modules stay tree-shakable, while CSS is explicitly preserved through
`"sideEffects": ["**/*.css"]`. React, React DOM, and `@internationalized/date`
are peer dependencies and are not bundled into the package.

Use `dpicker/date-picker` when an app only needs the single date picker, and
`dpicker/date-range-picker` when an app only needs the range picker. The root
`dpicker` export remains available for apps that want both from one import.

Built package size from `pnpm --filter dpicker build`:

| Import path | ESM JS | gzip JS | CSS | gzip CSS |
| --- | ---: | ---: | ---: | ---: |
| `dpicker/date-picker` | 29.35 kB | 8.20 kB | 7.02 kB | 1.85 kB |
| `dpicker/date-range-picker` | 36.51 kB | 9.60 kB | 7.02 kB | 1.85 kB |
| `dpicker` | 44.74 kB | 12.18 kB | 7.02 kB | 1.85 kB |

The JS numbers include shared generated chunks used by each import path. CSS is
listed separately because consumers import `dpicker/styles.css` once.

## Dependencies

Runtime peer dependencies:

| Package | Why it is needed |
| --- | --- |
| `react` | Component rendering and hooks. |
| `react-dom` | React app rendering in the browser. |
| `@internationalized/date` | Calendar date values, date-time values, date math, and locale-aware calendar behavior. |

Development/build dependencies used by this repository:

| Package | Why it is needed |
| --- | --- |
| `@vitejs/plugin-react` | Vite React transform for demo and library builds. |
| `@types/node` | TypeScript types for build configuration. |
| `@types/react` | TypeScript React types. |
| `@types/react-dom` | TypeScript React DOM types. |
| `typescript` | Type checking and declaration output. |
| `vite` | Demo build and library bundling. |

## Using DPicker with LLMs

When asking an LLM to integrate DPicker, give it the API shape and value model
explicitly. This avoids common mistakes such as treating the value as a native
`Date` or a string.

Copy this context into your LLM prompt:

```text
Use the npm package dpicker. Import DatePicker or DateRangePicker from "dpicker",
or use "dpicker/date-picker" and "dpicker/date-range-picker" for direct
tree-shaking-friendly imports. Import "dpicker/styles.css" once near the app
root. The selected value is not a JavaScript Date. DatePicker uses
DateValue | null, where DateValue is CalendarDate or CalendarDateTime from
@internationalized/date. DateRangePicker uses DateRange | null, where DateRange
has { start, end }. Use controlled React state, pass value and onChange, and
format or convert the value only at application boundaries.
```

Example LLM task:

```text
Add a booking range field with dpicker. Use DateRangePicker, keep the selected
range in React state as DateRange | null, label the fields "Check-in" and
"Check-out", disable past dates, and use the mask "YYYY-MM-DD". Do not convert
to JavaScript Date inside the component state.
```

For API payloads, ask the LLM to convert at the submit boundary:

```text
When submitting, convert CalendarDate values to ISO strings with year, month,
and day. Keep CalendarDateTime values as date plus hour/minute fields unless the
backend contract explicitly requires a timezone-aware instant.
```

## Benefits

- Lightweight package surface: only picker code, docs, and license are
  published.
- Tree-shaking-friendly exports: import one picker from a direct subpath.
- Customizable behavior: labels, masks, locale, presets, time mode, bounds, and
  disabled dates are all props.
- CSS3 styling: import the default stylesheet once, then override `.dp-*`
  classes for product-specific visuals.
- Accessible interactions: keyboard navigation and overlay behavior are built in.
- Minimal dependency surface: React, React DOM, and `@internationalized/date` are
  the only peer dependencies.
- Framework-friendly React usage: the pickers work in Vite, Next.js, Remix, and
  other React app stacks that can import CSS.
- Typed date model: `@internationalized/date` keeps calendar dates distinct from
  native `Date` instants.
- LLM-friendly API: small exports and explicit value types make generated
  integration code easier to review.
- Future Temporal direction: the date model is intentionally close to Temporal
  concepts, making a future Temporal-compatible adapter a natural next step.

## Development

```bash
pnpm install
pnpm --filter dpicker dev
pnpm --filter dpicker typecheck
pnpm --filter dpicker build
pnpm --filter dpicker build:demo
```

The package build writes publishable files to
`artifacts/date-range-picker/dist`. The demo build writes static GitHub Pages
files to `artifacts/date-range-picker/demo-dist`.
