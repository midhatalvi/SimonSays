// /ui — Game screen: robot-framed Simon Says loop over the REAL detector. (MIDHAT)
// Flow: turn on camera -> teach the rules -> 3-2-1 -> play. Simon Says logic
// lives in /engine; here we just render Simon and speak.
import React, { useEffect, useRef, useState } from "react";
import { buildRounds, runRound, reactionFor } from "../engine/gameEngine.js";
import { checkPose, getVisionStatus } from "../vision/checkPose.js";
import { POSE_NAMES } from "../shared/poses.js";
import { say } from "../voice/elevenlabs.js";
import Robot from "./Robot.jsx";

const TOTAL_ROUNDS = 6;

export default function GameScreen({ onDone }) {
  const [phase, setPhase] = useState("prep"); // prep | rules | playing | error
  const [prompt, setPrompt] = useState("Turning on the camera...");
  const [sub, setSub] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [result, setResult] = useState(null); // "good" | "bad" | null
  const [roundNum, setRoundNum] = useState(0);
  const [expr, setExpr] = useState("happy");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // guard React StrictMode double-invoke
    startedRef.current = true;
    let cancelled = false;

    const waitForVision = (timeoutMs) =>
      new Promise((resolve) => {
        const deadline = Date.now() + timeoutMs;
        const step = () => {
          if (cancelled) return;
          checkPose(POSE_NAMES[0]); // fire-and-forget lazy init
          const { status } = getVisionStatus();
          if (status === "ready" || status === "error") return resolve(status);
          if (Date.now() > deadline) return resolve("error");
          setTimeout(step, 250);
        };
        step();
      });

    (async () => {
      // 1) Camera + model.
      setPhase("prep");
      setExpr("happy");
      setPrompt("Turning on the camera...");
      const status = await waitForVision(20000);
      if (cancelled) return;
      if (status === "error") {
        setPhase("error");
        return;
      }

      // 2) Teach the Simon Says rule.
      setPhase("rules");
      setExpr("ready");
      setPrompt("Only move if I say “Simon says”!");
      setSub("If I don't say it, just show me your hands and stay still.");
      await say(
        "Here's how we play. Only do the move if I say Simon says first. " +
          "If I don't say Simon says, just show me your hands and don't move!"
      );
      await wait(600);

      // 3) Countdown.
      setSub(null);
      for (const n of [3, 2, 1]) {
        if (cancelled) return;
        setPrompt("Get ready...");
        setCountdown(n);
        await say(String(n));
        await wait(400);
      }

      // 4) Play.
      setPhase("playing");
      const rounds = buildRounds(TOTAL_ROUNDS);
      let score = 0;
      for (let i = 0; i < rounds.length; i++) {
        if (cancelled) return;
        const round = rounds[i];
        setRoundNum(i + 1);
        setResult(null);
        setExpr("happy");
        setCountdown(null);
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
        setExpr(passed ? "cheer" : "oops");
        if (passed) score++;
        await say(reactionFor(passed, round.simonSays));
        await wait(800);
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
        <Robot expression="oops">
          <p className="belly-text">
            I'll need your camera to play. Please allow camera access, then tap below.
          </p>
          <button className="big-btn" onClick={() => window.location.reload()}>
            Try again
          </button>
        </Robot>
      </div>
    );
  }

  const pill =
    phase === "prep" ? "Getting ready" :
    phase === "rules" ? "How to play" :
    `Round ${roundNum || "–"} of ${TOTAL_ROUNDS}`;

  return (
    <div className="screen">
      <Robot expression={expr}>
        <div className="pill">{pill}</div>
        <div
          className={
            "belly-command " +
            (result === "good" ? "result-good" : result === "bad" ? "result-bad" : "")
          }
        >
          {prompt}
        </div>
        {sub && <p className="belly-text">{sub}</p>}
        {countdown != null && <div className="countdown">{countdown}</div>}
        {result === "good" && <div className="feedback good">✓ Lovely!</div>}
        {result === "bad" && <div className="feedback bad">That's okay 💛</div>}
      </Robot>
    </div>
  );
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
