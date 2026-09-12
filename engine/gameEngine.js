// ============================================================================
// /engine — game state machine + round logic  (MIDHAT)
// ============================================================================
// Real Simon Says rules:
//   - "Simon says <action>"  -> the player SHOULD do the pose.
//   - "<action>" (no Simon)  -> a trick; the player should NOT do it and just
//     keep their hands showing / stay neutral.
// Scoring the trick rounds needs no new detection: we simply check that the
// commanded pose is NOT performed during the window.
// ============================================================================

import { POSES } from "../shared/poses.js";

// Action phrasing (lower-case; prompt builder capitalizes / prefixes as needed).
const FRIENDLY = {
  RIGHT_HAND_UP: "raise your right hand",
  LEFT_HAND_UP: "raise your left hand",
  BOTH_HANDS_UP: "put both hands up",
  TOUCH_HEAD: "touch the top of your head",
  ARMS_OUT: "stretch both arms out wide",
  TOUCH_SHOULDERS: "touch both your shoulders",
  TOUCH_NOSE: "touch your nose",
};

// Poses the /vision detector can currently score AND that we use as commands.
// NOTE: BOTH_HANDS_UP is intentionally NOT a command — "both hands out" is the
// neutral "I'm not doing it" posture for trick rounds.
// Add TOUCH_SHOULDERS / TOUCH_NOSE here once Shravanthi implements their
// detection in /vision — until then they'd always fail.
export const ACTIVE_POSES = [
  POSES.RIGHT_HAND_UP,
  POSES.LEFT_HAND_UP,
  POSES.TOUCH_HEAD,
  POSES.ARMS_OUT,
];

// Chance a round is a real "Simon says" command (the rest are tricks).
const SIMON_SAYS_CHANCE = 0.65;

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Build a list of movement rounds mixing "Simon says" commands and tricks.
 * @returns {import("../shared/poses.js").Round[]}
 */
export function buildRounds(count = 6, timeLimitSec = 5) {
  const rounds = [];
  for (let i = 0; i < count; i++) {
    const targetPose = ACTIVE_POSES[Math.floor(Math.random() * ACTIVE_POSES.length)];
    const simonSays = Math.random() < SIMON_SAYS_CHANCE;
    const action = FRIENDLY[targetPose] || targetPose;
    const promptText = simonSays ? `Simon says ${action}!` : `${capitalize(action)}!`;
    rounds.push({
      type: "movement",
      promptText,
      targetPose,
      simonSays,
      // Tricks resolve fast (player just has to not move); commands give more time.
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
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Run one round. For a "Simon says" round the player must perform the pose; for
 * a trick they must NOT. Resolves { passed }.
 *
 * @param {import("../shared/poses.js").Round} round
 * @param {(target:string)=>{matched:boolean,confidence:number}} checkPose
 * @param {(text:string)=>Promise<void>|void} say
 * @param {(secLeft:number)=>void} [onTick]
 */
export async function runRound(round, checkPose, say, onTick) {
  await say(round.promptText);

  if (round.type !== "movement" || !round.targetPose) {
    return { passed: true };
  }

  const deadline = Date.now() + round.timeLimitSec * 1000;

  return new Promise((resolve) => {
    const tick = () => {
      const msLeft = deadline - Date.now();
      if (onTick) onTick(Math.max(0, Math.ceil(msLeft / 1000)));

      const { matched } = checkPose(round.targetPose);

      if (round.simonSays) {
        if (matched) return resolve({ passed: true });      // did it — good
        if (msLeft <= 0) return resolve({ passed: false });  // ran out of time
      } else {
        if (matched) return resolve({ passed: false });      // did it — trick!
        if (msLeft <= 0) return resolve({ passed: true });   // resisted — good
      }
      setTimeout(tick, 250);
    };
    tick();
  });
}
