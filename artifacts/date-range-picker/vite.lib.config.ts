import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    lib: {
      entry: {
        index: path.resolve(import.meta.dirname, "src/index.ts"),
        "date-picker": path.resolve(import.meta.dirname, "src/date-picker.ts"),
        "date-range-picker": path.resolve(
          import.meta.dirname,
          "src/date-range-picker.ts",
        ),
      },
      name: "DPicker",
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "es" ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rollupOptions: {
      external: [
        "@emotion/react",
        "@emotion/styled",
        "@internationalized/date",
        "@mui/icons-material",
        "@mui/icons-material/CalendarToday",
        "@mui/icons-material/ChevronLeft",
        "@mui/icons-material/ChevronRight",
        "@mui/icons-material/Close",
        "@mui/material",
        "@mui/material/styles",
        "react",
        "react-aria",
        "react-dom",
        "react/jsx-runtime",
        "react-stately",
      ],
    },
  },
});
