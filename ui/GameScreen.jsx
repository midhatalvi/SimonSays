// /ui — Game screen: runs the round loop against the (fake) detector. (MIDHAT)
import React, { useEffect, useRef, useState } from "react";
import { buildRounds, runRound } from "../engine/gameEngine.js";
import { checkPose } from "../engine/fakeCheckPose.js"; // swap -> ../vision/checkPose.js at integration
import { say } from "../voice/elevenlabs.js";

export default function GameScreen({ onDone }) {
  const [prompt, setPrompt] = useState("Get ready...");
  const [countdown, setCountdown] = useState(null);
  const [result, setResult] = useState(null); // "good" | "bad" | null
  const [roundNum, setRoundNum] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // guard React StrictMode double-invoke
    startedRef.current = true;

    let cancelled = false;
    const rounds = buildRounds();

    (async () => {
      let score = 0;
      for (let i = 0; i < rounds.length; i++) {
        if (cancelled) return;
        const round = rounds[i];
        setRoundNum(i + 1);
        setResult(null);
        setPrompt(round.promptText);

        const { passed, confidence } = await runRound(
          round,
          checkPose,
          say,
          (secLeft) => !cancelled && setCountdown(secLeft)
        );
        if (cancelled) return;

        setCountdown(null);
        setResult(passed ? "good" : "bad");
        if (passed) score++;
        await say(passed ? "Nice work!" : "That's okay, keep going!");
        await wait(700);
      }
      if (!cancelled) onDone({ score, total: rounds.length });
    })();

    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <div className="screen">
      <div className="score-line">Round {roundNum} of 6</div>
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
  );
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
