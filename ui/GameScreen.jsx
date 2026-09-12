// /ui — Game screen: Simon roams the stage and calls out Simon Says commands
// from a speech bubble. He holds still during your answer window so the command
// stays readable, then waddles to a new spot for the next round. (MIDHAT)
import React, { useEffect, useRef, useState } from "react";
import { buildRounds, runRound, reactionFor } from "../engine/gameEngine.js";
import { checkPose, getVisionStatus } from "../vision/checkPose.js";
import { POSE_NAMES } from "../shared/poses.js";
import { say } from "../voice/elevenlabs.js";
import SimonCharacter from "./SimonCharacter.jsx";

const TOTAL_ROUNDS = 6;

export default function GameScreen({ onDone }) {
  const [phase, setPhase] = useState("prep"); // prep | rules | playing | error
  const [prompt, setPrompt] = useState("Turning on the camera...");
  const [sub, setSub] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [result, setResult] = useState(null); // "good" | "bad" | null
  const [roundNum, setRoundNum] = useState(0);
  const [expr, setExpr] = useState("happy");
  const [pos, setPos] = useState({ x: 50, y: 58 });
  const [walking, setWalking] = useState(false);
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
          checkPose(POSE_NAMES[0]);
          const { status } = getVisionStatus();
          if (status === "ready" || status === "error") return resolve(status);
          if (Date.now() > deadline) return resolve("error");
          setTimeout(step, 250);
        };
        step();
      });

    const randomSpot = () => ({
      x: 35 + Math.random() * 30, // 35–65% keeps the speech bubble on screen (phones)
      y: 50 + Math.random() * 18, // 50–68% keeps the bubble above him visible
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

      // 2) Teach the rule.
      setPhase("rules");
      setExpr("ready");
      setPrompt("Only move if I say “Simon says”!");
      setSub("If I don't say it, just show your hands and stay still.");
      await say(
        "Here's how we play. Only do the move if I say Simon says first. " +
          "If I don't say Simon says, just show me your hands and don't move!"
      );
      await wait(600);

      // 3) Countdown.
      setSub(null);
      setExpr("happy");
      for (const n of [3, 2, 1]) {
        if (cancelled) return;
        setPrompt("Get ready...");
        setCountdown(n);
        await say(String(n));
        await wait(400);
      }
      setCountdown(null);

      // 4) Play — Simon waddles to a new spot each round.
      setPhase("playing");
      const rounds = buildRounds(TOTAL_ROUNDS);
      let score = 0;
      for (let i = 0; i < rounds.length; i++) {
        if (cancelled) return;
        const round = rounds[i];
        setResult(null);
        setExpr("happy");

        // Waddle to a new spot (bubble hidden while walking).
        setWalking(true);
        setPos(randomSpot());
        await wait(950);
        if (cancelled) return;
        setWalking(false);

        setRoundNum(i + 1);
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
        <SimonCharacter expression="oops" />
        <p className="subtitle">
          I'll need your camera to play. Please allow camera access, then tap below.
        </p>
        <button className="big-btn" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  const pill =
    phase === "prep" ? "Getting ready" :
    phase === "rules" ? "How to play" :
    `Round ${roundNum || "–"} of ${TOTAL_ROUNDS}`;

  return (
    <div className="game-roam">
      <div className="hud-pill">{pill}</div>
      <div
        className="simon-wrap"
        style={{ left: pos.x + "%", top: pos.y + "%" }}
      >
        {!walking && (
          <div className="speech">
            {countdown != null ? (
              <span className="countdown">{countdown}</span>
            ) : (
              <>
                <span
                  className={
                    "speech-cmd " +
                    (result === "good" ? "result-good" : result === "bad" ? "result-bad" : "")
                  }
                >
                  {prompt}
                </span>
                {sub && <span className="speech-sub">{sub}</span>}
              </>
            )}
            {result === "good" && <span className="feedback good">✓ Lovely!</span>}
            {result === "bad" && <span className="feedback bad">That's okay 💛</span>}
          </div>
        )}
        <SimonCharacter expression={expr} walking={walking} />
      </div>
    </div>
  );
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
