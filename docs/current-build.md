# Current local build

Based on main `44827c0`, including merged PR #1. This follow-up review combines the redesign with the movement and flow corrections below.

The user requested the original three-life rules, up to six rounds, no practice, and a default-enabled optional Tavily discovery break after round three. Skips and unavailable tracking do not cost lives. Three failed rounds end the game. Discovery answers never change movement scoring.

Readiness precedes instruction delivery and uses visible hands below shoulder height. Older detector mocks still use confidence-based readiness. Ten seconds without reliable readiness ends the session and releases the camera, including when intermittent visible frames alternate with tracking loss. A valid but ambiguous posture cannot wait indefinitely. Pausing intentionally suspends judging. The response clock starts after bounded instruction speech, so service latency does not consume the player's selected time.

Speech requests have an 1800 ms timeout before browser fallback. Each spoken line has an overall eight-second deadline, including fetching and playback. Persistent text remains available. This deadline can truncate a long line; speech is supplementary to the visible instructions.

Local Vite now serves the existing API handlers; `.env.local` keys remain server-side and are excluded from version control. The authenticated local Tavily endpoint returned a NASA-supported question. ElevenLabs still uses browser fallback locally; its authenticated service remains unverified.

Regression coverage includes ambiguous readiness, intermittent tracking, speech that never finishes, lives, skipped rounds, and source validation. Automated and simulated checks do not establish webcam accuracy, phone performance, or successful authenticated API access.

Observed this session: the simulated browser flow reached discovery, accepted A, resumed movement, and ended with zero lives and a separate discovery score. Real webcam sessions connected but ended during readiness or failed to recognize a nose touch; these prompted the recognition corrections below. A successful real playthrough remains unverified.

See this document for local behavior; upstream architecture/player guides describe the older review revision.

## Movement recognition correction

Touch detection now considers visible index/thumb landmarks and wrists. Head touch targets above the ears (or above the nose when ears are unavailable). Shoulder touch accepts distinct crossed or uncrossed hand pairs. Arms-out checks outward direction rather than absolute distance. Readiness checks the commanded limb and requires release of the target pose. Physical geometry is tested at different aspect ratios with missing points and wrong-pose cases.

52 automated tests pass. These include all six selectable movements, but remain synthetic geometry and lifecycle tests. The focused real retest reported both hands out of tracking before reaching a command; it does not establish successful live nose-touch recognition. Tavily has separately returned a live NASA-supported question with the locally configured server key. API shape and original three-life movement rules are preserved.
