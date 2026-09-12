// /ui — Start screen (MIDHAT)
import React from "react";

export default function StartScreen({ onStart }) {
  return (
    <div className="screen">
      <div className="card">
        <div className="emoji-row" aria-hidden="true">🙌 👋 🙆</div>
        <h1 className="title">Simon Says</h1>
        <p className="subtitle">
          A gentle game of moves and memory. Let's stretch and smile together.
        </p>
        <button className="big-btn" onClick={onStart}>
          Let's play
        </button>
      </div>
    </div>
  );
}
