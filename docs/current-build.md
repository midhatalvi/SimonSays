# Current build

[Documentation](README.md) · [Architecture](architecture.md) · [Validation evidence](EVIDENCE_CASES.md)

The local discovery-loop update builds on main commit `d022c28`. PRs #1–#3 preceded this update. See [architecture](architecture.md) for the current fact → movement → recall contract.

## Implemented

- Original three-life Simon Says rules across up to six rounds.
- No practice round; the game explains rules after camera startup.
- Comfortable movement selection and 5, 8, or 12-second timing.
- Pause, repeat, skip without penalty, exit, and replay.
- Default-enabled Tavily discovery after round two, a sourced themed movement in round three, and same-fact recall after the movement rounds. Players may decline discovery.
- Separate movement and discovery scoring.
- Bespoke responsive identity and locally hosted licensed fonts.
- On-device MediaPipe detection with finger-aware touches and movement-specific readiness.
- Local and Vercel API handlers for Tavily and ElevenLabs.
- Bounded readiness, tracking, search, speech fetch, and speech playback waits.

## Verified

- Discovery-loop browser check: Animals → curated fact → selected right-hand movement → six rounds → same-fact recall → recap. A deliberately wrong recall answer produced discovery 0/1 while movement remained 6/6 and lives stayed at 3. This used synthetic pose input and simulated speech, not a real webcam or ElevenLabs.

- 58 automated tests pass, including strict discovery normalization, source rejection, client fallback, safe selected-pose mapping, recall consistency, and discovery skip privacy.
- The production build passes.
- The complete synthetic browser flow reaches discovery, resumes movement, and reaches results.
- Authenticated Tavily returned a NOAA-backed Animals gameplay object locally for the discovery loop.
- The supplied Tavily key remains in an ignored local environment file and is not committed.

## Known limitations

- A complete successful real-camera playthrough after the latest pose corrections has not been observed.
- The last focused camera attempt reported both hands untracked before a command.
- Real camera accuracy varies with person, framing, lighting, device, and MediaPipe confidence.
- Authenticated ElevenLabs and a physical phone session remain unverified.
- An eight-second speech deadline may truncate an unusually long line; written instructions remain visible.

This is the most capable current implementation, but passing synthetic checks does not make it production-ready. Follow the [live playtest](FIRST_PLAYTEST.md) before a demo or merge decision.
