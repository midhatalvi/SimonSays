# Simon Says

**A short movement game at your pace — with a friendly voice and an optional moment of discovery.**

Choose comfortable movements, practice with Simon, and listen for “Simon says.” After three rounds, explore a sourced Space or Animals question or keep moving. Sit or stand; pause, repeat, or skip whenever needed.

Built for LOCK IN Hack with older adults in mind. This is an engagement prototype, not a clinical assessment or treatment.

## Start here

| I want to… | Read this |
| --- | --- |
| Learn how to play | [Player guide](docs/player-guide.md) |
| Understand the idea and progress | [Project story](docs/project-story.md) |
| Run or test the app | [Developer guide](docs/development.md) |
| Understand the components | [Architecture](docs/architecture.md) |
| Contribute | [Contributing](CONTRIBUTING.md) |
| Review evidence or run a playtest | [Evidence ledger](docs/EVIDENCE_CASES.md) · [Playtest guide](docs/FIRST_PLAYTEST.md) |

## What is included

- Six selectable command poses and 5, 8, or 12-second movement windows.
- Repeatable, unscored practice before a six-round session.
- Visible instructions and a **Go** state after returning to neutral.
- Pause, repeat, skip, and exit controls; tracking interruptions pause judging.
- Gentle scoring with no lives or elimination. Skips and tracking timeouts stay out of the scored total.
- An optional discovery break after three rounds: one evidence-supported A/B question, answered with practiced gestures or buttons.
- Separate movement and discovery results, with a spoken recap.

MediaPipe processes camera frames in the browser. ElevenLabs provides prepared speech through a server endpoint, with browser speech fallback. Tavily retrieves supporting evidence for four reviewed question templates; it does not generate arbitrary questions.

## Version and demo

These docs describe review branch `improve/review-ready-interactions` at `814f65c` (September 13, 2026), associated with [PR #1](https://github.com/midhatalvi/SimonSays/pull/1). The checked `main` branch remains at `c4dfe4f` and has older behavior. A deployed site may differ; verify its revision before using it for a demo.

[Run this version locally](docs/development.md#run-locally). The review notes report that the Vercel preview requires authentication; no public access is promised here.

## Built with

React · Vite · JavaScript · MediaPipe Pose Landmarker · ElevenLabs · Tavily · Vercel serverless functions.

The review branch records 31 passing automated synthetic tests and a passing production build. Actual camera accuracy, live sponsor services, and participant usability remain separate validation work; see the [evidence ledger](docs/EVIDENCE_CASES.md).
