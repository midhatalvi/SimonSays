// Development-only browser harness. Never requests a camera or cloud speech.
import React, { useMemo, useRef, useState } from 'react';
import LearnScreen from './LearnScreen.jsx';
import GameScreen from './GameScreen.jsx';
import ScoreScreen from './ScoreScreen.jsx';
import '../ui/styles.css';

export default function VerificationLab() {
  const pose = useRef('neutral');
  const [mode, setMode] = useState('movement');
  const [selected, setSelected] = useState('neutral');
  const [phase, setPhase] = useState('setup');
  const [result, setResult] = useState(null);
  const [stopped, setStopped] = useState(false);
  const [spoken, setSpoken] = useState('');
  const [generation, setGeneration] = useState(0);
  const runtime = useMemo(() => ({
    getLearningQuestions: async () => [{ id: 'synthetic', question: 'Synthetic example: which is the largest planet?', answers: ['Jupiter', 'Mars'], correct: 0, source: {synthetic:true,title:'Synthetic NASA excerpt fixture',url:'https://science.nasa.gov/jupiter/facts/',excerpt:'Jupiter is the largest planet in our solar system.',retrievedAt:'2026-09-13T00:00:00Z'} }],
    checkPose: () => ({ tracking: pose.current !== 'missing',
      matched: pose.current === 'matched', confidence: pose.current === 'matched' ? 1 : 0 }),
    getVisionStatus: () => ({ status: 'ready' }), resetPoseHistory: () => {},
    stopVision: () => setStopped(true), cancelSpeech: () => {},
    prepareSpeech: async () => null,
    say: async text => { setSpoken(text); await new Promise(r => setTimeout(r, 250)); },
  }), []);
  const settings = useMemo(() => ({ seconds: 5, poses: ['RIGHT_HAND_UP', 'LEFT_HAND_UP'], topic: 'space', answerMode: 'buttons' }), []);
  return <>
    <aside className="verification-panel">
      <h1>Interaction verification — synthetic inputs</h1>
      <p>No camera, microphone, voice service, or live search is used. Learning sources are synthetic fixtures. This checks screen behavior, not recognition accuracy.</p>
      <label>Example mode <select value={mode} onChange={e => {setMode(e.target.value);setPhase('setup');}}><option value="movement">Movement</option><option value="learn">Learning — synthetic sources, buttons</option></select></label>
      <label>Example detector input <select value={selected} onChange={e => {
        setSelected(e.target.value); pose.current = e.target.value;
      }}><option value="neutral">Visible, hands relaxed</option><option value="matched">Visible, target pose held</option>
        <option value="missing">Tracking lost</option></select></label>
      <p>Simulated speech: {spoken || 'None yet'}</p>
      <p>Detector released: {stopped ? 'Yes' : 'No'}</p>
      <button onClick={() => { setPhase('setup'); setResult(null); setGeneration(g => g + 1); }}>Reset example</button>
    </aside>
    {phase === 'setup' && <div className="screen"><button className="big-btn" onClick={() => {
      setStopped(false); setPhase('game');
    }}>Run example session</button></div>}
    {phase === 'game' && mode === 'learn' && <LearnScreen runtime={runtime} settings={settings} onExit={() => setPhase('setup')} />}
    {phase === 'game' && mode === 'movement' && <GameScreen key={generation} runtime={runtime} settings={settings} onExit={() => setPhase("setup")} onDone={r => {
      setResult(r); setPhase('score');
    }} />}
    {phase === 'score' && <><ScoreScreen {...result} speak={runtime.say} onPlayAgain={() => setPhase('setup')} />
      <pre aria-label="Synthetic session result">{JSON.stringify(result, null, 2)}</pre></>}
  </>;
}
