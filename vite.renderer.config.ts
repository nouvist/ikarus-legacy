import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { defineConfig } from "vite";
import { externals } from "./build_tools";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      external: externals,
    },
  },
  optimizeDeps: {
    exclude: externals,
  },
});
