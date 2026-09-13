# Shared contracts

> Version scope: this guide describes review branch `improve/review-ready-interactions` at `814f65c`. The application on `main` is still the earlier build; use the review branch to follow this guide.

[Home](../README.md) · [Architecture](../docs/architecture.md) · [Contributing](../CONTRIBUTING.md)

`poses.js` defines the interfaces used by both the engine and detector. This directory is co-owned and locked: change contracts only after explicit agreement, then update `CLAUDE.md` in the same commit.

## Import

```js
import { POSES, POSE_NAMES } from "../shared/poses.js";
```

## Pose names

| Constant | Current role |
| --- | --- |
| `RIGHT_HAND_UP` | Active command |
| `LEFT_HAND_UP` | Active command |
| `TOUCH_HEAD` | Active command |
| `ARMS_OUT` | Active command |
| `TOUCH_SHOULDERS` | Active command |
| `TOUCH_NOSE` | Active command |
| `BOTH_HANDS_UP` | Neutral posture; excluded from command rotation |

`POSE_NAMES` contains all seven names. `ACTIVE_POSES` in `engine/gameEngine.js` controls the playable subset. Older comments in `poses.js` describe shoulder/nose detection as pending; the current engine and detector implement them.

## Detector

```js
checkPose(target)
// => { matched: boolean, confidence: number, tracking: boolean }
```

`target` is a shared pose name; confidence is between 0 and 1. The current game uses `vision/checkPose.js`. Its engine requires `tracking === true`; the legacy fake detector is not a drop-in replacement without tracking support. `resetPoseHistory()` and `stopVision()` manage history and camera lifecycle. The unchanged shared JSDoc still documents only matched/confidence.

## Round

```js
{
  type: "movement",       // documented alternatives: "movement" | "trivia"
  promptText: "Simon says raise your right hand!",
  targetPose: POSES.RIGHT_HAND_UP, // null for trivia
  timeLimitSec: 5,
  simonSays: true          // false for trick rounds
}
```

The shared documentation marks `simonSays` optional with a default of true, but `judgeRound` actually branches on its truthiness. Movement producers should explicitly supply `true` or `false` with the current implementation. The engine also adds `spokenText` for voice cadence; this is an implementation extension beyond the shared JSDoc shape.

This reference documents the upstream review revision without changing executable interfaces.
