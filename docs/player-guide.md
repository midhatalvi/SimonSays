# Player guide

[Documentation](README.md) · [Why Simon Says exists](project-story.md) · [Troubleshooting](#camera-and-troubleshooting)

## Before you begin

Use a device with a camera and enough room to move your hands comfortably. Sit or stand. Keep your head, shoulders, and hands visible, and stop any movement that feels uncomfortable. The game never needs microphone access.

## Set up your game

1. Select at least one comfortable movement.
2. Choose a pace: **Relaxed — 12 seconds**, **Comfortable — 8 seconds**, or **Quick — 5 seconds**.
3. Leave discovery on for an optional Space or Animals question after round three, or switch it off.
4. Choose gesture or button answers for discovery.
5. Select **Play with Simon** and allow camera access.

## Rules

You begin with three lives and play up to six rounds:

- If Simon says “Simon says…,” perform the movement.
- If the instruction does not begin with those words, stay still.
- A missed instruction or moving on a trick costs one life.
- The session ends after six rounds or when all three lives are used.

Relax the requested hand or hands between rounds. Simon reveals the next instruction after confirming the ready position. Hold a requested movement briefly so the camera can confirm it.

## Controls

| Control | Result |
| --- | --- |
| Pause | Suspends judging until Resume is selected |
| Repeat instruction | Repeats the current prompt |
| Skip — no penalty | Leaves the round unscored and preserves lives |
| End session / change movements | Turns off the camera and returns to setup |

If the required body points cannot be tracked or readiness cannot be confirmed for ten seconds, the session ends without taking another life and the camera is released.

## Discovery break

After round three, choose **Explore one fact** or **Keep moving**. Search begins only after the player accepts.

Discovery has no Simon Says tricks and no time limit. Choose A or B with the selected gestures or buttons. The answer includes a source excerpt and link. Discovery results appear separately and do not change movement lives or score. If search is unavailable, return to movement.

## Camera and troubleshooting

- Keep the room evenly lit and avoid a bright window behind you.
- Move far enough back for both shoulders and the active hands to remain visible.
- Lower the requested hands between rounds; they can remain inside the frame.
- Follow the on-screen tracking hint if it names a missing hand, shoulder, or face point.
- If the camera is unavailable, close other apps using it and retry.
- Phone camera access requires an HTTPS link; a laptop’s localhost URL will not work on the phone.

Camera frames stay on the device. MediaPipe model files load from external hosting. Voice text goes through ElevenLabs when configured and otherwise uses browser speech. Tavily receives only the chosen topic when discovery is accepted.
