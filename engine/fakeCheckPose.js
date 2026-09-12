// ============================================================================
// /engine — fake checkPose  (MIDHAT)
// ============================================================================
// Lets the engine + UI + voice be built without waiting on /vision.
// Returns random pass/fail, honoring the shared contract shape.
// Swap for the real detector at integration:
//   import { checkPose } from "../vision/checkPose.js";
// ============================================================================

/**
 * @param {string} target one of POSE_NAMES
 * @returns {{ matched: boolean, confidence: number }}
 */
export function checkPose(target) {
  void target;
  const confidence = Math.random();
  return { matched: confidence > 0.4, confidence };
}
