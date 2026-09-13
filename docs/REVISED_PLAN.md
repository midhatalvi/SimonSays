# Revised implementation and audience plan

## Decision

Finish fair, recoverable play and prepared speech before adding live-content mechanics or broader commercial claims. The current implementation serves one shared interaction: choose comfortable movements, practice, listen/read, return to neutral, wait for Go, play, and recover without penalty.

## Audience hypotheses, not adoption evidence

“High usage” is an outcome to measure, not an established property of these audiences. These candidate settings have repeat-use opportunities; no usage statistics or interviews have been supplied.

| Candidate setting | Interaction needs | Implemented foundation | Evidence to collect |
|---|---|---|---|
| Adult desk workers and students taking a break | Fast repeat setup, seated movements, short sessions | Six rounds, selectable movements, pace controls | Starts without help, completion, voluntary replay and return on another day |
| Older adults playing alone or with a family member | Patient language, practice, more time, recovery | Unscored practice, relaxed pace, no elimination, repeat | Confusion, assistance needed, comfort, perceived respect, desire to return |
| Adults with limited movement on one side | Avoid inaccessible commands, no assumptions from a diagnosis | Individual left/right movement selection and Skip | Whether selected movements are actually comfortable; camera false judgments |
| Players who prefer written instructions or use low audio | Persistent text and visible state transitions | Full command, visible Go, pause/repeat | Can finish without relying on speech; comprehension and contrast review |
| Shared household play with varied skill | Reset pace and movement choices per player | Setup appears again after each session | Setup burden, handoff clarity and willingness to play together |

Invite participants across these needs without claiming their experiences are interchangeable. Begin with adults. Child/classroom and rehabilitation contexts are deferred.

## Completed engineering slice

1. Tracking validity is separate from pose match; loss cannot pass/fail the player.
2. Neutral readiness prevents carryover poses from immediately scoring; recovery pauses active time.
3. Audio preparation caches upcoming commands; requests time out and can retry after failure.
4. Practice, movement/pace selection, repeat, pause and skip support varied interaction needs.
5. Synthetic regression cases and a transparent evidence ledger accompany the build.

## Next validation gates

- On two actual devices, verify correct moves, tricks, disappearing wrists, moving out of frame, returning to neutral, repeat/resume, and camera release after a session.
- Measure audio request duration, cache hit/miss, and time from feedback end to next command audio start. Report median and slowest observed transition; do not promise 150 ms.
- Observe at least five adults spanning multiple candidate settings. This is exploratory usability work, not a representative sample.
- Record device, selected movements/pace, assistance, false judgments, completion, comfort, replay choice and optional later return. Do not collect diagnoses or camera recordings by default.
- A tracking error must not become a player penalty; any such observation blocks feature expansion.
- Choose the initial audience based on observed usefulness and return interest. Only then test whether sourced Tavily content improves replay or comprehension.

## Deferred

Automatic acceleration, near-miss scoring, clinical metrics, new full-body movements, Slack/Teams integration, live-news commands, and market-size claims. A skeleton overlay is optional explanatory UI, not proof of recognition accuracy.
