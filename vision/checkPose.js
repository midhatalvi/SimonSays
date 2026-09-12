// ============================================================================
// /vision — MediaPipe Pose Landmarker + real checkPose  (TEAMMATE OWNS THIS)
// ============================================================================

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { POSES } from "../shared/poses.js";

const MATCH_THRESHOLD = 0.55;
const VISIBILITY_MIN = 0.5;
const MIN_INFERENCE_INTERVAL_MS = 80; // cap model calls to ~12fps; engine only polls every 250ms
const HOLD_WINDOW_MS = 500; // require the pose to be held this long before counting as matched
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

const IDX = {
  NOSE: 0, LEFT_EAR: 7, RIGHT_EAR: 8,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14, LEFT_WRIST: 15, RIGHT_WRIST: 16,
};

const state = {
  status: "idle", error: null, landmarker: null,
  video: null, canvas: null, ctx: null,
  latestLandmarks: null, lastTimestamp: -1,
};

// Off by default so real players just see a plain mirror of themselves, not
// dots tracking their face. The test page turns this on for tuning.
let debugOverlay = false;
export function setDebugOverlay(on) {
  debugOverlay = !!on;
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const isVisible = (pt) => pt != null && (pt.visibility ?? 1) >= VISIBILITY_MIN;

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
  window.addEventListener("resize", updatePreviewLayout);
  window.addEventListener("orientationchange", updatePreviewLayout);
  const video = document.createElement("video");
  video.autoplay = true; video.playsInline = true; video.muted = true;
  Object.assign(video.style, { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" });
  const canvas = document.createElement("canvas");
  canvas.width = 640; canvas.height = 480;
  Object.assign(canvas.style, { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "scaleX(-1)" });
  wrap.appendChild(video); wrap.appendChild(canvas);
  document.body.appendChild(wrap);
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
    if (now - state.lastTimestamp >= MIN_INFERENCE_INTERVAL_MS) {
      state.lastTimestamp = now;
      const result = landmarker.detectForVideo(video, now);
      state.latestLandmarks = result.landmarks?.[0] ?? null;
      drawSkeleton(state.latestLandmarks);
    }
  }
  requestAnimationFrame(detectLoop);
}

const shoulderWidth = (lm) => dist(lm[IDX.LEFT_SHOULDER], lm[IDX.RIGHT_SHOULDER]);

function handUpScore(lm, side) {
  const shoulder = lm[side === "left" ? IDX.LEFT_SHOULDER : IDX.RIGHT_SHOULDER];
  const wrist = lm[side === "left" ? IDX.LEFT_WRIST : IDX.RIGHT_WRIST];
  if (!isVisible(shoulder) || !isVisible(wrist)) return 0;
  const scale = shoulderWidth(lm) || 0.001;
  const raiseAmount = (shoulder.y - wrist.y) / scale;
  return clamp01(raiseAmount / 0.6);
}

function headAnchor(lm) {
  const visibleEars = [lm[IDX.LEFT_EAR], lm[IDX.RIGHT_EAR]].filter(isVisible);
  if (visibleEars.length > 0) {
    return {
      x: visibleEars.reduce((s, p) => s + p.x, 0) / visibleEars.length,
      y: visibleEars.reduce((s, p) => s + p.y, 0) / visibleEars.length,
    };
  }
  return isVisible(lm[IDX.NOSE]) ? lm[IDX.NOSE] : null;
}

function touchHeadScore(lm) {
  const anchor = headAnchor(lm);
  if (!anchor) return 0;
  const scale = shoulderWidth(lm) || 0.001;
  const candidates = [lm[IDX.LEFT_WRIST], lm[IDX.RIGHT_WRIST]]
    .filter(isVisible).map((w) => dist(w, anchor) / scale);
  if (candidates.length === 0) return 0;
  return clamp01(1 - Math.min(...candidates) / 0.9);
}

function armsOutScore(lm) {
  const scale = shoulderWidth(lm) || 0.001;
  const sideScore = (shoulderIdx, elbowIdx, wristIdx) => {
    const shoulder = lm[shoulderIdx];
    if (!isVisible(shoulder)) return 0;
    const wrist = lm[wristIdx];
    if (isVisible(wrist)) {
      const horizontal = Math.abs(wrist.x - shoulder.x) / scale;
      const verticalOffset = Math.abs(wrist.y - shoulder.y) / scale;
      const reach = clamp01((horizontal - 0.8) / 0.6);
      const heightBand = clamp01(1 - verticalOffset / 0.7);
      return Math.min(reach, heightBand);
    }
    const elbow = lm[elbowIdx];
    if (isVisible(elbow)) {
      const horizontal = Math.abs(elbow.x - shoulder.x) / scale;
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

const history = new Map(); // target -> [{ t, confidence }]

function pushHistory(target, confidence) {
  const now = performance.now();
  let arr = history.get(target);
  if (!arr) { arr = []; history.set(target, arr); }
  arr.push({ t: now, confidence });
  const cutoff = now - HOLD_WINDOW_MS;
  while (arr.length && arr[0].t < cutoff) arr.shift();
  return arr;
}

export function checkPose(target) {
  ensureStarted();
  if (state.status !== "ready" || !state.latestLandmarks) {
    return { matched: false, confidence: 0 };
  }
  const rawConfidence = scoreFor(target, state.latestLandmarks);
  const window = pushHistory(target, rawConfidence);
  const smoothed = window.reduce((s, e) => s + e.confidence, 0) / window.length;
  const spanMs = window.length > 1 ? window[window.length - 1].t - window[0].t : 0;
  const matched = smoothed >= MATCH_THRESHOLD && spanMs >= HOLD_WINDOW_MS * 0.6;
  return { matched, confidence: smoothed };
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