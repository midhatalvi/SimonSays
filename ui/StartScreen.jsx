// /ui — Start screen: meet Simon the robot. (MIDHAT)
import React from "react";
import Robot from "./Robot.jsx";

export default function StartScreen({ onStart }) {
  return (
    <div className="screen">
      <Robot expression="happy">
        <h1 className="belly-title">Simon Says</h1>
        <p className="belly-text">
          Hi, I'm Simon! Move along with me and let's stay sharp together.
        </p>
        <button className="big-btn" onClick={onStart}>
          Let's play
        </button>
      </Robot>
    </div>
  );
}
