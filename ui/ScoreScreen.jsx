// /ui — Score screen with spoken recap + reaction-time metrics. (MIDHAT)
import React, { useEffect } from "react";
import Robot from "./Robot.jsx";
import { say } from "../voice/elevenlabs.js";

function warmNote(score, total) {
  const ratio = total ? score / total : 0;
  if (ratio >= 0.8) return "Wonderful moving today. You're doing so well.";
  if (ratio >= 0.5) return "Lovely effort — every move counts.";
  return "You showed up and moved, and that's what matters.";
}

export default function ScoreScreen({
  discovery = null,
  unscored = 0,
  score,
  total,
  eliminated,
  roundsPlayed,
  reactions = [],
  onPlayAgain,
  speak = say,
}) {
  const avgSec = reactions.length
    ? reactions.reduce((a, b) => a + b, 0) / reactions.length / 1000
    : null;
  const bestSec = reactions.length ? Math.min(...reactions) / 1000 : null;

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const base = total ? `You got ${score} out of ${total} scored rounds.`
        : "Session complete. No rounds were scored this time.";
      speak(`${base} ${unscored} rounds were skipped or not scored. Thanks for playing.`, { signal: controller.signal });
    }, 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [score, total, unscored, speak]);

  return (
    <div className="screen">
      <Robot expression="cheer">
        <h1 className="belly-title">{eliminated ? "Good game!" : "All done!"}</h1>
        <div className="big-num">
          {total ? `${score}/${total}` : "Session complete"}
        </div>
        <p>Movement rounds</p>
        {discovery && <p>Discovery: {discovery.correct} correct from {discovery.answered} answered questions. This does not change your movement score.</p>}
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
            : total ? warmNote(score, total) : "Try again whenever you feel ready."}
        </p>
        <button className="big-btn" onClick={onPlayAgain}>
          Play again
        </button>
      </Robot>
    </div>
  );
}
