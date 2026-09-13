// ============================================================================
// /engine — game state machine + round logic  (MIDHAT)
// ============================================================================
// Simon Says rules:
//   - "Simon says <action>"  -> player SHOULD do the pose.
//   - "<action>" (no Simon)  -> a trick; player should NOT do it.
// Trick rounds use a lower detection bar (FAKE_MOVE_THRESHOLD) so that starting
// the movement is caught even if it never reaches a full confident match.
// Reaction time (command -> pose) is measured for correct "Simon says" rounds.
// ============================================================================

import { POSES } from "../shared/poses.js";

const FRIENDLY = {
  RIGHT_HAND_UP: "raise your right hand",
  LEFT_HAND_UP: "raise your left hand",
  BOTH_HANDS_UP: "put both hands up",
  TOUCH_HEAD: "touch the top of your head",
  ARMS_OUT: "stretch both arms out wide",
  TOUCH_SHOULDERS: "touch both your shoulders",
  TOUCH_NOSE: "touch your nose",
};

// Command poses in rotation. BOTH_HANDS_UP is the neutral "no task" posture.
// TOUCH_SHOULDERS + TOUCH_NOSE now detected in /vision (Shravanthi) — live.
export const ACTIVE_POSES = [
  POSES.RIGHT_HAND_UP,
  POSES.LEFT_HAND_UP,
  POSES.TOUCH_HEAD,
  POSES.ARMS_OUT,
  POSES.TOUCH_SHOULDERS,
  POSES.TOUCH_NOSE,
];

const SIMON_SAYS_CHANCE = 0.65;
const FAKE_MOVE_THRESHOLD = 0.45; // lower than a full match — catch attempts on tricks

// Occasional warm lead-ins for a more human cadence.
const LEADINS = ["", "", "", "Okay... ", "Alright... ", "Let's see... "];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Build rounds mixing "Simon says" commands and tricks. Each round carries a
 * clean `promptText` (for the screen) and a `spokenText` with pauses/lead-ins
 * (for the voice).
 * @returns {import("../shared/poses.js").Round[]}
 */
export function buildRounds(count = 6, timeLimitSec = 5, poses = ACTIVE_POSES) {
  const rounds = [];
  for (let i = 0; i < count; i++) {
    const targetPose = pick(poses);
    const simonSays = Math.random() < SIMON_SAYS_CHANCE;
    const action = FRIENDLY[targetPose] || targetPose;
    const lead = pick(LEADINS);
    rounds.push({
      type: "movement",
      promptText: simonSays ? `Simon says ${action}!` : `${capitalize(action)}!`,
      // Cadence: a beat after "Simon says", and after the lead-in.
      spokenText: simonSays
        ? `${lead}Simon says... ${action}.`
        : `${lead}${capitalize(action)}.`,
      targetPose,
      simonSays,
      timeLimitSec: simonSays ? timeLimitSec : 3,
    });
  }
  return rounds;
}

const PRAISE = ["Nice work!", "You've got it!", "Beautiful!", "Look at you go!", "Perfect!"];
const PRAISE_TRICK = ["Good — you waited!", "Yes! I didn't say Simon says.", "Great listening!"];
const ENCOURAGE = ["That's okay, keep going!", "No worries, next one!", "You're doing great!"];
const ENCOURAGE_TRICK = ["Careful — I didn't say Simon says!", "Only move when Simon says!"];

/** Friendly reaction line for a result, aware of the Simon Says rule. */
export function reactionFor(passed, simonSays = true) {
  const list = passed
    ? simonSays ? PRAISE : PRAISE_TRICK
    : simonSays ? ENCOURAGE : ENCOURAGE_TRICK;
  return pick(list);
}

/**
 * Judge one round AFTER the command has been spoken/revealed. Returns
 * { passed, reactionMs }. reactionMs is the time from now (command delivered) to
 * the pose being performed — only for correct "Simon says" rounds (null else).
 * Speaking + on-screen reveal are handled by the UI so the text stays in sync
 * with the voice (no reading ahead).
 *
 * @param {import("../shared/poses.js").Round} round
 * @param {(target:string)=>{matched:boolean,confidence:number}} checkPose
 * @param {(secLeft:number)=>void} [onTick]
 */
export async function judgeRound(round, checkPose, onTick, options = {}) {
  const { signal, isPaused = () => false, onState = () => {},
    now = () => performance.now(), sleep = ms => new Promise(r => setTimeout(r, ms)),
    reset = () => {}, onReady = async () => {}, maxTrackingWaitMs = 15000 } = options;
  let activeMs = 0, previous = now(), neutralMs = 0, neutral = false;
  let lostMs = 0, interrupted = false, previousValid = false;
  reset();
  while (!signal?.aborted) {
    const time = now(), delta = Math.min(250, time - previous);
    previous = time;
    if (isPaused()) {
      onState("paused"); interrupted = true; neutral = false; neutralMs = 0;
      previousValid = false; reset();
      await sleep(100); continue;
    }
    const pose = checkPose(round.targetPose);
    if (pose.tracking !== true) {
      lostMs += delta; interrupted = true; neutral = false; neutralMs = 0;
      previousValid = false; reset(); onState("tracking-lost");
      if (lostMs >= maxTrackingWaitMs) return { passed: null, reactionMs: null, reason: "tracking-timeout" };
      await sleep(100); continue;
    }
    if (!neutral) {
      // Count all time waiting for reliable readiness, including intermittent
      // tracking. A single visible frame must not restart this deadline.
      lostMs += delta;
      if (lostMs >= maxTrackingWaitMs)
        return { passed: null, reactionMs: null, reason: 'readiness-timeout' };
      onState("neutral");
      neutralMs = (pose.ready ?? pose.confidence < 0.25) ? neutralMs + (previousValid ? delta : 0) : 0;
      previousValid = true;
      if (neutralMs >= 400) {
        // Establish readiness BEFORE revealing the instruction. Otherwise a
        // player who follows the spoken command immediately is stuck here.
        await onReady();
        if (signal?.aborted) break;
        neutral = true; lostMs = 0; reset(); previousValid = false; previous = now();
      }
      await sleep(100); continue;
    }
    onState("active");
    if (previousValid) activeMs += delta;
    previousValid = true;
    onTick?.(Math.max(0, Math.ceil(round.timeLimitSec - activeMs / 1000)));
    if (round.simonSays && pose.matched)
      return { passed: true, reactionMs: interrupted ? null : activeMs, reason: "matched" };
    if (!round.simonSays && pose.confidence >= FAKE_MOVE_THRESHOLD)
      return { passed: false, reactionMs: null, reason: "trick-move" };
    if (activeMs >= round.timeLimitSec * 1000)
      return { passed: !round.simonSays, reactionMs: null, reason: "window-ended" };
    await sleep(100);
  }
  return { passed: null, reactionMs: null, reason: "cancelled" };
}
