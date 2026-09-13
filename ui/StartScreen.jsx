import React, { useState } from 'react';
import { ACTIVE_POSES } from '../engine/gameEngine.js';
const names = { RIGHT_HAND_UP: 'Right hand up', LEFT_HAND_UP: 'Left hand up', TOUCH_HEAD: 'Touch head',
  TOUCH_NOSE: 'Touch nose', TOUCH_SHOULDERS: 'Touch shoulders', ARMS_OUT: 'Arms out wide' };
export default function StartScreen({ onStart }) {
  const [mode, setMode] = useState('movement');
  const [topic, setTopic] = useState('space');
  const [answerMode, setAnswerMode] = useState('gestures');
  const [seconds, setSeconds] = useState(8);
  const [poses, setPoses] = useState(['RIGHT_HAND_UP', 'LEFT_HAND_UP', 'TOUCH_NOSE']);
  return <div className="screen setup-screen">
    <h1>Simon Says</h1><p>A short movement game at your pace. Sit or stand comfortably.</p>
    <label>Play mode <select value={mode} onChange={e => { setMode(e.target.value); if(e.target.value === 'learn') setPoses(p => p.slice(0,2)); }}>
      <option value="movement">Movement game</option><option value="learn">Learn &amp; Move</option></select></label>
    {mode === 'learn' && <>
      <label>Topic <select value={topic} onChange={e => setTopic(e.target.value)}><option value="space">Space</option><option value="animals">Animals</option></select></label>
      <label>Answer using <select value={answerMode} onChange={e => setAnswerMode(e.target.value)}><option value="gestures">Two gestures</option><option value="buttons">Answer buttons — no camera</option></select></label>
      <p>Review two sourced questions, then explore the evidence. We’ll practice A and B first. Your topic is sent to Tavily to find supporting sources.</p>
    </>}
    {(mode === 'movement' || answerMode === 'gestures') && <fieldset><legend>Choose movements that feel comfortable</legend>
      {ACTIVE_POSES.map(pose => <label key={pose}><input type="checkbox" checked={poses.includes(pose)}
        onChange={() => setPoses(current => current.includes(pose) ? current.filter(p => p !== pose) : [...current, pose])} />{names[pose]}</label>)}
    </fieldset>}
    {mode === 'learn' && answerMode === 'gestures' && <p>The first two selected movements map to A and B. Choose two comfortable, distinct gestures.</p>}
    {mode === 'movement' && <label>Time for each move <select value={seconds} onChange={e => setSeconds(Number(e.target.value))}>
      <option value={12}>Relaxed — 12 seconds</option><option value={8}>Comfortable — 8 seconds</option>
      <option value={5}>Quick — 5 seconds</option></select></label>}
    <p>{mode === 'learn' && answerMode === 'buttons' ? 'Answer buttons do not need a camera.' : 'Your camera processes movement on this device.'} Voice prompts use an online service. No microphone is needed.</p>
    {mode === 'movement' && <p>We’ll practice first. After each instruction, relax your hands and wait for “Go.” Skips and camera interruptions have no penalty.</p>}
    <button className="big-btn" disabled={mode === 'learn' ? answerMode === 'gestures' && poses.length !== 2 : !poses.length} onClick={() => onStart({ seconds, poses, mode, topic, answerMode })}>Start practice</button>
    {mode === 'learn' && <p>Learning questions have no response time limit. Skips and camera interruptions have no penalty.</p>}
    {mode === 'learn' && answerMode === 'gestures' && poses.length !== 2 && <p role="status">Choose exactly two gestures for A and B.</p>}
    {mode === 'movement' && !poses.length && <p role="status">Choose at least one comfortable movement.</p>}
  </div>;
}
