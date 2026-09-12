// /ui — Score screen with spoken recap. (MIDHAT)
import React, { useEffect, useRef } from "react";
import { say } from "../voice/elevenlabs.js";

export default function ScoreScreen({ score, total, onPlayAgain }) {
  const spoken = useRef(false);

  useEffect(() => {
    if (spoken.current) return;
    spoken.current = true;
    say(`Great job! You got ${score} out of ${total}. Let's play again soon!`);
  }, [score, total]);

  return (
    <div className="screen">
      <h1 className="title">All done!</h1>
      <div className="big-num">
        {score}/{total}
      </div>
      <p className="subtitle">You stayed sharp today. Nicely done.</p>
      <button className="big-btn" onClick={onPlayAgain}>
        Play again
      </button>
    </div>
  );
}
