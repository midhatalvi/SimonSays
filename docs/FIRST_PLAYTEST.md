# First observed playtest

> Version scope: this guide describes review branch `improve/review-ready-interactions` at `814f65c`. The application on `main` is still the earlier build; use the review branch to follow this guide.

[Home](../README.md) · [Developer guide](development.md) · [Project story](project-story.md)

Status: READY TO RUN — no participant results collected.

## This laptop

Run the development server and open the localhost URL it prints (normally http://localhost:5174/). Choose only comfortable movements. Start with Relaxed (12 seconds). The player should press Play with Simon and respond to the browser's camera prompt themselves. No microphone access is needed.

This local Vite preview uses browser speech fallback because it does not serve the ElevenLabs API. It does not validate live ElevenLabs latency. To validate ElevenLabs, use an HTTPS deployment of this branch with the server-side key configured; the existing public demo has not been updated.

For a phone, use an HTTPS preview of the updated branch. A phone cannot use this laptop's localhost address. A narrow desktop viewport test is not a real-phone test.

## Five-minute sequence

1. Without coaching, ask the player to choose comfortable movements and a pace. Record where they hesitate.
2. Complete practice. Ask: “When do you think the game starts judging your move?” Correct understanding is after returning to neutral and seeing Go.
3. During a scored round, let a required hand briefly leave the camera view. Check that the timer pauses, no penalty is issued, and returning to neutral allows resuming. If the detector does not actually lose tracking, record that instead of assuming this case was tested.
4. Pause, repeat the instruction, then resume. Check that the instruction stays visible and repeat does not resume automatically.
5. Skip a round. Check that it is excluded from the scored-round total.
6. Finish. Confirm the camera indicator turns off. Ask whether the player wants another session and why.

Stop any movement that feels uncomfortable. Do not instruct a participant to use a movement they excluded.

## Record only actual observations

Participant alias: ___  Date: ___  Device/browser: ___
Context (desk break / shared family play / another context): ___
Selected movements and pace: ___
Started without help? ___
Understood neutral and Go? ___
False judgments (what happened vs. what the game reported): ___
Tracking-loss recovery observed? ___
Pause/repeat/skip clear? ___
Camera stopped at the end? ___
Voice source (browser / ElevenLabs / unknown): ___
Noticeable silent gaps and when: ___
Comfort and tone, participant's exact words if offered: ___
Finished? ___ Voluntary replay? ___ Optional return on another day? ___
Next change justified by this observation: ___

A passed session does not establish population-wide accessibility or health benefits. Use several adults across different needs to guide the next revision, not to manufacture an adoption statistic.

Before scored play, ask participants to try Practice again and then choose I’m ready. Confirm they can end a session to change movements. Record whether they understood the readiness choice without prompting.
