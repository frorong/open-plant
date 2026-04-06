import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  plugins: [react()],
  publicDir: false,
  build: {
    emptyOutDir: false,
    target: "es2021",
    sourcemap: false,
    outDir: fileURLToPath(new URL("./docs/assets", import.meta.url)),
    lib: {
      entry: fileURLToPath(new URL("./docs-src/examples-playground/main.tsx", import.meta.url)),
      formats: ["es"],
      fileName: () => "examples-playground.js",
    },
    rollupOptions: {
      output: {
        chunkFileNames: "examples-playground-[name]-[hash].js",
        assetFileNames: "examples-playground-[name]-[hash][extname]",
      },
    },
  },
});
