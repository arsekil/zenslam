/// <reference types="vitest/config" />
import { configDefaults } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      // NOTE: these input keys must match the URL paths in src/lib/routes.ts.
      // When adding a route, update both.
      input: {
        main: resolve(import.meta.dirname, "index.html"), // routes.main
        cta: resolve(import.meta.dirname, "auth/cta/index.html"), // routes.cta
        passwordreset: resolve(
          import.meta.dirname,
          "auth/passwordreset/index.html",
        ), // routes.passwordReset
        submission: resolve(import.meta.dirname, "submission/index.html"), // routes.submission
        poem: resolve(import.meta.dirname, "poem/index.html"), //routes.poem
        poems: resolve(import.meta.dirname, "poems/index.html"), //routes.poems
        collection: resolve(import.meta.dirname, "collection/index.html"), // routes.collections
        account: resolve(import.meta.dirname, "account/index.html"), // routes.account
        tags: resolve(import.meta.dirname, "tags/index.html"), // routes.tags
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
