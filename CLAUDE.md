# Agent guidance — Simon Says

Repository: `midhatalvi/SimonSays`. User-facing name: **Simon Says**.

## Read first

- [Project introduction](README.md)
- [Documentation map](docs/README.md)
- [Current build](docs/current-build.md)
- [Architecture](docs/architecture.md)
- [Contributing](CONTRIBUTING.md)
- [Shared contracts](shared/README.md)

## Product boundary

Simon Says is a camera-based movement and listening game aimed especially at older adults. Preserve the familiar rule, three lives, up to six rounds, selectable comfortable movements, optional sourced discovery, and separate movement/discovery results. Describe engagement and movement, never treatment or clinical benefit.

## Technical rules

- Keep the Vite, React, and plain JavaScript stack unless a change has a clear reason.
- Keep MediaPipe inference and camera frames in the browser.
- Keep ElevenLabs and Tavily keys server-side behind existing handlers.
- Do not put credentials in client variables, logs, fixtures, or commits.
- Treat `shared/` as a co-owned contract. Coordinate interface changes and update its documentation.
- Preserve large text, high contrast, keyboard focus, reduced motion, and clear recovery controls.
- Check camera behavior on laptops and physical phones; phones require HTTPS.
- Keep automated, synthetic-browser, live API, and real-player evidence distinct.

## Main interfaces

The real detector returns `{ matched, confidence, tracking, ready }`. The engine uses tracking to avoid judging missing landmarks and readiness to separate rounds. `resetPoseHistory()` and `stopVision()` control detector lifecycle.

Discovery searches only reviewed Space or Animals templates after the player accepts. The result requires matching evidence from allowed sources. Discovery failure must allow movement to continue.

## Folder ownership

| Area | Responsibility |
| --- | --- |
| `ui/` | Product screens and design system |
| `engine/` | Movement, discovery-answer, and session rules |
| `vision/` | MediaPipe setup and pose evaluation |
| `voice/` | Prepared speech, fallback, and cancellation |
| `content/` | Reviewed discovery templates and evidence matching |
| `server/` and `api/` | Local and deployed service handlers |
| `shared/` | Co-owned constants and interfaces |
| `tests/` | Synthetic regression coverage |

## Verification

Run `npm test` and `npm run build`. Use `/?lab` only for explicitly synthetic UI flow checks. Follow [the live playtest](docs/FIRST_PLAYTEST.md) before claiming webcam reliability or demo readiness.
