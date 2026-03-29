import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// The Go backend URL. Run: git-bug webui --port 3000
const API_URL = process.env.VITE_API_URL || "http://localhost:3000";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    tsconfigPaths(),
    tailwindcss(),
    react(),
  ],
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
