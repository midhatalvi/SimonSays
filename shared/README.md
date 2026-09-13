# Shared contracts

[Project home](../README.md) · [Architecture](../docs/architecture.md) · [Contributing](../CONTRIBUTING.md)

`shared/poses.js` defines names and basic shapes used by the engine and vision code. Treat these interfaces as co-owned.

## Poses

| Constant | Use |
| --- | --- |
| `RIGHT_HAND_UP` | Selectable command |
| `LEFT_HAND_UP` | Selectable command |
| `TOUCH_HEAD` | Selectable command |
| `ARMS_OUT` | Selectable command |
| `TOUCH_SHOULDERS` | Selectable command |
| `TOUCH_NOSE` | Selectable command |
| `BOTH_HANDS_UP` | Reserved posture; not in the active command rotation |

`ACTIVE_POSES` in `engine/gameEngine.js` controls which poses can appear in movement rounds.

## Detector result

```js
checkPose(target)
// {
//   matched: boolean,
//   confidence: number,
//   tracking: boolean,
//   ready: boolean
// }
```

- `matched` means the target has passed its brief fresh-frame confirmation.
- `confidence` is the current target geometry score from 0 to 1.
- `tracking` means the required landmarks are current and visible enough to judge.
- `ready` means the target pose has been released and the relevant hand or hands are in a relaxed starting position.

Legacy test runtimes may omit `ready`; the engine then falls back to a low target confidence. Active game runtimes must include `tracking`.

`resetPoseHistory()` clears held-pose confirmation between states. `stopVision()` releases the stream, model, preview, and history.

## Movement round

```js
{
  type: "movement",
  promptText: "Simon says raise your right hand!",
  spokenText: "Simon says... raise your right hand.",
  targetPose: POSES.RIGHT_HAND_UP,
  timeLimitSec: 8,
  simonSays: true
}
```

Always provide `simonSays` explicitly. `false` creates a trick round in which performing the target is a failure.

## Changing a contract

Update engine, vision, synthetic runtimes, tests, [architecture](../docs/architecture.md), and this file together. Do not infer live-camera correctness from interface compatibility alone.
