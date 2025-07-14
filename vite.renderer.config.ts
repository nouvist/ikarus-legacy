import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    exclude: [
      // "langchain",
      // "@langchain/community",
      // "@langchain/core",
      // "@langchain/google-genai",
      // "@langchain/langgraph",
      // "@langchain/ollama",
      // "drizzle-orm",
      // "camelcase",
    ],
  },
});
