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
        cta: resolve(import.meta.dirname, "auth/cta/index.html"),
        passwordreset: resolve(
          import.meta.dirname,
          "auth/passwordreset/index.html",
        ),
        submission: resolve(import.meta.dirname, "submission/index.html"),
        poem: resolve(import.meta.dirname, "poem/index.html"),
        poems: resolve(import.meta.dirname, "poems/index.html"),
        collection: resolve(import.meta.dirname, "collection/index.html"),
        account: resolve(import.meta.dirname, "account/index.html"),
        tags: resolve(import.meta.dirname, "tags/index.html"),
      },
    },
  },
  plugins: [tailwindcss()],
  test: {
    projects: [
      {
        test: {
          include: [
            "test/unit/**/*.{test,spec}.ts",
            "test/**/*.unit.{test,spec}.ts",
          ],
          name: "unit",
          environment: "happy-dom",
        },
      },
      {
        test: {
          include: [
            "test/browser/**/*.{test,spec}.ts",
            "test/**/*.browser.{test,spec}.ts",
          ],
          name: "browser",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
