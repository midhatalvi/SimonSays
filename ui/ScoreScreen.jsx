// /ui — Score screen with spoken recap + reaction-time metrics. (MIDHAT)
import React, { useEffect } from "react";
import { SimonArt } from "./Brand.jsx";
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
  lives = null,
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
      const base = total
        ? `You got ${score} out of ${total} scored rounds.`
        : "Session complete. No rounds were scored this time.";
      speak(
        `${eliminated ? 'That’s all three lives. Great playing! ' : ''}${base} ${unscored} rounds were skipped or not scored. Thanks for playing.`,
        { signal: controller.signal },
      );
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [score, total, unscored, eliminated, speak]);

  return (
    <main className="recap-screen">
      <div className="recap-art">
        <SimonArt expression="cheer" />
      </div>
      <div className="recap-copy">
        <p className="eyebrow">A LITTLE MOVEMENT, WELL SPENT</p>
        <h1>
          {eliminated ? 'That’s all three lives!' : 'All done!'}
        </h1>
        <p>
          {total
            ? warmNote(score, total)
            : "You made a little time for yourself. Try again whenever you feel ready."}
        </p>
        <div className="result-stat">
          <span className="big-num">
            {total ? `${score}/${total}` : "—"}
          </span>
          <p>
            {total ? "Movement rounds completed correctly" : "No rounds scored this time"}
          </p>
        </div>
        {lives != null && <p>{roundsPlayed} of 6 rounds played · {lives} {lives === 1 ? 'life' : 'lives'} left</p>}
        {discovery && (
          <p>
            Discovery: {discovery.correct} correct from {discovery.answered}{" "}
            answered questions. This does not change your movement score.
          </p>
        )}
        <p className="score-note">
          {unscored} rounds skipped or not scored. Camera interruptions never
          count against you.
        </p>
        {avgSec != null && (
          <div className="metrics">
            <span className="metric">
              Average response: {avgSec.toFixed(1)}s
            </span>
            <span className="metric">Best: {bestSec.toFixed(1)}s</span>
          </div>
        )}
        <button className="big-btn" onClick={onPlayAgain}>
          Play again <span aria-hidden="true">↗</span>
        </button>
      </div>
    </main>
  );
}
