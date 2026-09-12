// /ui — Simon, the friendly robot. Warm face on top, commands live in the belly.
// (MIDHAT)  expression: "happy" | "ready" | "cheer" | "oops"
import React from "react";

function Face({ expression }) {
  const eyeGlow = { filter: "drop-shadow(0 0 6px rgba(242,166,90,0.8))" };
  return (
    <svg className="robot-face-svg" viewBox="0 0 220 150" aria-hidden="true">
      {/* eyes */}
      {expression === "cheer" ? (
        <>
          <path d="M50 78 Q70 52 90 78" className="eye-line" />
          <path d="M130 78 Q150 52 170 78" className="eye-line" />
        </>
      ) : expression === "oops" ? (
        <>
          <circle cx="70" cy="70" r="11" className="eye" style={eyeGlow} />
          <circle cx="150" cy="70" r="11" className="eye" style={eyeGlow} />
        </>
      ) : (
        <>
          <circle cx="70" cy="70" r={expression === "ready" ? 19 : 16} className="eye" style={eyeGlow} />
          <circle cx="150" cy="70" r={expression === "ready" ? 19 : 16} className="eye" style={eyeGlow} />
          <circle cx="64" cy="64" r="5" className="eye-spark" />
          <circle cx="144" cy="64" r="5" className="eye-spark" />
        </>
      )}

      {/* cheeks */}
      <circle cx="44" cy="98" r="10" className="cheek" />
      <circle cx="176" cy="98" r="10" className="cheek" />

      {/* mouth */}
      {expression === "cheer" ? (
        <path d="M78 98 Q110 138 142 98 Z" className="mouth-fill" />
      ) : expression === "oops" ? (
        <path d="M92 112 Q110 100 128 112" className="mouth-line" />
      ) : (
        <path d="M84 104 Q110 128 136 104" className="mouth-line" />
      )}
    </svg>
  );
}

export default function Robot({ expression = "happy", children }) {
  return (
    <div className="robot">
      <svg className="robot-sprout" viewBox="0 0 60 52" aria-hidden="true">
        <path d="M30 52 V28" className="sprout-stem" />
        <path d="M30 32 C30 14 12 12 10 26 C10 38 26 38 30 32 Z" className="sprout-leaf" />
        <path d="M30 32 C30 14 48 12 50 26 C50 38 34 38 30 32 Z" className="sprout-leaf" />
      </svg>
      <div className={"robot-head expr-" + expression}>
        <Face expression={expression} />
      </div>
      <div className="robot-body">
        <span className="robot-arm left" aria-hidden="true" />
        <span className="robot-arm right" aria-hidden="true" />
        <div className="robot-belly">{children}</div>
      </div>
      <div className="robot-feet" aria-hidden="true">
        <span /><span />
      </div>
    </div>
  );
}
