/// <reference types="vitest/config" />
import { configDefaults } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        submission: resolve(import.meta.dirname, "submission/index.html"),
        poem: resolve(import.meta.dirname, "poem/index.html"),
        collection: resolve(import.meta.dirname, "collection/index.html"),
        account: resolve(import.meta.dirname, "account/index.html"),
      },
    },
  },
  plugins: [tailwindcss()],
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["./test/unit/*.test.js"],
        },
      },
      {
        test: {
          name: "e2e",
          include: ["./test/e2e/*.test.js"],
        },
      },
    ],
    include: [
      ...configDefaults.include,
      "./test",
      "**/*.{test,spec}.?(c|m)[jt]s?(x)",
    ],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: "chromium", name: "Chrome" },
        { browser: "firefox", name: "Firefox" },
      ],
    },
  },
});
