import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
    },
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/cert.pem")),
    },
  },
  resolve: {
    alias: {
      "@features": path.resolve(__dirname, "src/features"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@components": path.resolve(__dirname, "src/components"),
      "@app": path.resolve(__dirname, "src/app"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
