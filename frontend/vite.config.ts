import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dev server on 5173 matches the default CORS origin in API/main.py.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
});
