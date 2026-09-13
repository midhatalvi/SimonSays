// ============================================================================
// /vision — MediaPipe Pose Landmarker + real checkPose  (TEAMMATE OWNS THIS)
// ============================================================================

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { POSES } from "../shared/poses.js";
import { hasPoseTracking, updatePoseHold } from './poseTracking.js';

const MATCH_THRESHOLD = 0.55;
const VISIBILITY_MIN = 0.5;
const MIN_INFERENCE_INTERVAL_MS = 50; // Up to 20 fresh frames/sec, without queuing work.
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

const IDX = {
  NOSE: 0, LEFT_EAR: 7, RIGHT_EAR: 8,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14, LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_INDEX: 19, RIGHT_INDEX: 20, LEFT_THUMB: 21, RIGHT_THUMB: 22,
};

const state = {
  status: "idle", error: null, landmarker: null,
  video: null, canvas: null, ctx: null, stream: null, wrap: null, layout: null,
  latestLandmarks: null, lastTimestamp: -1, lastVideoTime: -1,
};

// Off by default so real players just see a plain mirror of themselves, not
// dots tracking their face. The test page turns this on for tuning.
let debugOverlay = false;
let generation = 0;
export function setDebugOverlay(on) {
  debugOverlay = !!on;
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const isVisible = (pt) => pt != null && Number.isFinite(pt.x) && Number.isFinite(pt.y)
  && (pt.visibility ?? 1) >= VISIBILITY_MIN && (pt.presence ?? 1) >= VISIBILITY_MIN;

function mountPreview() {
  if (state.video) return;
  const wrap = document.createElement("div");
  wrap.id = "vision-preview";
  Object.assign(wrap.style, {
    position: "fixed", overflow: "hidden",
    border: "2px solid rgba(255,255,255,0.6)",
    zIndex: 9999, background: "#000", pointerEvents: "none",
  });
  const updatePreviewLayout = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const layout = isMobile ? {
      top: "auto", right: "16px", bottom: "16px", left: "auto",
      width: "min(58vw, 320px)", height: "min(43.5vw, 240px)",
      borderRadius: "12px",
    } : {
      top: "auto", right: "24px", bottom: "24px", left: "auto",
      width: "min(32vw, 360px)", height: "min(24vw, 270px)",
      borderRadius: "12px",
    };
    for (const [property, value] of Object.entries(layout)) {
      wrap.style.setProperty(property, value, "important");
    }
  };
  updatePreviewLayout();
  state.wrap = wrap; state.layout = updatePreviewLayout;
  window.addEventListener("resize", updatePreviewLayout);
  window.addEventListener("orientationchange", updatePreviewLayout);
  const video = document.createElement("video");
  video.autoplay = true; video.playsInline = true; video.muted = true;
  Object.assign(video.style, { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" });
  const canvas = document.createElement("canvas");
  canvas.width = 640; canvas.height = 480;
  Object.assign(canvas.style, { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "scaleX(-1)" });
  wrap.appendChild(video); wrap.appendChild(canvas);
  const slot = document.getElementById("camera-preview-slot");
  if (slot) {
    window.removeEventListener("resize", updatePreviewLayout);
    window.removeEventListener("orientationchange", updatePreviewLayout);
    wrap.style.cssText = "position:relative;width:100%;height:100%;overflow:hidden;border-radius:12px;background:#000";
    slot.appendChild(wrap);
  } else document.body.appendChild(wrap);
  state.video = video; state.canvas = canvas; state.ctx = canvas.getContext("2d");
}

function drawSkeleton(landmarks) {
  const { ctx, canvas } = state;
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!debugOverlay || !landmarks) return;
  ctx.fillStyle = "#00e0a0";
  for (const lm of landmarks) {
    if (!isVisible(lm)) continue;
    ctx.beginPath();
    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

async function ensureStarted() {
  if (state.status !== "idle") return;
  state.status = "loading";
  const attempt = ++generation;
  try {
    mountPreview();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 640, height: 480 }, audio: false,
    });
    if (attempt !== generation) { stream.getTracks().forEach(t => t.stop()); return; }
    state.stream = stream;
    state.video.srcObject = stream;
    await state.video.play();

    const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);
    if (attempt !== generation) return;
    let landmarker;
    try {
      landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO", numPoses: 1,
      });
    } catch {
      landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
        runningMode: "VIDEO", numPoses: 1,
      });
    }
    if (attempt !== generation) { landmarker.close(); return; }
    state.landmarker = landmarker;
    state.status = "ready";
    requestAnimationFrame(() => detectLoop(attempt));
  } catch (err) {
    if (attempt !== generation) return;
    state.status = "error";
    state.error = err;
    console.error("[vision] failed to start camera/model:", err);
  }
}

function detectLoop(attempt) {
  if (state.status !== "ready" || attempt !== generation) return;
  const { landmarker, video } = state;
  if (video.readyState >= 2) {
    const now = performance.now();
    if (video.currentTime !== state.lastVideoTime && now - state.lastTimestamp >= MIN_INFERENCE_INTERVAL_MS) {
      state.lastVideoTime = video.currentTime;
      state.lastTimestamp = now;
      const result = landmarker.detectForVideo(video, now);
      state.latestLandmarks = result.landmarks?.[0] ?? null;
      drawSkeleton(state.latestLandmarks);
    }
  }
  requestAnimationFrame(() => detectLoop(attempt));
}

const shoulderWidth = (lm) => dist(lm[IDX.LEFT_SHOULDER], lm[IDX.RIGHT_SHOULDER]);

function handPoints(lm, side) {
  return (side === 'left' ? [15, 19, 21] : [16, 20, 22]).map(i => lm[i]).filter(isVisible);
}

function touchScore(points, anchor, scale, tolerance) {
  if (!points.length || !anchor) return 0;
  return clamp01(1 - Math.min(...points.map(p => dist(p, anchor))) / scale / tolerance);
}

function raisedHandY(lm, side) {
  const wrist = lm[side === 'left' ? IDX.LEFT_WRIST : IDX.RIGHT_WRIST];
  if (isVisible(wrist)) return wrist.y;
  const points = handPoints(lm, side);
  if (!points.length) return null;
  // Fingers sit above the wrist in an open raised hand. Offset downward so
  // merely lifting fingers at shoulder height does not count as an arm raise.
  return Math.max(...points.map(p => p.y)) + shoulderWidth(lm) * 0.12;
}

function handUpScore(lm, side) {
  const shoulder = lm[side === "left" ? IDX.LEFT_SHOULDER : IDX.RIGHT_SHOULDER];
  const handY = raisedHandY(lm, side);
  if (!isVisible(shoulder) || handY === null) return 0;
  const scale = shoulderWidth(lm) || 0.001;
  const raiseAmount = (shoulder.y - handY) / scale;
  return clamp01(raiseAmount / 0.6);
}

function headAnchor(lm) {
  const visibleEars = [lm[IDX.LEFT_EAR], lm[IDX.RIGHT_EAR]].filter(isVisible);
  if (visibleEars.length > 0) {
    return {
      x: visibleEars.reduce((s, p) => s + p.x, 0) / visibleEars.length,
      // The spoken instruction specifies the TOP of the head, above the ears.
      y: visibleEars.reduce((s, p) => s + p.y, 0) / visibleEars.length - shoulderWidth(lm) * 0.35,
    };
  }
  return isVisible(lm[IDX.NOSE]) ? { x: lm[IDX.NOSE].x, y: lm[IDX.NOSE].y - shoulderWidth(lm) * 0.45 } : null;
}

function touchHeadScore(lm) {
  const anchor = headAnchor(lm);
  if (!anchor) return 0;
  const scale = shoulderWidth(lm) || 0.001;
  const aboveFace = [...handPoints(lm, 'left'), ...handPoints(lm, 'right')]
    .filter(p => p.y <= anchor.y + scale * 0.2);
  return touchScore(aboveFace, anchor, scale, 0.85);
}

function touchNoseScore(lm) {
  const nose = lm[IDX.NOSE];
  if (!isVisible(nose)) return 0;
  const scale = shoulderWidth(lm) || 0.001;
  return touchScore([...handPoints(lm, 'left'), ...handPoints(lm, 'right')], nose, scale, 0.6);
}

function touchShouldersScore(lm) {
  const leftShoulder = lm[IDX.LEFT_SHOULDER];
  const rightShoulder = lm[IDX.RIGHT_SHOULDER];
  if (![leftShoulder, rightShoulder].every(isVisible)) return 0;
  const scale = shoulderWidth(lm) || 0.001;
  // "Touch both your shoulders" allows either crossed or uncrossed arms.
  const pairScore = (a, b) => Math.min(
    touchScore(handPoints(lm, 'left'), a, scale, 0.85),
    touchScore(handPoints(lm, 'right'), b, scale, 0.85));
  return Math.max(pairScore(rightShoulder, leftShoulder), pairScore(leftShoulder, rightShoulder));
}

function armsOutScore(lm) {
  const scale = shoulderWidth(lm) || 0.001;
  const sideScore = (shoulderIdx, elbowIdx, wristIdx) => {
    const shoulder = lm[shoulderIdx];
    if (!isVisible(shoulder)) return 0;
    const other = lm[shoulderIdx === IDX.LEFT_SHOULDER ? IDX.RIGHT_SHOULDER : IDX.LEFT_SHOULDER];
    const outward = Math.sign(shoulder.x - other.x);
    const wrist = lm[wristIdx];
    if (isVisible(wrist)) {
      const horizontal = (wrist.x - shoulder.x) * outward / scale;
      const verticalOffset = Math.abs(wrist.y - shoulder.y) / scale;
      const reach = clamp01((horizontal - 0.55) / 0.65);
      const heightBand = clamp01(1 - verticalOffset / 0.7);
      return Math.min(reach, heightBand);
    }
    const elbow = lm[elbowIdx];
    if (isVisible(elbow)) {
      const horizontal = (elbow.x - shoulder.x) * outward / scale;
      const verticalOffset = Math.abs(elbow.y - shoulder.y) / scale;
      const reach = clamp01((horizontal - 0.5) / 0.4);
      const heightBand = clamp01(1 - verticalOffset / 0.6);
      return Math.min(reach, heightBand) * 0.85;
    }
    return 0;
  };
  return Math.min(
    sideScore(IDX.LEFT_SHOULDER, IDX.LEFT_ELBOW, IDX.LEFT_WRIST),
    sideScore(IDX.RIGHT_SHOULDER, IDX.RIGHT_ELBOW, IDX.RIGHT_WRIST)
  );
}

export function scoreFor(target, lm) {
  switch (target) {
    case POSES.RIGHT_HAND_UP: return handUpScore(lm, "right");
    case POSES.LEFT_HAND_UP: return handUpScore(lm, "left");
    case POSES.BOTH_HANDS_UP: return Math.min(handUpScore(lm, "left"), handUpScore(lm, "right"));
    case POSES.TOUCH_HEAD: return touchHeadScore(lm);
    case POSES.TOUCH_NOSE: return touchNoseScore(lm);
    case POSES.TOUCH_SHOULDERS: return touchShouldersScore(lm);
    case POSES.ARMS_OUT: return armsOutScore(lm);
    default: return 0;
  }
}

export function evaluatePose(target, landmarks, aspect = 4 / 3) {
  if (!landmarks || !Number.isFinite(aspect) || aspect <= 0) return { tracking: false, confidence: 0, ready: false };
  const lm = landmarks.map(p => p && ({ ...p, x: p.x * aspect }));
  const tracking = hasPoseTracking(target, lm, isVisible) && shoulderWidth(lm) > 0.03;
  if (!tracking) return { tracking: false, confidence: 0, ready: false };
  const confidence = scoreFor(target, lm);
  // Readiness is specific to the commanded limb. An unused hand need not be
  // perfectly positioned; the target pose must still be released first.
  const sides = target === POSES.LEFT_HAND_UP ? ['left'] : target === POSES.RIGHT_HAND_UP ? ['right'] : ['left', 'right'];
  const relaxed = sides.map(side => {
    const shoulder = lm[side === 'left' ? 11 : 12];
    if (target === POSES.LEFT_HAND_UP || target === POSES.RIGHT_HAND_UP) {
      const handY = raisedHandY(lm, side);
      return handY !== null && handY >= shoulder.y - shoulderWidth(lm) * 0.05;
    }
    const points = handPoints(lm, side);
    return points.length && points.every(p => p.y >= shoulder.y - shoulderWidth(lm) * 0.05);
  });
  const oneHand = target === POSES.TOUCH_HEAD || target === POSES.TOUCH_NOSE;
  const ready = confidence < 0.35 && (oneHand ? relaxed.some(Boolean) : relaxed.every(Boolean));
  return { tracking, confidence, ready };
}

const history = new Map();

export function checkPose(target) {
  ensureStarted();
  if (state.status !== "ready" || !state.latestLandmarks) {
    state.trackingHint = state.status === 'ready' ? 'No person detected in the camera yet.' : 'Camera is starting.';
    history.delete(target);
    return { matched: false, confidence: 0, tracking: false };
  }
  // MediaPipe coordinates are normalized separately on each axis. Correct
  // their aspect ratio before comparing distances to shoulder width.
  const aspect = state.video.videoWidth / state.video.videoHeight || 4 / 3;
  const lm = state.latestLandmarks.map(p => ({ ...p, x: p.x * aspect }));
  const reading = evaluatePose(target, state.latestLandmarks, aspect);
  const tracking = performance.now() - state.lastTimestamp < 500 && reading.tracking;
  if (!tracking) {
    const names = { 0: 'nose', 11: 'left shoulder', 12: 'right shoulder', 15: 'left hand', 16: 'right hand' };
    const missing = Object.entries(names).filter(([i]) => !isVisible(lm[i])).map(([, name]) => name);
    state.trackingHint = performance.now() - state.lastTimestamp >= 500
      ? 'Camera frames stopped updating.'
      : missing.length ? `Bring into view: ${missing.join(', ')}.` : 'Face the camera so both shoulders are visible.';
    history.delete(target); return { matched: false, confidence: 0, tracking: false };
  }
  state.trackingHint = 'Movement tracking is available.';
  const rawConfidence = reading.confidence;
  const hold = updatePoseHold(history.get(target), rawConfidence, state.lastTimestamp, MATCH_THRESHOLD);
  history.set(target, hold);
  return { matched: hold.matched, confidence: rawConfidence, tracking: true, ready: reading.ready };
}

export function getVisionStatus() {
  return { status: state.status, error: state.error?.message ?? null, trackingHint: state.trackingHint };
}

export function getAllScoresDebug() {
  if (!state.latestLandmarks) return null;
  const out = {};
  for (const name of Object.values(POSES)) out[name] = evaluatePose(name, state.latestLandmarks,
    state.video.videoWidth / state.video.videoHeight || 4 / 3).confidence;
  return out;
}
export function resetPoseHistory() { history.clear(); }

export function stopVision() {
  generation++;
  state.status = "idle";
  state.stream?.getTracks().forEach(track => track.stop());
  state.landmarker?.close();
  state.wrap?.remove();
  window.removeEventListener("resize", state.layout);
  window.removeEventListener("orientationchange", state.layout);
  Object.assign(state, { stream: null, landmarker: null, video: null, canvas: null,
    ctx: null, wrap: null, layout: null, latestLandmarks: null, lastTimestamp: -1, lastVideoTime: -1, error: null });
  history.clear();
}
