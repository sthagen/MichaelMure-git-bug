import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// The Go backend URL. Run: git-bug webui --port 3000
const API_URL = process.env.VITE_API_URL || "http://localhost:3000";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    svgr(),
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/graphql": { target: API_URL, changeOrigin: true },
      "/gitfile": { target: API_URL, changeOrigin: true },
      "/gitraw": { target: API_URL, changeOrigin: true },
      "/upload": { target: API_URL, changeOrigin: true },
      "/auth": { target: API_URL, changeOrigin: true },
    },
  },
});
