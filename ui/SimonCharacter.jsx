// /ui — Compact roaming Simon (mascot) for the game screen. (MIDHAT)
import React from "react";
import RobotFace from "./RobotFace.jsx";

export default function SimonCharacter({ expression = "happy", walking = false }) {
  return (
    <div className={"mascot" + (walking ? " walking" : "")}>
      <svg className="robot-sprout" viewBox="0 0 60 52" aria-hidden="true">
        <path d="M30 52 V28" className="sprout-stem" />
        <path d="M30 32 C30 14 12 12 10 26 C10 38 26 38 30 32 Z" className="sprout-leaf" />
        <path d="M30 32 C30 14 48 12 50 26 C50 38 34 38 30 32 Z" className="sprout-leaf" />
      </svg>
      <div className={"mascot-head expr-" + expression}>
        <RobotFace expression={expression} />
      </div>
      <div className="mascot-body">
        <span className="robot-arm left" aria-hidden="true" />
        <span className="robot-arm right" aria-hidden="true" />
      </div>
      <div className="mascot-feet" aria-hidden="true">
        <span className="foot-l" /><span className="foot-r" />
      </div>
    </div>
  );
}
