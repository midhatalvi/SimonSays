// /ui — Game screen: camera preview + round loop over the (fake) detector. (MIDHAT)
import React, { useCallback, useEffect, useRef, useState } from "react";
import { buildRounds, runRound, reactionFor } from "../engine/gameEngine.js";
import { checkPose } from "../engine/fakeCheckPose.js"; // swap -> ../vision/checkPose.js at integration
import { say } from "../voice/elevenlabs.js";
import CameraView from "./CameraView.jsx";

const TOTAL_ROUNDS = 6;

export default function GameScreen({ onDone }) {
  const [prompt, setPrompt] = useState("Get ready...");
  const [countdown, setCountdown] = useState(null);
  const [result, setResult] = useState(null); // "good" | "bad" | null
  const [roundNum, setRoundNum] = useState(0);
  const startedRef = useRef(false);
  const videoRef = useRef(null);

  // The camera hands us its <video> element; kept for the /vision swap later.
  const handleCameraReady = useCallback((videoEl) => {
    videoRef.current = videoEl;
  }, []);

  useEffect(() => {
    if (startedRef.current) return; // guard React StrictMode double-invoke
    startedRef.current = true;

    let cancelled = false;
    const rounds = buildRounds(TOTAL_ROUNDS);

    (async () => {
      await say("Let's play Simon Says! Copy the moves you hear.");
      // 3-2-1 intro
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

  return (
    <div className="game-stage">
      <CameraView onReady={handleCameraReady} />
      <div className="game-overlay">
        <div className="score-line">
          Round {roundNum || "–"} of {TOTAL_ROUNDS}
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
