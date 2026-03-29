import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The Go backend URL. Run: git-bug webui --port 3000
const API_URL = process.env.VITE_API_URL || "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // highlight.js is inherently large (~1MB) but lazy-loaded; silence the warning.
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("react-dom") ||
            id.includes("react-router-dom") ||
            id.includes("/react/")
          ) {
            return "vendor-react";
          }
          if (id.includes("@apollo/client") || id.includes("/graphql/")) {
            return "vendor-apollo";
          }
          if (id.includes("react-markdown") || id.includes("remark-gfm")) {
            return "vendor-markdown";
          }
          if (id.includes("highlight.js")) {
            return "vendor-highlight";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      "/graphql": { target: API_URL, changeOrigin: true },
      "/gitfile": { target: API_URL, changeOrigin: true },
      "/upload": { target: API_URL, changeOrigin: true },
      "/auth": { target: API_URL, changeOrigin: true },
    },
  },
});
