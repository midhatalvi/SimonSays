# Why Simon Says exists

[Documentation](README.md) · [Player guide](player-guide.md) · [Design direction](design-direction.md)

## The idea

Simon Says turns a familiar childhood rule into a short browser-based movement and listening game. A friendly host gives an instruction, and the player moves only when it begins with “Simon says.” The camera becomes the controller.

The project focuses on older adults because a familiar rule, large controls, adjustable timing, and seated movement can reduce the effort needed to begin. These are design hypotheses to test with players, not evidence of health improvement or universal accessibility.

## The problem we want to solve

Starting a movement activity can feel like work before any movement begins. Products may assume confidence with fitness language, complex navigation, wearables, or rigid routines. Simon Says aims to make the first step smaller:

- open one web page;
- choose movements that feel comfortable;
- sit or stand;
- follow a visible and spoken prompt;
- finish after six short rounds or when three lives are used.

## Why the classic game remains central

The three-life rule gives the session a recognizable goal and a little tension. The redesign keeps the original story—Simon wants to “stay sharp together”—while adding clearer setup, visible rules, recovery controls, and camera privacy language.

The optional discovery break extends attentive listening into curiosity. After round three, the player may request one sourced Space or Animals question through Tavily or keep moving. Discovery is deliberately separate from movement scoring.

## Product principles

1. **Ask before using the camera.** Welcome and setup work without camera access.
2. **Let the player choose.** Movement selection, pace, pause, repeat, skip, and discovery are controllable.
3. **Make state visible.** The instruction, timer, lives, camera status, and feedback remain readable.
4. **Process movement locally.** MediaPipe evaluates camera frames in the browser.
5. **Fail clearly.** Tracking and service failures provide a route back to setup or movement.
6. **Claim only what is known.** Automated tests do not substitute for real player and device testing.

## What success would mean

Near-term success is a real player completing the game without coaching, understanding when to move, recovering from a missed instruction, and feeling comfortable enough to play again. Longer-term questions—repeat use, accessibility across devices and bodies, and usefulness for older adults—require observation and cannot be inferred from the current prototype.
