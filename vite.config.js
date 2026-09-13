import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { localApi } from './server/devApi.js';

// Top-level ownership folders (engine, voice, ui, vision, content, shared)
// are imported directly by relative path from src. No aliases needed for a
// 24h build, but keeping the config minimal and explicit.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['TAVILY_API_KEY', 'ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'Eleven_labs_key']) {
    if (!process.env[key] && env[key]) process.env[key] = env[key];
  }
  return {
  plugins: [react(), localApi()],
  server: {
    host: true, // expose on LAN so we can open the dev URL on a phone
    port: 5174,
  },
};
});
