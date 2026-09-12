// ============================================================================
// /vision — MediaPipe Pose Landmarker + real checkPose  (TEAMMATE OWNS THIS)
// ============================================================================
// Runs @mediapipe/tasks-vision in the browser, on-device. Reads the camera and
// decides whether the user is holding the target pose.
//
// Honor the shared contract:
//   import { POSES } from "../shared/poses.js";
//   checkPose(target) => { matched: boolean, confidence: number }  // 0..1
//
// Build/test this on a standalone page (camera + buttons that print checkPose
// results) — you do NOT need the game to develop this.
//
// The engine currently uses a FAKE checkPose (see /engine/fakeCheckPose.js).
// When this real one is ready, the engine swaps it in with one import change.
// ============================================================================

import { POSES } from "../shared/poses.js";

/**
 * TODO(teammate): initialize the Pose Landmarker once, keep a video element +
 * detection loop, and implement the pose checks below against the latest
 * landmarks.
 *
 * @param {string} target one of the POSES values
 * @returns {{ matched: boolean, confidence: number }}
 */
export function checkPose(target) {
  // Not implemented yet — placeholder so imports resolve.
  // Return "no match" until the detector is wired up.
  void target;
  void POSES;
  return { matched: false, confidence: 0 };
}
