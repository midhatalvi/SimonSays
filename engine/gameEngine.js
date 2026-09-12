// ============================================================================
// /engine — game state machine + round logic  (MIDHAT)
// ============================================================================
// Owns the real-time loop: pick a round, issue a command, poll the detector
// during a time window, score pass/fail, advance. UI subscribes for updates;
// voice is called via callbacks so the engine stays free of I/O details.
// ============================================================================

import { POSE_NAMES } from "../shared/poses.js";

const FRIENDLY = {
  RIGHT_HAND_UP: "Raise your right hand!",
  LEFT_HAND_UP: "Raise your left hand!",
  BOTH_HANDS_UP: "Put both hands up!",
  TOUCH_HEAD: "Touch the top of your head!",
  ARMS_OUT: "Stretch both arms out wide!",
};

const PRAISE = [
  "Nice work!",
  "You've got it!",
  "Beautiful!",
  "Look at you go!",
  "Perfect!",
];
const ENCOURAGE = [
  "That's okay, keep going!",
  "No worries, next one!",
  "Nice try, here comes another!",
  "You're doing great, stay with me!",
];

/** Pick a friendly reaction line for a pass/fail result. */
export function reactionFor(passed) {
  const list = passed ? PRAISE : ENCOURAGE;
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Build a list of movement rounds. Trivia rounds (from /content) can be mixed
 * in later — the loop already handles round.type.
 * @returns {import("../shared/poses.js").Round[]}
 */
export function buildRounds(count = 6, timeLimitSec = 5) {
  const rounds = [];
  for (let i = 0; i < count; i++) {
    const targetPose = POSE_NAMES[Math.floor(Math.random() * POSE_NAMES.length)];
    rounds.push({
      type: "movement",
      promptText: FRIENDLY[targetPose] || targetPose,
      targetPose,
      timeLimitSec,
    });
  }
  return rounds;
}

/**
 * Run one movement round: speak the prompt, poll checkPose until matched or the
 * time window expires. Resolves with { passed, confidence }.
 *
 * @param {import("../shared/poses.js").Round} round
 * @param {(target:string)=>{matched:boolean,confidence:number}} checkPose
 * @param {(text:string)=>Promise<void>|void} say  speak a line (voice)
 * @param {(secLeft:number)=>void} [onTick]  optional countdown hook for UI
 */
export async function runRound(round, checkPose, say, onTick) {
  await say(round.promptText);

  if (round.type !== "movement" || !round.targetPose) {
    // Trivia handling lives with /content; treat as a pass for now.
    return { passed: true, confidence: 1 };
  }

  const deadline = Date.now() + round.timeLimitSec * 1000;
  let best = 0;

  return new Promise((resolve) => {
    const tick = () => {
      const msLeft = deadline - Date.now();
      if (onTick) onTick(Math.max(0, Math.ceil(msLeft / 1000)));

      const { matched, confidence } = checkPose(round.targetPose);
      if (confidence > best) best = confidence;

      if (matched) {
        resolve({ passed: true, confidence });
        return;
      }
      if (msLeft <= 0) {
        resolve({ passed: false, confidence: best });
        return;
      }
      setTimeout(tick, 250);
    };
    tick();
  });
}
