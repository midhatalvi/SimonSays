// /ui — Game screen: runs the round loop over the REAL detector. (MIDHAT)
// Integration note: /vision/checkPose is self-contained — it opens its own
// camera and shows a small live preview + skeleton in the bottom-right corner.
// So this screen no longer mounts its own <CameraView> (that would open a second
// camera stream and break on phones). We wait for the detector to be "ready"
// before the first command so early rounds don't auto-fail while it loads.
import React, { useEffect, useRef, useState } from "react";
import { buildRounds, runRound, reactionFor } from "../engine/gameEngine.js";
import { checkPose, getVisionStatus } from "../vision/checkPose.js"; // real detector
import { POSE_NAMES } from "../shared/poses.js";
import { say } from "../voice/elevenlabs.js";

const TOTAL_ROUNDS = 6;

export default function GameScreen({ onDone }) {
  const [phase, setPhase] = useState("prep"); // prep | playing | error
  const [prompt, setPrompt] = useState("Get ready...");
  const [countdown, setCountdown] = useState(null);
  const [result, setResult] = useState(null); // "good" | "bad" | null
  const [roundNum, setRoundNum] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // guard React StrictMode double-invoke
    startedRef.current = true;

    let cancelled = false;

    // Kick off the detector (opens camera + loads model lazily), then wait
    // until it's ready before playing. Time out so we never hang forever if the
    // camera prompt is ignored or the model is slow to load.
    const READY_TIMEOUT_MS = 20000;
    const waitForVision = () =>
      new Promise((resolve) => {
        const deadline = Date.now() + READY_TIMEOUT_MS;
        const poll = () => {
          if (cancelled) return;
          checkPose(POSE_NAMES[0]); // fire-and-forget: triggers lazy init
          const { status } = getVisionStatus();
          if (status === "ready" || status === "error") return resolve(status);
          if (Date.now() > deadline) return resolve("error");
          setTimeout(poll, 300);
        };
        poll();
      });

    (async () => {
      setPhase("prep");
      setPrompt("Turning on the camera...");
      const status = await waitForVision();
      if (cancelled) return;
      if (status === "error") {
        setPhase("error");
        return;
      }

      setPhase("playing");
      const rounds = buildRounds(TOTAL_ROUNDS);

      await say("Let's play Simon Says! Copy the moves you hear.");
      for (const n of [3, 2, 1]) {
        if (cancelled) return;
        setPrompt("Get ready...");
        setCountdown(n);
        await say(String(n));
        await wait(400);
      }

      let score = 0;
      for (let i = 0; i < rounds.length; i++) {
        if (cancelled) return;
        const round = rounds[i];
        setRoundNum(i + 1);
        setResult(null);
        setPrompt(round.promptText);

        const { passed } = await runRound(
          round,
          checkPose,
          say,
          (secLeft) => !cancelled && setCountdown(secLeft)
        );
        if (cancelled) return;

        setCountdown(null);
        setResult(passed ? "good" : "bad");
        if (passed) score++;
        await say(reactionFor(passed));
        await wait(600);
      }
      if (!cancelled) onDone({ score, total: rounds.length });
    })();

    return () => {
      cancelled = true;
    };
  }, [onDone]);

  if (phase === "error") {
    return (
      <div className="screen">
        <p className="subtitle">
          We need your camera to play. Please allow camera access, then tap below.
        </p>
        <button className="big-btn" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="game-stage">
      <div className="game-overlay">
        <div className="score-line">
          {phase === "prep" ? "Setting up" : `Round ${roundNum || "–"} of ${TOTAL_ROUNDS}`}
        </div>
        <div
          className={
            "prompt " +
            (result === "good" ? "result-good" : result === "bad" ? "result-bad" : "")
          }
        >
          {prompt}
        </div>
        {countdown != null && <div className="countdown">{countdown}</div>}
        {result === "good" && <div className="score-line result-good">✓ Got it!</div>}
        {result === "bad" && <div className="score-line result-bad">Time's up</div>}
      </div>
    </div>
  );
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
