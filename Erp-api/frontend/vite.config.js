import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  appType: "spa",
  server: {
    port: 5173,
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: blob:; " +
        "font-src 'self' https://fonts.gstatic.com data:; " +
        "connect-src 'self' http://localhost:3000 http://localhost:5173 ws://localhost:5173; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "frame-ancestors 'self';",
    },
    proxy: {
      "/auth": "http://localhost:3000",
      "/dashboard": "http://localhost:3000",
      "/roles": "http://localhost:3000",
      "/users": "http://localhost:3000",
    },
  },
});
