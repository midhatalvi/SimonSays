# Live playtest

[Documentation](README.md) · [Player guide](player-guide.md) · [Validation evidence](EVIDENCE_CASES.md)

Use this checklist for a real person and camera. The goal is to find where the current experience fails, not to coach the player into a pass.

## Prepare

- Use the current review build and record its commit.
- Start on a laptop at localhost or a phone over HTTPS.
- Use even front lighting and keep head, shoulders, and hands visible.
- Begin with **Comfortable — 8 seconds** and discovery enabled.
- Let the player grant camera permission and choose comfortable movements.

## Acceptance sequence

1. Confirm the player understands “move only when Simon says.”
2. Complete one correct Simon Says round for every selected movement.
3. Stay still through a trick round.
4. Intentionally move on one trick and confirm exactly one life is lost.
5. Pause, repeat the instruction, resume, and confirm the active time was preserved.
6. Skip one round and confirm no life is lost and the round is unscored.
7. Choose Animals and accept discovery after round 2. Confirm a fact and source appear, narration finishes, and **Let’s move** leads to a themed round 3 using a selected pose. Complete that move. After the movement rounds, answer the recall question about the same fact; confirm the source remains visible and a wrong answer costs no life.
8. Finish or use all three lives; confirm movement and discovery results remain separate.
9. Play again and confirm the camera reconnects.

Also decline the midpoint offer and verify no `/api/tavily` request occurs. With search unavailable, confirm **Curated discovery** appears and the same fact → movement → recall loop finishes. Synthetic detector input verifies UI sequencing only; it does not establish real-camera recognition or live ElevenLabs playback.
10. End the session and confirm the browser camera indicator turns off.

Repeat the movement cases for left/right hand up, head, nose, shoulders, and arms out. Include crossed and uncrossed shoulder touches if comfortable.

## Record

```text
Commit:
Date:
Device and browser:
Camera position and lighting:
Selected movements and pace:
Completed without coaching:
Correct moves missed by the app:
Wrong moves accepted by the app:
Tracking hints shown:
Pause / repeat / skip result:
Discovery result and source:
Camera released after exit:
Voice source (ElevenLabs / browser / none):
Player’s words about clarity and comfort:
Change justified by this session:
```

Stop any movement that feels uncomfortable. One successful session is evidence for that device and context only; it does not establish broad accessibility or benefit.
