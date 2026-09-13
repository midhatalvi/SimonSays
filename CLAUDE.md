# Agent guidance — Simon Says

Repository: `midhatalvi/SimonSays`. User-facing product name: **Simon Says**.

## Read first

- [README](README.md): product introduction and documentation routes.
- [Contributing](CONTRIBUTING.md): folder ownership and collaboration rules.
- [Developer guide](docs/development.md): setup and verification.
- [Architecture](docs/architecture.md): current runtime behavior.
- [Shared contracts](shared/README.md): interface reference.

## Rules for changes

- Respect folder ownership. Do not refactor another person's folders while working on your assigned area.
- `shared/` is co-owned and locked. Obtain explicit agreement before changing shared contracts, then update this file in the same commit.
- Keep Vite, React, and plain JavaScript unless there is a reason to change. Ask before introducing dependencies or frameworks.
- Keep vision in the browser. Do not introduce a Python vision backend.
- Keep ElevenLabs and Tavily keys server-side behind the existing proxies.
- Prefer readable, focused code appropriate to a hackathon prototype.
- Preserve the older-adult-oriented design goals: large text, high contrast, one primary action per screen.
- Verify camera behavior on laptops and phones; phone camera testing requires HTTPS.
- Describe movement and engagement, not treatment or clinical benefits.

## Current main integration state

Main remains at application revision `c4dfe4f`: real detection and six active poses, three lives, no practice/recovery controls, and Tavily outside gameplay. The documentation published here also describes a newer review branch; do not infer those changes exist in this checkout. Inspect the current source before editing.

## Review branch integration state

Review commit `814f65c` adds user-authorized cross-folder integration: tracking validity, neutral readiness, practice, comfortable movement/timing selection, recovery controls, prepared speech, and no-elimination scoring. An optional Tavily discovery break after three rounds resumes the same movement session and keeps A/B results separate. It replaces the earlier separate public learning entry; the isolated screen remains in the development harness.

## Shared contract change record

The upstream review revision adds `tracking: boolean` to the detector result and requires it in the engine, plus `resetPoseHistory` and `stopVision` lifecycle helpers. Shared JSDoc has not caught up. This documentation edit changes no executable interfaces. See [shared contracts](shared/README.md) for current behavior.

## Original hackathon priorities

The original 24-hour plan was: establish the frontend and camera, build engine and vision independently against shared contracts, integrate the detector, add content and UI polish, test on phones, then freeze and rehearse. The minimum demo was camera-based Simon Says, spoken commands and reactions, and a score. Tavily content and a caregiver summary were optional extensions.

Use these as historical context, not as evidence that all testing or extensions were completed.
