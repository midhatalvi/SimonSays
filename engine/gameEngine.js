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
// Add TOUCH_SHOULDERS / TOUCH_NOSE once /vision (Shravanthi) implements them.
export const ACTIVE_POSES = [
  POSES.RIGHT_HAND_UP,
  POSES.LEFT_HAND_UP,
  POSES.TOUCH_HEAD,
  POSES.ARMS_OUT,
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
export function buildRounds(count = 6, timeLimitSec = 5) {
  const rounds = [];
  for (let i = 0; i < count; i++) {
    const targetPose = pick(ACTIVE_POSES);
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
export async function judgeRound(round, checkPose, onTick) {
  if (round.type !== "movement" || !round.targetPose) {
    return { passed: true, reactionMs: null };
  }

  const t0 = Date.now();
  const deadline = t0 + round.timeLimitSec * 1000;

  return new Promise((resolve) => {
    const tick = () => {
      const msLeft = deadline - Date.now();
      if (onTick) onTick(Math.max(0, Math.ceil(msLeft / 1000)));

      const { matched, confidence } = checkPose(round.targetPose);

      if (round.simonSays) {
        if (matched) return resolve({ passed: true, reactionMs: Date.now() - t0 });
        if (msLeft <= 0) return resolve({ passed: false, reactionMs: null });
      } else {
        // Trick: any real attempt at the pose is a miss.
        if (confidence >= FAKE_MOVE_THRESHOLD) return resolve({ passed: false, reactionMs: null });
        if (msLeft <= 0) return resolve({ passed: true, reactionMs: null });
      }
      setTimeout(tick, 200);
    };
    tick();
  });
}
