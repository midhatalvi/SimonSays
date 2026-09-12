// /ui — Game screen: Simon roams the stage, calls Simon Says commands from a
// speech bubble, and enforces the rules with 3 lives. (MIDHAT)
import React, { useEffect, useRef, useState } from "react";
import { buildRounds, judgeRound, reactionFor } from "../engine/gameEngine.js";
import { checkPose, getVisionStatus } from "../vision/checkPose.js";
import { POSE_NAMES } from "../shared/poses.js";
import { say } from "../voice/elevenlabs.js";
import SimonCharacter from "./SimonCharacter.jsx";

const TOTAL_ROUNDS = 6;
const LIVES = 3;

export default function GameScreen({ onDone }) {
  const [phase, setPhase] = useState("prep"); // prep | rules | playing | error
  const [prompt, setPrompt] = useState("Turning on the camera...");
  const [countdown, setCountdown] = useState(null);
  const [result, setResult] = useState(null); // "good" | "bad" | null
  const [roundNum, setRoundNum] = useState(0);
  const [lives, setLives] = useState(LIVES);
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
      x: 35 + Math.random() * 30, // 35–65% keeps the bubble on screen (phones)
      y: 50 + Math.random() * 18, // 50–68% keeps the bubble above him visible
    });

    // Speak the command while revealing the text word-by-word, so the on-screen
    // text never gets ahead of the voice (no reading the action early).
    const REVEAL_MS = 420;
    const announce = async (round) => {
      const words = round.promptText.split(" ");
      setPrompt("");
      const speakPromise = Promise.resolve(say(round.spokenText || round.promptText));
      await wait(300); // let the voice start before the first word appears
      const shown = [];
      for (let k = 0; k < words.length; k++) {
        if (cancelled) return;
        shown.push(words[k]);
        setPrompt(shown.join(" "));
        await wait(REVEAL_MS);
      }
      await speakPromise;
      if (!cancelled) setPrompt(round.promptText);
    };

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

      // 2) Teach the rules.
      setPhase("rules");
      setExpr("ready");
      await say(
        "Here's how we play. When I say Simon says before a move, do it! " +
          "But if I don't say Simon says, don't move — just show me your hands. " +
          "Move on a fake one, or miss a real one, and you lose a life. " +
          "You have three lives. Ready?"
      );
      await wait(700);

      // 3) Countdown.
      setPhase("playing");
      setExpr("happy");
      for (const n of [3, 2, 1]) {
        if (cancelled) return;
        setPrompt("Get ready...");
        setCountdown(n);
        await say(String(n));
        await wait(400);
      }
      setCountdown(null);

      // 4) Play — Simon roams; 3 lives; out when they run out.
      const rounds = buildRounds(TOTAL_ROUNDS);
      let score = 0;
      let livesLeft = LIVES;
      const reactions = []; // ms to perform, correct "Simon says" rounds only
      let i = 0;
      for (; i < rounds.length; i++) {
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

        // Announce: reveal the command in time with the voice.
        await announce(round);
        if (cancelled) return;

        const { passed, reactionMs } = await judgeRound(
          round,
          checkPose,
          (secLeft) => !cancelled && setCountdown(secLeft)
        );
        if (cancelled) return;

        setCountdown(null);
        if (passed) {
          score++;
          if (reactionMs != null) reactions.push(reactionMs);
          setResult("good");
          setExpr("cheer");
        } else {
          livesLeft--;
          setLives(livesLeft);
          setResult("bad");
          setExpr("oops");
        }
        await say(reactionFor(passed, round.simonSays));
        await wait(800);

        if (livesLeft <= 0) {
          if (!cancelled) await say("Oh no, that's all your lives! Great playing.");
          break;
        }
      }

      const roundsPlayed = Math.min(i + 1, rounds.length);
      if (!cancelled) {
        onDone({ score, total: rounds.length, eliminated: livesLeft <= 0, roundsPlayed, reactions });
      }
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

  const hearts = [];
  for (let i = 0; i < LIVES; i++) hearts.push(i < lives ? "❤️" : "🤍");

  return (
    <div className="game-roam">
      <div className="hud">
        <div className="hud-pill">
          {phase === "prep" ? "Getting ready" :
           phase === "rules" ? "How to play" :
           `Round ${roundNum || "–"} of ${TOTAL_ROUNDS}`}
        </div>
        {phase === "playing" && (
          <div className="hearts" aria-label={`${lives} lives left`}>
            {hearts.map((h, idx) => (
              <span key={idx} className="heart">{h}</span>
            ))}
          </div>
        )}
      </div>

      <div className="simon-wrap" style={{ left: pos.x + "%", top: pos.y + "%" }}>
        {!walking && (
          <div className="speech">
            {phase === "rules" ? (
              <ul className="rules-list">
                <li><b>"Simon says…"</b> → do the move!</li>
                <li><b>No "Simon says"</b> → stay still, show your hands</li>
                <li><b>❤️ 3 lives</b> — a slip costs one</li>
              </ul>
            ) : countdown != null ? (
              <span className="countdown">{countdown}</span>
            ) : (
              <span
                className={
                  "speech-cmd " +
                  (result === "good" ? "result-good" : result === "bad" ? "result-bad" : "")
                }
              >
                {prompt}
              </span>
            )}
            {result === "good" && <span className="feedback good">✓ Lovely!</span>}
            {result === "bad" && <span className="feedback bad">Careful! 💛</span>}
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
