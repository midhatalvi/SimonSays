// /ui — Score screen with spoken recap. (MIDHAT)
import React, { useEffect, useRef } from "react";
import { say } from "../voice/elevenlabs.js";

function warmNote(score, total) {
  const ratio = total ? score / total : 0;
  if (ratio >= 0.8) return "Wonderful moving today. You're doing so well.";
  if (ratio >= 0.5) return "Lovely effort — every move counts.";
  return "You showed up and moved, and that's what matters.";
}

export default function ScoreScreen({ score, total, onPlayAgain }) {
  const spoken = useRef(false);

  useEffect(() => {
    if (spoken.current) return;
    spoken.current = true;
    say(`Well done. You got ${score} out of ${total}. ${warmNote(score, total)}`);
  }, [score, total]);

  return (
    <div className="screen">
      <div className="card">
        <div className="sparkle" aria-hidden="true">🌿✨</div>
        <h1 className="title">All done!</h1>
        <div className="big-num">
          {score}/{total}
        </div>
        <p className="subtitle">{warmNote(score, total)}</p>
        <button className="big-btn" onClick={onPlayAgain}>
          Play again
        </button>
      </div>
    </div>
  );
}
