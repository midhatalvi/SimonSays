# CLAUDE.md — Simon Says

Repo: `midhatalvi/SimonSays`. Product name shown to users: **Simon Says**.

## What we're building

Simon Says is a **camera-based cognitive + movement game to help elderly users stay sharp**. It's a Simon-Says-style game: a friendly voice host calls out actions, the user performs them in front of their device camera, the app scores their movements live, and the voice reacts. At the end it shows a score and a spoken recap.

Built at a weekend hackathon (LOCK IN Hack). Sponsor APIs we're using: **ElevenLabs** (voice) and **Tavily** (live web content). Using both is worth extra prizes.

**Not a medical product.** Frame everything as "engagement" and "staying sharp," never treatment or clinical claims.

## Tech stack (do not change without a reason)

- **Frontend:** Vite + React, plain JavaScript.
- **Vision:** `@mediapipe/tasks-vision` (Pose Landmarker) running **in the browser, on-device**. No Python vision backend — it adds latency and a failure point on a live demo.
- **Camera:** browser `getUserMedia`. Requires HTTPS (localhost is exempt).
- **Voice:** ElevenLabs text-to-speech, called through our own backend proxy so the API key stays server-side.
- **Live content:** Tavily search API, called through the backend, turned into trivia/reminiscence rounds.
- **Backend:** minimal Node serverless functions (proxies only — no heavy logic).
- **Deploy:** Vercel. Every push gets an HTTPS URL we can open on a phone.

## Architecture

The core is a **real-time game loop**:

1. Engine picks a round and issues a command.
2. ElevenLabs speaks the command.
3. MediaPipe reads the camera; the detector checks whether the user's pose matches.
4. Engine scores pass/fail within a time window.
5. Voice reacts; score updates; next round.

Vision runs client-side. The backend only proxies ElevenLabs and Tavily.

## Shared contracts — DO NOT change these casually

These are the interfaces both halves of the team build against. Changing one breaks the other person's code. Change only after explicit agreement, then update this file in the same commit.

### Pose names (fixed set)

```
RIGHT_HAND_UP
LEFT_HAND_UP
BOTH_HANDS_UP        # now used as the neutral "no task" posture, not a command
TOUCH_HEAD
ARMS_OUT
TOUCH_SHOULDERS      # detection TODO in /vision (Shravanthi); dormant until ready
TOUCH_NOSE           # detection TODO in /vision (Shravanthi); dormant until ready
```

Game rule: rounds are either "Simon says <action>" (perform the pose) or a trick
"<action>" (do NOT perform it). Trick rounds need no new detection — the engine
just checks the commanded pose is not performed. Poses become playable only when
listed in `ACTIVE_POSES` in /engine, so a name can exist here before /vision
implements it.

### Detector interface

```js
// Returns whether the current camera pose matches the target.
checkPose(target) // target is one of the pose names above
// => { matched: boolean, confidence: number }  // confidence 0..1
```

### Round object

```js
{
  type: "movement" | "trivia",   // movement = pose game, trivia = Tavily content
  promptText: string,            // what the voice says / screen shows
  targetPose: string | null,     // a pose name for movement rounds, null for trivia
  timeLimitSec: number,
  simonSays?: boolean            // Simon Says rule: true = perform the pose,
                                 // false = trick (must NOT perform). Default true.
}
```

## Folder ownership

Each person owns their folders and does **not** edit the other's. `/shared` is co-owned and locked (see contracts above).

- `/vision` — MediaPipe setup + `checkPose` **(teammate)**
- `/content` — Tavily round generation **(teammate)**
- `/server/tavily` — Tavily proxy **(teammate)**
- `/engine` — game state machine + round logic **(Midhat)**
- `/voice` — ElevenLabs client **(Midhat)**
- `/ui` — screens (Start / Game / Score) **(Midhat)**
- `/server/elevenlabs` — ElevenLabs proxy **(Midhat)**
- `/shared` — pose names + interface types **(both, locked)**

## How we work in parallel

Build against **stubs** so neither person waits on the other:

- The engine uses a **fake `checkPose`** (returns random pass/fail) until the real detector is ready. Then swap it in — one line, because both sides honor the interface above.
- The detector is tested on a standalone page (camera + buttons that print `checkPose` results), no game needed.

If you need to change anything in `/shared`, stop and confirm with the other person first.

## Conventions for Claude Code

- Keep code simple and readable — this is a 24-hour build, not production. No over-engineering, no premature abstraction.
- Do not introduce new dependencies or frameworks without asking. Stick to the stack above.
- Never put API keys in client-side code. All ElevenLabs and Tavily calls go through the backend proxies.
- Respect folder ownership: when asked to work on one area, don't refactor another person's folder.
- Elderly-first UI: large text, high contrast, one primary action per screen.
- Camera code must work on both laptop webcams and phone cameras. Test assumptions against phone constraints.

## Build order (24 hours)

1. **Foundation (0–2h):** Vite+React app, deploy to Vercel, camera live on a phone over HTTPS. Lock `/shared` contracts. Split the repo.
2. **Parallel build (2–12h):** Midhat builds the full loop with a fake detector + voice + screens. Teammate builds the real MediaPipe detector on a test page.
3. **Integrate (12–14h):** Swap fake detector for real one. First full round on a phone.
4. **Content + polish (14–18h):** Add Tavily rounds, score screen with spoken recap, elderly UI pass.
5. **Harden (18–22h):** Test on multiple phones, tune thresholds and latency.
6. **Freeze + rehearse (22–24h):** No new features. Rehearse the demo twice. Record a backup video.

## Minimum viable demo (ship this no matter what)

Camera + pose Simon Says + ElevenLabs voice calling commands and reacting + a score. Tavily rounds and the caregiver summary are nice-to-have — add only after the core loop is bulletproof.

## Commands

```
npm install
npm run dev      # local dev (camera works on localhost)
npm run build
```

Deploy is automatic on push to main via Vercel.

## Fair-play revision
User-authorized cross-folder integration: detector adds `tracking: boolean` while preserving matched/confidence. The engine requires tracking explicitly, excludes interrupted rounds from timing, and needs a neutral pose before Go. `resetPoseHistory` and `stopVision` manage session boundaries. Gentle play replaces elimination; the score excludes skips/tracking timeouts. Real pose detection is connected. Tavily remains outside the active game.

## Learn & Move integration
User-authorized next feature: separate learning mode uses `content/learningQuestions.js` reviewed templates and `/api/tavily` topic retrieval. It shows only questions with matching source evidence; this is not unconstrained AI question generation. Gesture answering uses `engine/learningEngine.js`, separate from the movement/trick engine. Two unscored mappings precede learning; source excerpts and answers are revealed afterward. Button answers provide a camera-free path.

## Integrated discovery revision — 2026-09-13

One “Play with Simon” entry keeps older adults and comfortable movement central. An optional offer after three of six movement rounds leads to one sourced question, with explicit question rules, gesture practice or buttons, expandable evidence, and return to the preserved movement session. Discovery feedback never alters movement scoring. Search failures are recoverable without ending the session. This supersedes the separate public Learn & Move entry; the isolated screen remains available in the development verification harness. No clinical benefit or user-study outcome is claimed.
