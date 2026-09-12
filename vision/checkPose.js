// ============================================================================
// /vision — MediaPipe Pose Landmarker + real checkPose  (TEAMMATE OWNS THIS)
// ============================================================================
// checkPose is SYNCHRONOUS on purpose — the engine polls it every 250ms with
// no await. All async setup (camera + model load) happens lazily in the
// background on first call; until ready we return "no match", same shape as
// the fake.
//
// No <video> element exists anywhere in /ui, so this mounts its own small
// floating camera preview + skeleton overlay via plain DOM calls, outside
// React. Tell Midhat this exists so it isn't a surprise on-screen.
// ============================================================================

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { POSES } from "../shared/poses.js";

const MATCH_THRESHOLD = 0.55; // confidence needed to count as a match
const VISIBILITY_MIN = 0.5;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

const IDX = {
  NOSE: 0, LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14, LEFT_WRIST: 15, RIGHT_WRIST: 16,
};

const state = {
  status: "idle", error: null, landmarker: null,
  video: null, canvas: null, ctx: null,
  latestLandmarks: null, lastTimestamp: -1,
};

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const isVisible = (pt) => pt != null && (pt.visibility ?? 1) >= VISIBILITY_MIN;

function mountPreview() {
  if (state.video) return;
  const wrap = document.createElement("div");
  wrap.id = "vision-preview";
  Object.assign(wrap.style, {
    position: "fixed", bottom: "12px", right: "12px",
    width: "160px", height: "120px", borderRadius: "12px",
    overflow: "hidden", border: "2px solid rgba(255,255,255,0.6)",
    zIndex: 9999, background: "#000",
  });

  const video = document.createElement("video");
  video.autoplay = true; video.playsInline = true; video.muted = true;
  Object.assign(video.style, {
    width: "100%", height: "100%", objectFit: "cover",
    transform: "scaleX(-1)",
  });

  const canvas = document.createElement("canvas");
  canvas.width = 160; canvas.height = 120;
  Object.assign(canvas.style, {
    position: "absolute", top: 0, left: 0,
    width: "100%", height: "100%", transform: "scaleX(-1)",
  });

  wrap.appendChild(video); wrap.appendChild(canvas);
  document.body.appendChild(wrap);
  state.video = video; state.canvas = canvas; state.ctx = canvas.getContext("2d");
}

function drawSkeleton(landmarks) {
  const { ctx, canvas } = state;
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks) return;
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
  try {
    mountPreview();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 640, height: 480 }, audio: false,
    });
    state.video.srcObject = stream;
    await state.video.play();

    const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);
    let landmarker;
    try {
      landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO", numPoses: 1,
      });
    } catch {
      // Some phones/browsers reject the GPU delegate. Fall back to CPU.
      landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
        runningMode: "VIDEO", numPoses: 1,
      });
    }
    state.landmarker = landmarker;
    state.status = "ready";
    requestAnimationFrame(detectLoop);
  } catch (err) {
    state.status = "error";
    state.error = err;
    console.error("[vision] failed to start camera/model:", err);
  }
}

function detectLoop() {
  if (state.status !== "ready") return;
  const { landmarker, video } = state;
  if (video.readyState >= 2) {
    const now = performance.now();
    if (now > state.lastTimestamp) {
      state.lastTimestamp = now;
      const result = landmarker.detectForVideo(video, now);
      state.latestLandmarks = result.landmarks?.[0] ?? null;
      drawSkeleton(state.latestLandmarks);
    }
  }
  requestAnimationFrame(detectLoop);
}

// Thresholds are relative to shoulder width, not pixels, and shoulder width
// is used (not torso height) because on a laptop webcam an elderly user's
// hips are very often out of frame.
const shoulderWidth = (lm) => dist(lm[IDX.LEFT_SHOULDER], lm[IDX.RIGHT_SHOULDER]);

function handUpScore(lm, side) {
  const shoulder = lm[side === "left" ? IDX.LEFT_SHOULDER : IDX.RIGHT_SHOULDER];
  const wrist = lm[side === "left" ? IDX.LEFT_WRIST : IDX.RIGHT_WRIST];
  if (!isVisible(shoulder) || !isVisible(wrist)) return 0;
  const scale = shoulderWidth(lm) || 0.001;
  const raiseAmount = (shoulder.y - wrist.y) / scale; // y grows downward
  return clamp01(raiseAmount / 0.6);
}

function touchHeadScore(lm) {
  const nose = lm[IDX.NOSE];
  if (!isVisible(nose)) return 0;
  const scale = shoulderWidth(lm) || 0.001;
  const candidates = [lm[IDX.LEFT_WRIST], lm[IDX.RIGHT_WRIST]]
    .filter(isVisible).map((w) => dist(w, nose) / scale);
  if (candidates.length === 0) return 0;
  return clamp01(1 - Math.min(...candidates) / 0.9);
}

function armsOutScore(lm) {
  const scale = shoulderWidth(lm) || 0.001;
  const sideScore = (shoulderIdx, wristIdx) => {
    const shoulder = lm[shoulderIdx], wrist = lm[wristIdx];
    if (!isVisible(shoulder) || !isVisible(wrist)) return 0;
    const horizontal = Math.abs(wrist.x - shoulder.x) / scale;
    const verticalOffset = Math.abs(wrist.y - shoulder.y) / scale;
    const reach = clamp01((horizontal - 0.8) / 0.6);
    const heightBand = clamp01(1 - verticalOffset / 0.7);
    return Math.min(reach, heightBand);
  };
  return Math.min(
    sideScore(IDX.LEFT_SHOULDER, IDX.LEFT_WRIST),
    sideScore(IDX.RIGHT_SHOULDER, IDX.RIGHT_WRIST)
  );
}

function scoreFor(target, lm) {
  switch (target) {
    case POSES.RIGHT_HAND_UP: return handUpScore(lm, "right");
    case POSES.LEFT_HAND_UP: return handUpScore(lm, "left");
    case POSES.BOTH_HANDS_UP: return Math.min(handUpScore(lm, "left"), handUpScore(lm, "right"));
    case POSES.TOUCH_HEAD: return touchHeadScore(lm);
    case POSES.ARMS_OUT: return armsOutScore(lm);
    default: return 0;
  }
}

export function checkPose(target) {
  ensureStarted(); // fire-and-forget; no-op after the first call
  if (state.status !== "ready" || !state.latestLandmarks) {
    return { matched: false, confidence: 0 };
  }
  const confidence = scoreFor(target, state.latestLandmarks);
  return { matched: confidence >= MATCH_THRESHOLD, confidence };
}

export function getVisionStatus() {
  return { status: state.status, error: state.error?.message ?? null };
}

export function getAllScoresDebug() {
  if (!state.latestLandmarks) return null;
  const out = {};
  for (const name of Object.values(POSES)) out[name] = scoreFor(name, state.latestLandmarks);
  return out;
}