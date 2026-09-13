// /ui — Score screen with spoken recap + reaction-time metrics. (MIDHAT)
import React, { useEffect, useRef } from "react";
import Robot from "./Robot.jsx";
import { say } from "../voice/elevenlabs.js";

function warmNote(score, total) {
  const ratio = total ? score / total : 0;
  if (ratio >= 0.8) return "Wonderful moving today. You're doing so well.";
  if (ratio >= 0.5) return "Lovely effort — every move counts.";
  return "You showed up and moved, and that's what matters.";
}

export default function ScoreScreen({
  unscored = 0,
  score,
  total,
  eliminated,
  roundsPlayed,
  reactions = [],
  onPlayAgain,
}) {
  const spoken = useRef(false);

  const avgSec = reactions.length
    ? reactions.reduce((a, b) => a + b, 0) / reactions.length / 1000
    : null;
  const bestSec = reactions.length ? Math.min(...reactions) / 1000 : null;

  useEffect(() => {
    if (spoken.current) return;
    spoken.current = true;
    const base = eliminated
      ? `Good game! You made it through ${roundsPlayed} rounds and got ${score} right.`
      : `Well done. You got ${score} out of ${total}.`;
    const speed =
      avgSec != null ? ` Your average response was ${avgSec.toFixed(1)} seconds.` : "";
    say(`${base}${speed} ${warmNote(score, total)}`);
  }, [score, total, eliminated, roundsPlayed, avgSec]);

  return (
    <div className="screen">
      <Robot expression="cheer">
        <h1 className="belly-title">{eliminated ? "Good game!" : "All done!"}</h1>
        <div className="big-num">
          {total ? `${score}/${total}` : "Session complete"}
        </div>
        <p>{unscored} rounds skipped or not scored. Camera interruptions never count against you.</p>
        {avgSec != null && (
          <div className="metrics">
            <span className="metric">⏱ Avg {avgSec.toFixed(1)}s</span>
            <span className="metric">⚡ Best {bestSec.toFixed(1)}s</span>
          </div>
        )}
        <p className="belly-text">
          {eliminated
            ? `You stayed sharp for ${roundsPlayed} rounds!`
            : warmNote(score, total)}
        </p>
        <button className="big-btn" onClick={onPlayAgain}>
          Play again
        </button>
      </Robot>
    </div>
  );
}
