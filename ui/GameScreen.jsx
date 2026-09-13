import React, { useEffect, useRef, useState } from 'react';
import { buildRounds, judgeRound, reactionFor } from '../engine/gameEngine.js';
import { checkPose, getVisionStatus, resetPoseHistory, stopVision } from '../vision/checkPose.js';
import { say, prepareSpeech, cancelSpeech } from '../voice/elevenlabs.js';
import LearnScreen from './LearnScreen.jsx';
import { getLearningQuestions } from '../content/tavilyRounds.js';
import SimonCharacter from './SimonCharacter.jsx';

const liveRuntime = { getLearningQuestions, checkPose, getVisionStatus, resetPoseHistory, stopVision, say, prepareSpeech, cancelSpeech };
const wait = ms => new Promise(r => setTimeout(r, ms));
const labels = {
  neutral: 'Relax your hands below your shoulders. Keep them in view.',
  active: 'Go: follow the instruction only if Simon says.',
  'tracking-lost': 'Camera cannot see the needed body points. Timer paused. Move back into view.',
  paused: 'Paused. Take your time.',
};

export default function GameScreen({ onDone, settings, onExit, runtime = liveRuntime }) {
  const { checkPose, getVisionStatus, resetPoseHistory, stopVision, say, prepareSpeech, cancelSpeech } = runtime;
  const [discovery, setDiscovery] = useState(null);
  const discoveryChoice = useRef(null), discoveryResult = useRef(null);
  const [prompt, setPrompt] = useState('Getting the camera ready…');
  const [status, setStatus] = useState('Loading the movement detector…');
  const [roundNumber, setRoundNumber] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(false);
  const [practiceReview, setPracticeReview] = useState(false);
  const practiceChoice = useRef(null);
  const [repeatBusy, setRepeatBusy] = useState(false);
  const [canControl, setCanControl] = useState(false);
  const pausedRef = useRef(false), activeController = useRef(null), session = useRef(null);
  const command = useRef(''), doneRef = useRef(onDone), skip = useRef(false);
  doneRef.current = onDone;

  useEffect(() => {
    const controller = new AbortController(); session.current = controller;
    const signal = controller.signal;
    let running = false;
    // Defer startup so React's development remount cancels before requesting a camera.
    const timer = setTimeout(async () => {
      running = true;
      const rounds = buildRounds(6, settings.seconds, settings.poses).map(r => ({ ...r, timeLimitSec: settings.seconds }));
      const practice = { ...rounds[0], simonSays: true,
        promptText: 'Simon says ' + rounds[0].promptText.replace(/^Simon says /, '').toLowerCase(),
        timeLimitSec: Math.max(10, settings.seconds) };
      practice.spokenText = practice.promptText;
      void prepareSpeech(practice.spokenText);
      checkPose(practice.targetPose);
      const deadline = Date.now() + 25000;
      while (!signal.aborted && getVisionStatus().status === 'loading' && Date.now() < deadline) await wait(100);
      if (signal.aborted) return;
      if (getVisionStatus().status !== 'ready') { setError(true); stopVision(); return; }
      const results = [];
      const sessionRounds = [practice, ...rounds];
      for (let index = 0; index < sessionRounds.length; index++) {
        const round = sessionRounds[index];
        if (signal.aborted) break;
        while (pausedRef.current && !signal.aborted) await wait(100);
        if (signal.aborted) break;
        setRoundNumber(index); setCountdown(null);
        command.current = round.spokenText || round.promptText;
        setPrompt(round.promptText);
        setStatus(index === 0 ? 'Practice — no score. Listen, relax your hands, then wait for Go.' : 'Listen, relax your hands, then wait for Go.');
        const next = rounds[index];
        if (next) void prepareSpeech(next.spokenText || next.promptText);
        const positive = index === 0 ? 'You did it. Practice again, or start when you feel ready.' : reactionFor(true, round.simonSays);
        const negative = index === 0 ? 'No score in practice. Try again, or choose a different movement in setup.' : reactionFor(false, round.simonSays);
        const unscored = 'No score for this round. Let’s try another.';
        void prepareSpeech(positive);
        void prepareSpeech(negative);
        void prepareSpeech(unscored);
        await say(command.current, { signal });
        if (signal.aborted) break;
        const roundController = new AbortController(); activeController.current = roundController;
        const abortRound = () => roundController.abort();
        signal.addEventListener('abort', abortRound, { once: true });
        skip.current = false; setCanControl(true);
        const result = await judgeRound(round, checkPose, setCountdown, {
          signal: roundController.signal, isPaused: () => pausedRef.current,
          reset: resetPoseHistory, onState: state => setStatus(labels[state]),
        });
        signal.removeEventListener('abort', abortRound);
        setCanControl(false); setCountdown(null);
        if (signal.aborted) break;
        if (skip.current) result.reason = 'skipped';
        if (index > 0) results.push(result);
        const feedback = result.passed == null ? unscored : result.passed ? positive : negative;
        setStatus(feedback);
        await say(feedback, { signal });
        if (index === 0 && !signal.aborted) {
          practiceChoice.current = null;
          setPracticeReview(true);
          while (!practiceChoice.current && !signal.aborted) await wait(100);
          if (signal.aborted) break;
          setPracticeReview(false);
          if (practiceChoice.current === 'retry') index--;
        }
        if (index === 3 && settings.discovery && !signal.aborted) {
          stopVision();
          discoveryChoice.current = null;
          setDiscovery('offer');
          while (!discoveryChoice.current && !signal.aborted) await wait(100);
          if (signal.aborted) break;
          setDiscovery(null);
          // Let the discovery screen release its detector before movement resumes.
          await wait(100);
          if (signal.aborted) break;
          pausedRef.current = false; setPaused(false);
          setStatus('Back to movement. Listen for Simon says.');
          await say('Back to movement. Follow the instruction only if Simon says.', { signal });
        }
      }
      if (!signal.aborted) {
        stopVision();
        const scored = results.filter(r => r.passed != null);
        doneRef.current({ score: scored.filter(r => r.passed).length, total: scored.length,
          roundsPlayed: results.length, eliminated: false, reactions: [],
          discovery: discoveryResult.current, unscored: results.length - scored.length });
      }
    }, 0);
    return () => {
      clearTimeout(timer); controller.abort(); activeController.current?.abort(); cancelSpeech();
      if (running) stopVision();
    };
  }, [settings, runtime]);

  async function repeat() {
    pausedRef.current = true; setPaused(true); setRepeatBusy(true);
    await say(command.current, { signal: session.current?.signal });
    if (!session.current?.signal.aborted) setRepeatBusy(false);
  }
  function finishDiscovery(summary = null) {
    discoveryResult.current = summary;
    setDiscovery(null); discoveryChoice.current = 'continue';
  }
  if (discovery === 'offer') return <main className="screen setup-screen">
    <h1>Ready for a discovery break?</h1>
    <p>You’ve finished three movement rounds. Explore one {settings.topic} question, or keep moving.</p>
    <p>Question answers are separate from your movement score.</p>
    <button className="big-btn" onClick={() => setDiscovery('question')}>Explore one fact</button>
    <button onClick={() => finishDiscovery()}>Keep moving</button>
    {onExit && <button onClick={onExit}>End session</button>}
  </main>;
  if (discovery === 'question') return <LearnScreen settings={settings} runtime={runtime}
    onExit={() => finishDiscovery()} onFinish={finishDiscovery} />;
  if (error) return <div className="screen"><h1>Camera setup needs another try</h1>
    <p>Check camera permission and your connection, then reload. You have not lost any points.</p>
    <button className="big-btn" onClick={() => window.location.reload()}>Try again</button>
    {onExit && <button onClick={onExit}>Back to setup</button>}</div>;
  return <div className="screen fair-game">
    <div id="camera-preview-slot" aria-label="Camera preview" />
    <p>{roundNumber === 0 ? 'Practice' : `Round ${roundNumber} of 6`}</p>
    <SimonCharacter expression="happy" />
    <h1 className="instruction">{prompt}</h1>
    <p role="status" aria-live="polite">{status}</p>
    {countdown != null && <p aria-label="Seconds remaining">{countdown}s remaining</p>}
    {practiceReview && <div className="play-controls" aria-label="Practice choices">
      <button onClick={() => { practiceChoice.current = 'retry'; }}>Practice again</button>
      <button onClick={() => { practiceChoice.current = 'start'; }}>I’m ready — start game</button>
    </div>}
    <div className="play-controls">
      <button disabled={!canControl || repeatBusy} onClick={() => {
        pausedRef.current = !pausedRef.current; setPaused(pausedRef.current);
      }}>{paused ? 'Resume' : 'Pause'}</button>
      <button disabled={!canControl || repeatBusy} onClick={repeat}>Repeat instruction</button>
      <button disabled={!canControl || repeatBusy} onClick={() => {
        pausedRef.current = false; setPaused(false); skip.current = true; activeController.current?.abort();
      }}>Skip — no penalty</button>
      {onExit && <button onClick={onExit}>End session / change movements</button>}
    </div>
  </div>;
}
