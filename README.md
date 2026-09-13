# Simon Says — fair play and prepared voice

A camera-based movement game with practice, comfortable-movement selection, adjustable timing, and optional spoken instructions. Sit or stand; choose only movements that feel comfortable. This is a prototype for engagement, not a clinical assessment or treatment.

## Run

Node.js 20+ recommended. Run `npm ci`, then `npm run dev`. Open the localhost URL; remote devices require HTTPS for camera access. Run `npm test` for synthetic interaction cases and `npm run build` for production assets.

Deploy to Vercel to use the `/api` handlers. The Vite-only preview does not serve the voice API: it uses browser speech fallback. Configure `ELEVENLABS_API_KEY` and optionally `ELEVENLABS_VOICE_ID` server-side for ElevenLabs. No microphone permission is needed. Pose processing stays in the browser; voice prompt text goes to the voice service.

## Implemented

- Real MediaPipe pose detection, including shoulder-width normalization.
- Detector returns explicit tracking validity. Missing/stale landmarks cannot score as stillness.
- After the instruction finishes, return to a neutral pose; the visible Go state opens scoring. Movement during the instruction is not scored. The full instruction remains visible.
- Tracking loss and manual pause freeze the response window and require neutral readiness on return. Tracking loss lasting 15 seconds leaves the round unscored.
- Practice, selected movements, 5/8/12-second response windows, pause, repeat (remains paused until Resume), and skip without penalty.
- Gentle six-round session; no elimination. Skips and tracking timeouts are excluded from the denominator. Response-time metrics are not presented as cognitive measurements.
- Next command audio prefetch, bounded in-flight deduplication/cache, timeout, browser speech fallback, URL cleanup, and camera teardown.

## Scope and evidence

Tavily code remains present but is not connected to the active game. No latency, adoption, health, accessibility-compliance, or sponsor-prize claims have been validated. See [revised plan](docs/REVISED_PLAN.md) and [evidence cases](docs/EVIDENCE_CASES.md). These distinguish source inspection, executable synthetic cases, browser checks, and pending participant observations.

## Review

Changes are on local branch `improve/fair-play-audio`. Public deployment is unchanged. Existing dependency audit findings require separate review before production use.

## Observed-session handoff

Use [the first playtest guide](docs/FIRST_PLAYTEST.md) for an actual participant. For reproducible browser UI examples only, run the dev server and add `?lab` to its URL. The lab is clearly labeled, uses no camera/cloud speech, and is not included in production builds.
