// /ui — Start screen (MIDHAT)
import React from "react";

export default function StartScreen({ onStart }) {
  return (
    <div className="screen">
      <h1 className="title">Spry</h1>
      <p className="subtitle">Move, laugh, and stay sharp. Ready to play?</p>
      <button className="big-btn" onClick={onStart}>
        Start
      </button>
    </div>
  );
}
