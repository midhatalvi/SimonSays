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
- Repeatable practice with an explicit readiness choice; exit to setup at any time; selected movements, 5/8/12-second response windows, pause, repeat (remains paused until Resume), and skip without penalty.
- Gentle six-round session; no elimination. Skips and tracking timeouts are excluded from the denominator. Response-time metrics are not presented as cognitive measurements.
- Next command audio prefetch, bounded in-flight deduplication/cache, timeout, browser speech fallback, URL cleanup, and camera teardown.

## Scope and evidence

Play with Simon is one movement session with an optional discovery break after three rounds. It retrieves evidence through Tavily for a reviewed bank of four questions across Space and Animals; only supported questions appear. It does not generate arbitrary questions. Configure `TAVILY_API_KEY` server-side. Search failure offers a return to the same movement session without changing its score. No latency, adoption, health, accessibility-compliance, or sponsor-prize claims have been validated. See [revised plan](docs/REVISED_PLAN.md) and [evidence cases](docs/EVIDENCE_CASES.md). These distinguish source inspection, executable synthetic cases, browser checks, and pending participant observations.

## Review

Review branch: `improve/review-ready-interactions`, targeting `main`. Merging and production deployment are separate from this review. Existing dependency audit findings require separate review before production use.

## Observed-session handoff

Use [the first playtest guide](docs/FIRST_PLAYTEST.md) for an actual participant. For reproducible browser UI examples only, run the dev server and add `?lab` to its URL. The lab is clearly labeled, uses no camera/cloud speech, and is not included in production builds.

## Discovery within movement

Choose comfortable movements, pace, and an optional Space or Animals discovery break. Practice movement first. After three movement rounds, accept one sourced question or keep moving. The question screen explicitly changes the rules: choose A or B, with no Simon says tricks and no response deadline. Two unscored gesture practices establish the mappings; answer buttons bypass gesture practice and remain available as a fallback. One selected movement automatically uses buttons for discovery.

A short spoken explanation follows the answer. “Explore this fact” reveals its retrieved excerpt and source. Return to movement resumes round four; discovery feedback remains separate in the final recap. Leaving, skipping, search errors, and a 16-second search timeout all allow movement to continue. Search starts only after accepting the break. Camera resources are released during the offer and on discovery exit.

The `/api/tavily` request is now `{ topic: "space" | "animals" }`; arbitrary query requests from the earlier unused trivia helper are replaced. One Tavily search runs initially per accepted break. A second template is searched only if the first produces no supported question; both share a 12-second deadline. One supported question is shown. There is no offline question fallback. Server-side templates, domain restrictions, and matching evidence constrain the first version; these checks are not a general-purpose fact checker.
