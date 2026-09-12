// /ui — Game screen: robot-framed round loop over the REAL detector. (MIDHAT)
// Hands-free start: after the camera is ready, Simon asks you to raise both
// hands to begin (no button). True thumbs-up needs hand detection (Shravanthi's
// model); raise-both-hands reuses the current pose detector and works today.
import React, { useEffect, useRef, useState } from "react";
import { buildRounds, runRound, reactionFor } from "../engine/gameEngine.js";
import { checkPose, getVisionStatus } from "../vision/checkPose.js";
import { POSES, POSE_NAMES } from "../shared/poses.js";
import { say } from "../voice/elevenlabs.js";
import Robot from "./Robot.jsx";

const TOTAL_ROUNDS = 6;

export default function GameScreen({ onDone }) {
  const [phase, setPhase] = useState("prep"); // prep | ready | playing | error
  const [prompt, setPrompt] = useState("Turning on the camera...");
  const [countdown, setCountdown] = useState(null);
  const [result, setResult] = useState(null); // "good" | "bad" | null
  const [roundNum, setRoundNum] = useState(0);
  const [expr, setExpr] = useState("happy");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // guard React StrictMode double-invoke
    startedRef.current = true;
    let cancelled = false;

    // Poll the detector until a condition holds, or a timeout elapses.
    const pollUntil = (test, timeoutMs) =>
      new Promise((resolve) => {
        const deadline = Date.now() + timeoutMs;
        const step = () => {
          if (cancelled) return;
          const done = test();
          if (done) return resolve(done);
          if (Date.now() > deadline) return resolve("timeout");
          setTimeout(step, 250);
        };
        step();
      });

    (async () => {
      // 1) Wait for the detector to be ready (camera + model), with a timeout.
      setPhase("prep");
      setExpr("happy");
      setPrompt("Turning on the camera...");
      const visionResult = await pollUntil(() => {
        checkPose(POSE_NAMES[0]); // fire-and-forget lazy init
        const { status } = getVisionStatus();
        return status === "ready" || status === "error" ? status : null;
      }, 20000);
      if (cancelled) return;
      if (visionResult === "error") {
        setPhase("error");
        return;
      }

      // 2) Hands-free ready gate: raise both hands to begin.
      setPhase("ready");
      setExpr("ready");
      setPrompt("Raise both hands when you're ready!");
      await say("When you're ready, raise both hands up high!");
      await pollUntil(() => checkPose(POSES.BOTH_HANDS_UP).matched, 20000);
      if (cancelled) return;

      // 3) Play.
      setPhase("playing");
      setExpr("happy");
      const rounds = buildRounds(TOTAL_ROUNDS);

      await say("Wonderful! Here we go.");
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
        setExpr("happy");
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
        await say(reactionFor(passed));
        await wait(700);
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
    phase === "ready" ? "Ready?" :
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
