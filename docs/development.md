# Developer guide

> Version scope: this guide describes review branch `improve/review-ready-interactions` at `814f65c`. The application on `main` is still the earlier build; use the review branch to follow this guide.

[Home](../README.md) · [Architecture](architecture.md) · [Contributing](../CONTRIBUTING.md)

## Requirements

Node.js 20+ is recommended by the upstream README. Use npm and a modern browser with camera access. Internet access is needed for dependencies and the externally hosted MediaPipe model and WebAssembly files.

## Run locally

```bash
git clone --branch improve/review-ready-interactions https://github.com/midhatalvi/SimonSays.git
cd SimonSays
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5174`. Allow the camera after selecting **Let's play**.

The game already imports the real detector from `vision/checkPose.js`. API keys are not required for local movement play: the voice client falls back to browser speech when the ElevenLabs endpoint is unavailable. The fake detector remains available for development but is not the active import.

Vite exposes a network address, but phone camera access generally requires HTTPS. Use an HTTPS deployment for phone testing; a plain HTTP LAN address is not equivalent to localhost on the phone.

## Optional API services

```bash
cp .env.example .env
```

| Server environment variable | Purpose |
| --- | --- |
| `ELEVENLABS_API_KEY` | Enables ElevenLabs speech through `/api/elevenlabs` |
| `ELEVENLABS_VOICE_ID` | Optional voice override; omit it to use the proxy's built-in default |
| `TAVILY_API_KEY` | Enables `/api/tavily` for the integrated discovery break |

The example file supplies a voice ID, so copying it selects that voice rather than the proxy's default. Keep keys server-side; do not use `VITE_` variables for secrets.

In the integrated local build, `npm run dev` runs the same Tavily and ElevenLabs handlers through `server/devApi.js`. Put the server keys in a gitignored `.env.local` and restart the server. Missing keys return a recoverable service error. Secrets are never exposed as `VITE_` variables. Accept the halfway offer to call Tavily; discovery is enabled by default.

## Build and preview

```bash
npm run build
npm run preview
```

The build creates `dist/`. Preview serves the built frontend; it does not run the API handlers. Use the preview URL printed in the terminal.

## Deploy

The repository provides a Vite frontend and Vercel-compatible wrappers in `api/`. Configure the hosting project to build with `npm run build`, serve `dist/`, and run those wrappers. Set service keys in the hosting environment and test the resulting HTTPS URL.

The original project notes describe automatic deployment from `main`. That depends on the repository's external Vercel connection and is not established by the source files alone.

## Verification

```bash
npm test
npm run build
```

At `814f65c`, the upstream evidence records 31 passing automated synthetic cases and a passing production build. Tests use detector traces and mocked services; these results do not verify a physical camera or authenticated APIs.

For simulated browser examples, run the development server and open `/?lab`. The labeled lab does not request a real camera or cloud speech and is excluded from production builds. Preserve the distinction between those examples and actual player observations.

Follow the [evidence ledger](EVIDENCE_CASES.md) and [playtest guide](FIRST_PLAYTEST.md). Key manual checks are practice/retry/readiness, neutral before Go, pause/repeat/resume, tracking recovery, skipped-round scoring, camera release/restart, and replay. Check discovery gesture/button answers, evidence expansion, skip/search failure, and return to the same movement session. Test a physical phone over HTTPS and authenticated sponsor services separately.

The playtest guide's old `127.0.0.1:5184` address was specific to its original session. Use the actual URL printed by your current Vite server (configured default: port 5174).
