# The story behind Simon Says

> Version scope: this guide describes review branch `improve/review-ready-interactions` at `814f65c`. The application on `main` is still the earlier build; use the review branch to follow this guide.

[Home](../README.md) · [Player guide](player-guide.md) · [Technical architecture](architecture.md)

## Inspiration

Simon Says starts with a familiar game: listen carefully, decide whether to act, and move. The project brings that interaction to a browser with a friendly host, aiming to make short movement sessions approachable for older adults without a controller or wearable device.

## What it does

Players choose comfortable movements and timing, practice, then complete six Simon Says rounds. Persistent instructions and a visible Go state clarify when to respond. Pause, repeat, skip, and tracking recovery let players continue without being eliminated.

An optional discovery break after three rounds offers one sourced Space or Animals question. Players practice A/B gestures or use buttons, explore the evidence, and resume movement. Discovery results remain separate from the movement score.

## How it is built

React connects setup, movement, discovery, and results. MediaPipe detects poses in the browser. Separate engines handle movement/trick rules and A/B gesture selection. ElevenLabs speech is prepared ahead with timeout, cancellation, and browser fallback. Tavily searches support a reviewed bank of four questions using allowed domains and matching excerpts. Unsupported questions are withheld; this is not unconstrained AI question generation.

## Engineering highlights

- Explicit tracking validity prevents missing camera landmarks from being counted as correct stillness.
- Neutral readiness separates an instruction from the scoring window and prevents carryover poses from scoring immediately.
- Pause and tracking recovery preserve active response time; skips and tracking timeouts remain unscored.
- Speech preparation deduplicates requests and cleans up playback resources.
- Optional discovery preserves the movement session across answering, skipping, or search failure.

## Current evidence and next steps

This documentation targets review commit `814f65c`, not the older `main` build. The review branch records 31 passing synthetic tests and a passing production build. The existing [evidence ledger](EVIDENCE_CASES.md) records additional simulated browser checks and their limitations.

Real camera accuracy and release/restart, live authenticated Tavily and ElevenLabs calls, and usefulness for older adults remain to be observed. The next step is the [first playtest](FIRST_PLAYTEST.md), followed by changes justified by actual observations. No clinical benefit, adoption, or measured latency improvement is claimed.

## Presentation checklist

Before using this story for a hackathon presentation:

- [ ] Add a working HTTPS demo link and a short demo video.
- [ ] Show the start screen, one real command, one trick, and the results screen.
- [ ] Record which devices and browsers were tested, with outcomes.
- [ ] Add the team's own account of challenges, lessons, and contributions.
- [ ] Confirm event-specific fields and requirements against the actual event.

## Writing references

The organization takes inspiration from two winning Devpost project pages: [BlindSpot](https://devpost.com/software/blindspot-zs7dwq), which clearly connects the user problem to the experience and implementation, and [AccessAIble](https://devpost.com/software/isee-i3svk0), which introduces its intended users before describing the technology. Their claims, results, and awards belong to those projects. This page describes Simon Says from its own repository and is not an official event submission.
