import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Top-level ownership folders (engine, voice, ui, vision, content, shared)
// are imported directly by relative path from src. No aliases needed for a
// 24h build, but keeping the config minimal and explicit.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose on LAN so we can open the dev URL on a phone
    port: 5174,
  },
});
