import React, { Suspense, lazy, useState } from "react";
import "../ui/styles.css";
import StartScreen from "../ui/StartScreen.jsx";
import GameScreen from "../ui/GameScreen.jsx";
import ScoreScreen from "../ui/ScoreScreen.jsx";

const VerificationLab = import.meta.env.DEV
  ? lazy(() => import('../ui/VerificationLab.jsx')) : null;

export default function App() {
  if (VerificationLab && new URLSearchParams(window.location.search).has('lab'))
    return <Suspense fallback={<p>Opening test examples…</p>}><VerificationLab /></Suspense>;
  return <PlayerApp />;
}

function PlayerApp() {
  const [phase, setPhase] = useState("start"); // start | game | score
  const [settings, setSettings] = useState(null);
  const [result, setResult] = useState({ score: 0, total: 0 });

  if (phase === "start") return <StartScreen onStart={(chosen) => { setSettings(chosen); setPhase("game"); }} />;

  if (phase === "game")
    return (
      <GameScreen settings={settings}
        onDone={(r) => {
          setResult(r);
          setPhase("score");
        }}
      />
    );

  return (
    <ScoreScreen {...result} onPlayAgain={() => setPhase("start")} />
  );
}
