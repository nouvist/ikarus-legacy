import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "@nodejs/natural": path.resolve(__dirname, "node_modules/natural/index.js"),
      "natural": path.resolve(__dirname, "src/renderer/node/natural.ts"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        "@lancedb/lancedb",
        "@lancedb/lancedb-darwin-arm64",
        "@lancedb/lancedb-darwin-x64",
        "@lancedb/lancedb-linux-arm64-gnu",
        "@lancedb/lancedb-linux-arm64-musl",
        "@lancedb/lancedb-linux-x64-gnu",
        "@lancedb/lancedb-linux-x64-musl",
        "@lancedb/lancedb-win32-arm64-msvc",
        "@lancedb/lancedb-win32-x64-msvc",
        "natural",
      ],
    },
  },
  optimizeDeps: {
    exclude: ["@lancedb/lancedb", "natural"],
  },
});
