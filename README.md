# Spry (simonsays)

Camera-based cognitive + movement game to help elderly users stay sharp. A
friendly voice calls out actions, you perform them in front of your camera, the
app scores you live and reacts. Built at LOCK IN Hack. Sponsor APIs: ElevenLabs
(voice) + Tavily (live content).

See **CLAUDE.md** for the full spec, shared contracts, and folder ownership.

## Quickstart

```bash
npm install
npm run dev      # camera works on localhost; open the Network URL on a phone
```

The app runs end-to-end right now with a **fake detector** (random pass/fail)
and **browser speech** fallback — no API keys needed to see the loop.

## Folder ownership

| Folder                | Owner    | What                               |
| --------------------- | -------- | ---------------------------------- |
| `/shared`             | both 🔒  | pose names + interfaces (LOCKED)   |
| `/vision`             | teammate | MediaPipe + real `checkPose`       |
| `/content`            | teammate | Tavily round generation            |
| `/server/tavily`      | teammate | Tavily proxy                       |
| `/engine`             | Midhat   | game state machine + rounds        |
| `/voice`              | Midhat   | ElevenLabs client                  |
| `/ui`                 | Midhat   | Start / Game / Score screens       |
| `/server/elevenlabs`  | Midhat   | ElevenLabs proxy                   |
| `/api`                | both     | thin Vercel wrappers → `/server/*` |

Don't edit the other person's folders. Don't change `/shared` without agreeing
first (then update CLAUDE.md in the same commit).

## Integration points (one-line swaps)

- Real detector: in `ui/GameScreen.jsx`, change
  `import { checkPose } from "../engine/fakeCheckPose.js"` →
  `"../vision/checkPose.js"`.
- Real voice: set `ELEVENLABS_API_KEY` (+ optional `ELEVENLABS_VOICE_ID`) in
  Vercel; the client auto-uses `/api/elevenlabs`, else falls back to browser TTS.

## Env

Copy `.env.example` → `.env` for local API testing; set the same keys in Vercel.

## Deploy

Auto-deploys on push to `main` via Vercel (HTTPS URL for phone testing).
