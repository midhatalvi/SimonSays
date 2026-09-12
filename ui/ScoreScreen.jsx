// /ui — Score screen with spoken recap. (MIDHAT)
import React, { useEffect, useRef } from "react";
import Robot from "./Robot.jsx";
import { say } from "../voice/elevenlabs.js";

function warmNote(score, total) {
  const ratio = total ? score / total : 0;
  if (ratio >= 0.8) return "Wonderful moving today. You're doing so well.";
  if (ratio >= 0.5) return "Lovely effort — every move counts.";
  return "You showed up and moved, and that's what matters.";
}

export default function ScoreScreen({ score, total, eliminated, roundsPlayed, onPlayAgain }) {
  const spoken = useRef(false);

  useEffect(() => {
    if (spoken.current) return;
    spoken.current = true;
    const recap = eliminated
      ? `Good game! You made it through ${roundsPlayed} rounds and got ${score} right. ${warmNote(score, total)}`
      : `Well done. You got ${score} out of ${total}. ${warmNote(score, total)}`;
    say(recap);
  }, [score, total, eliminated, roundsPlayed]);

  return (
    <div className="screen">
      <Robot expression="cheer">
        <h1 className="belly-title">{eliminated ? "Good game!" : "All done!"}</h1>
        <div className="big-num">
          {score}/{total}
        </div>
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
