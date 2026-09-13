# Current build

[Documentation](README.md) · [Architecture](architecture.md) · [Validation evidence](EVIDENCE_CASES.md)

The current review is [PR #2](https://github.com/midhatalvi/SimonSays/pull/2) on `design/a-little-lift`, based on the main branch that includes merged PR #1.

## Implemented

- Original three-life Simon Says rules across up to six rounds.
- No practice round; the game explains rules after camera startup.
- Comfortable movement selection and 5, 8, or 12-second timing.
- Pause, repeat, skip without penalty, exit, and replay.
- Default-enabled optional Tavily discovery after round three.
- Separate movement and discovery scoring.
- Bespoke responsive identity and locally hosted licensed fonts.
- On-device MediaPipe detection with finger-aware touches and movement-specific readiness.
- Local and Vercel API handlers for Tavily and ElevenLabs.
- Bounded readiness, tracking, search, speech fetch, and speech playback waits.

## Verified

- 52 automated tests pass.
- The production build passes.
- The complete synthetic browser flow reaches discovery, resumes movement, and reaches results.
- Authenticated Tavily returned a NASA-supported question locally.
- The supplied Tavily key remains in an ignored local environment file and is not committed.

## Known limitations

- A complete successful real-camera playthrough after the latest pose corrections has not been observed.
- The last focused camera attempt reported both hands untracked before a command.
- Real camera accuracy varies with person, framing, lighting, device, and MediaPipe confidence.
- Authenticated ElevenLabs and a physical phone session remain unverified.
- An eight-second speech deadline may truncate an unusually long line; written instructions remain visible.

This is the most capable current implementation, but passing synthetic checks does not make it production-ready. Follow the [live playtest](FIRST_PLAYTEST.md) before a demo or merge decision.
