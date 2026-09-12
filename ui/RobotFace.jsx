// /ui — Simon's face, shared by the planted robot and the roaming mascot. (MIDHAT)
// expression: "happy" | "ready" | "cheer" | "oops"
import React from "react";

export default function RobotFace({ expression }) {
  const eyeGlow = { filter: "drop-shadow(0 0 6px rgba(242,166,90,0.8))" };
  return (
    <svg className="robot-face-svg" viewBox="0 0 220 150" aria-hidden="true">
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

      <circle cx="44" cy="98" r="10" className="cheek" />
      <circle cx="176" cy="98" r="10" className="cheek" />

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
