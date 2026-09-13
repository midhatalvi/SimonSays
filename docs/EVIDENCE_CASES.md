# Evidence ledger and example cases

## Evidence already available

Source: repository reviewed at baseline `c4dfe4f2a4d5891c5f21d8acb75409b4f52c15ce`. Confirm the actual checkout base with git history if applying this patch elsewhere.

- Code observation: missing landmarks returned confidence zero; trick rounds treated low confidence until timeout as success. This motivates E01/E02. This was a static finding, not an observed participant incident.
- Code observation: shoulder-width normalization and an optional landmark overlay already existed. They are not new accomplishments in this revision.
- Code observation: sequential speech fetching and deliberate per-round waits existed. These support testing prefetch; they do not establish a measured delay.
- Browser observation: original landing page used a warm character and large play button. No original camera session or participant study was completed.
- Public competitor posts described AgentLedger and RHOast My Spend. Sean's encouraging comments are evidence of engagement with posts, not judging scores or user demand for Simon Says.
  - https://www.linkedin.com/feed/update/urn:li:activity:7504775830904930304/
  - https://www.linkedin.com/feed/update/urn:li:activity:7504753528502927360/

## Executable synthetic examples

Run `npm test`. Inputs are fabricated detector traces or mocked network responses. They demonstrate engine/cache behavior only; they are not recordings of people or evidence of health outcomes.

| ID | Example situation | Expected outcome | Automated coverage |
|---|---|---|---|
| E01 | Player is absent during a trick round | No score, never a pass | missing tracking cannot pass a trick round |
| E02 | Player cannot be tracked during a movement | No penalty | loss of tracking cannot fail a movement round |
| E03 | Player already holds the requested pose | Must relax before scoring can start | held-over pose must return to neutral |
| E04 | Visible player stays neutral on a trick | Pass after the full active window | visible still player passes |
| E05 | Visible player performs the trick pose after Go | Fail normally | moving on trick fails |
| E06 | Tracking returns after interruption | Neutral readiness required; timing metric excluded | tracking recovery |
| E07 | Player pauses to rest | No active time consumed while paused | pause consumes no response-window time |
| E08 | Player skips or session is cancelled | No score | abort ends round without score |
| E09 | Upcoming command is prepared and then requested again | One network request | preloading and playback share one request |
| E10 | Voice request fails transiently | A later request can succeed | temporary speech failure is retryable |
| E11 | Voice request hangs | Timeout permits browser fallback path | speech request timeout releases caller |

## Browser checks performed

Updated setup loads in Chrome at localhost. Deselecting every movement visibly disables Start practice and displays an instruction to choose one. Desktop layout inspected. Camera play, mobile layout, live ElevenLabs audio and full playback fallback remain unverified.

## Example participant worksheet — blank, not fabricated evidence

Case: an adult desk worker chooses left-hand-only play at relaxed pace. During round two their wrist leaves the camera view. They reposition, repeat the instruction, resume, and finish.

Expected: timer pauses; no point/life penalty; recovery asks for neutral; instruction persists; participant can finish without assistance.

Actual observation: NOT COLLECTED.
Device / browser: ___
Assistance needed: ___
False judgments (with round context): ___
Comfort and clarity, in participant's own words: ___
Completed / replayed / returned later: ___
Observer notes and follow-up change: ___

Repeat this worksheet for an older adult with a family member, a player using written instructions, and a player selecting limited movements. Do not invent quotes, test participants, numerical improvements, or proof of demand.

## Follow-up verification

- 17 automated tests now cover mid-round tracking loss, held-pose rejection, prepared audio completion, playback-rejection fallback, pre-cancelled speech and active playback cancellation. Audio/browser interfaces in those tests are mocks.
- Chrome browser verification used the actual GameScreen and ScoreScreen through `?lab`, with explicitly labeled synthetic detector input and simulated speech. Confirmed tracking-lost message, repeat staying paused, neutral readiness after recovery, visible Go, pause preserving the command/countdown, and skip from pause.
- Completed an all-skipped browser session: score 0, scored total 0, played rounds 6, unscored 6. The recap correctly said no rounds were scored; the injected detector's stop method was called. This does not establish physical webcam release.
- Inspected the game at 390×844 viewport. Compact mascot and sticky controls keep the instruction/recovery flow usable at this width. Inspected setup at the same width and selected the 12-second pace. This is responsive emulation, not an actual phone trial.
- Fixed preview placement: the actual camera now mounts inside its reserved layout slot instead of floating over controls. Its populated layout still needs a real-camera check.
- Fixed the zero-score spoken recap and added cancellation when leaving the result screen.
- The synthetic verification module is development-only and excluded from the production JS build.
- Real-camera recognition, live ElevenLabs playback/latency, physical-device diversity and participant usefulness remain NOT TESTED. See FIRST_PLAYTEST.md.

## Review-branch browser verification (2026-09-13)

Using the development-only `?lab` harness and synthetic detector/speech inputs:
- Completed practice, selected Practice again, and verified a second unscored practice attempt.
- Skipped practice and explicitly selected I’m ready to enter round 1.
- Injected missing tracking and observed the camera-loss/timer-paused message.
- Repeated the instruction and observed the round stay paused with Resume available.
- Ended the session while paused and observed return to setup and Detector released: Yes.

These are browser interaction checks, not real-camera accuracy or live ElevenLabs latency measurements. Real participants and device coverage remain pending in FIRST_PLAYTEST.md.

## Learn & Move validation

Added automated cases for source/domain requirements, unsafe citation URLs, answer shuffling, exclusive vs ambiguous gesture selection, missing tracking, neutral readiness, missing API configuration, and partial upstream failure.

Chrome synthetic learning example completed practice A and B, answered the question incorrectly, showed the correct answer and citation excerpt/link, then showed 0 correct from 1 answered. Both practice answers were excluded. This uses fixtures, not live search or real camera input.

Live Tavily retrieval depends on the deployment key. Evidence matching uses reviewed topic templates; it is not semantic fact-checking or arbitrary question generation. Four question templates (two per topic) are the current coverage. Participant validation and real-device gesture accuracy remain pending.
