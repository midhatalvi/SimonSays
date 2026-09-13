# Roadmap

[Documentation](README.md) · [Current build](current-build.md) · [Live playtest](FIRST_PLAYTEST.md)

The product direction is set: preserve the classic three-life Simon Says game, make movement approachable for older adults, and keep sourced discovery optional. The next work should be driven by observed failures.

## 1. Prove the core loop

- Complete a real-camera session across all six poses on a laptop.
- Repeat on a physical phone over HTTPS.
- Tune thresholds only from recorded false positives and false negatives.
- Confirm camera release, replay, speech fallback, and timeout paths.

## 2. Validate sponsor services

- Verify Tavily on the deployed server with Space and Animals.
- Verify ElevenLabs playback, fallback, cancellation, and transition timing.
- Confirm no secret appears in client assets, logs, or version control.

## 3. Test the experience with the intended audience

- Observe whether older adults can start without coaching.
- Check comprehension of Simon Says versus discovery rules.
- Record comfort with movement choices, timing, voice, and controls.
- Improve copy and interaction from actual observations.

## 4. Prepare a dependable demo

- Freeze behavior after acceptance passes.
- Rehearse the primary flow twice on the presentation device.
- Keep discovery recoverable if a service is unavailable.
- Record a backup demo showing the same verified build.

Do not add broader features until the real movement loop is dependable. Do not claim health benefit, demand, accessibility compliance, or performance improvement without evidence.
