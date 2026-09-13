# Developer guide

[Documentation](README.md) · [Architecture](architecture.md) · [Validation](EVIDENCE_CASES.md) · [Contributing](../CONTRIBUTING.md)

## Requirements

- Node.js 20 or newer
- npm
- A modern browser with camera access
- Internet access for MediaPipe model files and optional services

## Local setup

```bash
git clone https://github.com/midhatalvi/SimonSays.git
cd SimonSays
git switch design/a-little-lift
npm ci
npm run dev
```

Open `http://localhost:5174`. The local Vite plugin in `server/devApi.js` serves the same Tavily and ElevenLabs handlers used by Vercel.

## Environment variables

Copy `.env.example` to `.env.local`, then fill only the services you need:

| Variable | Purpose |
| --- | --- |
| `TAVILY_API_KEY` | Enables the accepted discovery break |
| `ELEVENLABS_API_KEY` | Enables server-proxied speech |
| `ELEVENLABS_VOICE_ID` | Optional voice override |

`.env.local` is ignored by Git. Keep secrets server-side and never prefix them with `VITE_`.

Without ElevenLabs, written prompts remain available and the client uses browser speech. Without Tavily, discovery shows a recoverable error and movement can continue.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development UI plus local API handlers |
| `npm test` | Synthetic engine, detector geometry, voice, and content tests |
| `npm run build` | Production frontend build |
| `npm run preview` | Static production build preview; does not run API handlers |

The development-only `/?lab` screen exercises interface flow with synthetic camera, speech, and search inputs. It cannot validate webcam accuracy or live service behavior.

## Deployment

The `api/` directory exposes Vercel-compatible wrappers for Tavily and ElevenLabs. Configure the build as `npm run build`, serve `dist/`, and add service keys in the Vercel project environment. Use HTTPS for phone camera testing.

## Verification before review

1. Run `npm test` and `npm run build`.
2. Run the complete synthetic session at `/?lab`, including discovery and results.
3. Run the [live playtest](FIRST_PLAYTEST.md) on a laptop.
4. Repeat it on a physical phone over HTTPS.
5. Confirm camera release after timeout, ending, discovery, and replay.
6. Test all selected movements, Simon Says commands, tricks, pause, repeat, skip, and three-life elimination.
7. Test authenticated Tavily and ElevenLabs separately.

Report automated, simulated-browser, API, and real-player evidence separately. Passing synthetic tests does not establish camera accuracy.
