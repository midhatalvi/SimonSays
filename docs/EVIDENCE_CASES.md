# Validation evidence

[Documentation](README.md) · [Live playtest](FIRST_PLAYTEST.md) · [Current build](current-build.md)

This ledger separates what has been verified from what remains uncertain. It contains no participant or health claims.

## Automated checks

`npm test` currently passes 58 cases. Discovery-loop coverage includes canonical response normalization, source rejection, malformed/network fallback, every supported selected-pose mapping, same-fact recall, separate score accounting, and no search on declined/disabled discovery. They also cover:

- tracking loss, intermittent tracking, readiness deadlines, pause, skip, and cancellation;
- three lives, early elimination, completed sessions, and unscored rounds;
- all six movement geometries, including wrong-side raises, finger-based touches, crossed and uncrossed shoulders, outward arms, missing landmarks, and portrait/landscape ratios;
- voice caching, fetch and playback deadlines, browser fallback, and cancellation;
- discovery source validation, answer mapping, malformed responses, service failure, and request limits.

These tests use synthetic landmarks, detector traces, and mocked services. They do not prove real-camera accuracy.

## Browser flow checks

The development-only `/?lab` flow has completed:

- rules and movement rounds;
- the discovery offer after round two;
- a synthetic A/B answer and evidence disclosure;
- return to the same movement session;
- three-life elimination and results;
- separate movement and discovery scoring.

The lab explicitly uses no camera, live speech, or live search.

## Live service checks

- A local authenticated Tavily request returned “Which is the largest planet in our solar system?” with supporting evidence from NASA.
- Missing Tavily configuration returns a recoverable error.
- Authenticated ElevenLabs playback has not been verified in this review.

No keys are committed. Local secrets remain in ignored environment files.

## Real-camera observations

- The browser received permission and displayed the live camera.
- A session reached a nose-touch instruction but did not recognize the performed gesture before timeout.
- Another focused attempt reported both hands untracked before the instruction.
- These observations led to fingertip-aware touch detection, movement-specific readiness, tracking hints, and aspect-ratio tests.

A complete successful real-camera session has not yet been observed after those corrections.

## Still required before calling the demo reliable

- Complete all six movements on a laptop webcam.
- Complete the same acceptance flow on a physical phone over HTTPS.
- Verify tricks, three-life elimination, pause/repeat/skip, timeout recovery, camera release, discovery, and replay.
- Record false positives, false negatives, device/browser, framing, and lighting.
- Verify authenticated ElevenLabs playback and timing.
- Test with older adults and record comprehension and comfort in their own words.

Do not describe passing automated tests as proof of accessibility, camera accuracy, health benefit, adoption, or production readiness.
