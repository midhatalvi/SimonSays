# Player guide

> Version scope: this guide describes review branch `improve/review-ready-interactions` at `814f65c`. The application on `main` is still the earlier build; use the review branch to follow this guide.

[Home](../README.md) · [Project story](project-story.md)

This guide describes the updated review build listed in the README. An older deployed version may show different controls.

## Set up comfortably

Open the updated app link supplied by the team. Use a camera-equipped device, allow camera permission, and keep your head, shoulders, and hands visible. Sit or stand comfortably and choose only movements that feel comfortable. Internet access is needed to load the movement model. No microphone is needed.

1. Select your movements. At least one must be selected.
2. Choose **Relaxed — 12 seconds**, **Comfortable — 8 seconds**, or **Quick — 5 seconds**. Comfortable is the default; trick rounds use three seconds.
3. Keep or turn off the optional discovery break. If enabled, choose Space or Animals and gesture or button answers.
4. Select **Play with Simon** and allow the camera.

## Practice, then play

Practice is unscored. Try **Practice again** as needed, then select **I’m ready — start game**.

Read or listen to each complete instruction. Relax your hands and wait for **Go** before responding. When Simon says “Simon says,” do the movement. Without those words, avoid the requested movement.

There are six movement rounds and no elimination. You can finish at your own pace:

| Control or event | What happens |
| --- | --- |
| Pause | Freezes the response timer |
| Repeat instruction | Repeats the prompt and stays paused; select Resume when ready |
| Skip — no penalty | Leaves the round unscored |
| Camera loses needed body points | Pauses judging; return into view and relax before Go |
| Tracking remains unavailable for 15 seconds | Leaves the round unscored |
| End session / change movements | Returns to setup |

## Optional discovery break

After three movement rounds, select **Explore one fact** or **Keep moving**. Search begins only if you accept.

The question has different rules: choose A or B, with no Simon says tricks and no answer deadline. Gesture mode first practices two answer movements without scoring. Button mode bypasses gesture practice, and **Use answer buttons instead** is available as a fallback. Selecting only one movement uses buttons automatically.

After answering, read or hear the explanation. **Explore this fact** reveals an excerpt and source link. Return to movement to continue round four. If search fails, return to the same session; there is no offline question fallback.

## Results

Your movement score is out of scored rounds, excluding skips and tracking timeouts. If all rounds are unscored, the screen says **Session complete**. Discovery results appear separately and do not change movement scoring. Average and best response times may appear for successful, uninterrupted movement rounds; they include recognition time and are game statistics, not health measurements.

Select **Play again** to return to setup.

## Troubleshooting and privacy

If the camera fails, check permission, lighting, model-loading internet access, and whether another app is using the camera. Phone camera links need HTTPS. If speech is unavailable, check volume and follow the persistent text prompts. Move only in ways that feel comfortable.

Camera frames are processed on the device. Model files are downloaded externally; voice prompt text is sent through the voice service when available. Browser speech behavior depends on the device. An accepted discovery break retrieves topic evidence through Tavily. The app includes camera cleanup on session exit; actual hardware release still needs playtest verification. Close the tab when finished if needed.
