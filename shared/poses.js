// ============================================================================
// /shared — LOCKED CONTRACTS. Co-owned by both teammates.
// Do NOT change anything in this file without agreeing first, then update
// CLAUDE.md in the SAME commit. Changing these breaks the other person's code.
// ============================================================================

// --- Pose names (fixed set) -------------------------------------------------
// The only valid values for a movement round's targetPose and for checkPose().
export const POSES = {
  RIGHT_HAND_UP: "RIGHT_HAND_UP",
  LEFT_HAND_UP: "LEFT_HAND_UP",
  BOTH_HANDS_UP: "BOTH_HANDS_UP",
  TOUCH_HEAD: "TOUCH_HEAD",
  ARMS_OUT: "ARMS_OUT",
};

// Convenience array (e.g. for the engine to pick a random pose).
export const POSE_NAMES = Object.values(POSES);

// --- Detector interface -----------------------------------------------------
/**
 * checkPose(target) — returns whether the current camera pose matches target.
 * Implemented for real in /vision (teammate). The engine uses a fake version
 * in /engine until the real one is ready, then swaps it in (one line).
 *
 * @typedef {Object} PoseResult
 * @property {boolean} matched      True if the user is holding the target pose.
 * @property {number}  confidence   0..1 confidence.
 *
 * @callback CheckPose
 * @param {string} target  One of POSE_NAMES.
 * @returns {PoseResult}
 */

// --- Round object -----------------------------------------------------------
/**
 * A single round the engine issues.
 *
 * @typedef {Object} Round
 * @property {"movement"|"trivia"} type        movement = pose game, trivia = Tavily.
 * @property {string}              promptText   What the voice says / screen shows.
 * @property {string|null}         targetPose   A POSE name for movement, null for trivia.
 * @property {number}              timeLimitSec Time window for the round.
 */

export {};
