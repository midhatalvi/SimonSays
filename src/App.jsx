import React, { useState } from "react";
import "../ui/styles.css";
import StartScreen from "../ui/StartScreen.jsx";
import GameScreen from "../ui/GameScreen.jsx";
import ScoreScreen from "../ui/ScoreScreen.jsx";

export default function App() {
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
