import { defineConfig } from "astro/config";
import node from "@astrojs/node";

const backendUrl = process.env.GAMECLUB_BACKEND_URL || "http://127.0.0.1:8000";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  server: { host: true, port: 4321 },
  vite: {
    server: {
      strictPort: true,
      proxy: {
        "/api": { target: backendUrl, changeOrigin: true },
        "/rss.xml": { target: backendUrl, changeOrigin: true },
        "/rss": { target: backendUrl, changeOrigin: true },
        "/media": { target: backendUrl, changeOrigin: true },
      },
    },
  },
});
