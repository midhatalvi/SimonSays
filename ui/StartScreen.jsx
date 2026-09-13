import React, { useState } from 'react';
import { ACTIVE_POSES } from '../engine/gameEngine.js';
const names = { RIGHT_HAND_UP: 'Right hand up', LEFT_HAND_UP: 'Left hand up', TOUCH_HEAD: 'Touch head',
  TOUCH_NOSE: 'Touch nose', TOUCH_SHOULDERS: 'Touch shoulders', ARMS_OUT: 'Arms out wide' };
export default function StartScreen({ onStart }) {
  const [discovery, setDiscovery] = useState(true);
  const [topic, setTopic] = useState('space');
  const [answerMode, setAnswerMode] = useState('gestures');
  const [seconds, setSeconds] = useState(8);
  const [poses, setPoses] = useState(['RIGHT_HAND_UP', 'LEFT_HAND_UP', 'TOUCH_NOSE']);
  return <div className="screen setup-screen">
    <h1>Simon Says</h1><p>A short movement game at your pace. Sit or stand comfortably.</p>
    <label><input type="checkbox" checked={discovery} onChange={e => setDiscovery(e.target.checked)} />Offer a discovery break halfway through</label>
    {discovery && <>
      <label>Discovery topic <select value={topic} onChange={e => setTopic(e.target.value)}><option value="space">Space</option><option value="animals">Animals</option></select></label>
      <label>Answer questions using <select value={answerMode} onChange={e => setAnswerMode(e.target.value)}><option value="gestures">Two comfortable gestures</option><option value="buttons">Answer buttons</option></select></label>
      <p>After three moves, choose whether to explore one sourced fact. Your topic is sent to Tavily only if you accept. Questions have no time limit.</p>
    </>}
    <fieldset><legend>Choose movements that feel comfortable</legend>
      {ACTIVE_POSES.map(pose => <label key={pose}><input type="checkbox" checked={poses.includes(pose)}
        onChange={() => setPoses(current => current.includes(pose) ? current.filter(p => p !== pose) : [...current, pose])} />{names[pose]}</label>)}
    </fieldset>
    <label>Time for each move <select value={seconds} onChange={e => setSeconds(Number(e.target.value))}>
      <option value={12}>Relaxed — 12 seconds</option><option value={8}>Comfortable — 8 seconds</option>
      <option value={5}>Quick — 5 seconds</option></select></label>
    <p>Your camera processes movement on this device. Voice prompts use an online service. No microphone is needed.</p>
    <p>We’ll practice first. After each instruction, relax your hands and wait for “Go.” Skips and camera interruptions have no penalty.</p>
    {discovery && answerMode === 'gestures' && <p>We’ll practice the first two selected movements for A and B. With only one movement selected, use answer buttons instead.</p>}
    <button className="big-btn" disabled={!poses.length} onClick={() => onStart({ seconds, poses, discovery, topic, answerMode: poses.length < 2 ? 'buttons' : answerMode })}>Play with Simon</button>
    {!poses.length && <p role="status">Choose at least one comfortable movement.</p>}
  </div>;
}
