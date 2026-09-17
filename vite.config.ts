import { defineConfig } from "vite";
import { resolve } from 'path';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        submission: resolve(import.meta.dirname, "submission/index.html"),
        poem: resolve(import.meta.dirname, "poem/index.html"),
        collection: resolve(import.meta.dirname, "collection/index.html"),
      },
    },
  },
  plugins: [tailwindcss()],
});
