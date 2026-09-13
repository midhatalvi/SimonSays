import React, { useEffect, useRef, useState } from 'react';
import { buildRounds, judgeRound, reactionFor } from '../engine/gameEngine.js';
import { checkPose, getVisionStatus, resetPoseHistory, stopVision } from '../vision/checkPose.js';
import { say, prepareSpeech, cancelSpeech } from '../voice/elevenlabs.js';
import LearnScreen from './LearnScreen.jsx';
import { getLearningQuestions, getDiscovery } from '../content/tavilyRounds.js';
import { discoveryMovement } from '../content/discovery.js';
import SimonCharacter from './SimonCharacter.jsx';
import { STARTING_LIVES, summarizeSession } from '../engine/sessionScore.js';
import DiscoveryScreen from './DiscoveryScreen.jsx';
import DiscoverySource from './DiscoverySource.jsx';

const liveRuntime = { getLearningQuestions, checkPose, getVisionStatus, resetPoseHistory, stopVision, say, prepareSpeech, cancelSpeech };
const wait = ms => new Promise(r => setTimeout(r, ms));
const labels = {
  neutral: 'Lower your hands. Keep them in view.',
  active: 'Go — only if Simon says.',
  'tracking-lost': 'Move into view so Simon can see the selected movement. The session ends after 10 seconds without detection.',
  paused: 'Paused. Take your time.',
};

export default function GameScreen({ onDone, settings, onExit, runtime = liveRuntime }) {
  const { checkPose, getVisionStatus, resetPoseHistory, stopVision, say, prepareSpeech, cancelSpeech } = runtime;
  const [discovery, setDiscovery] = useState(null);
  const [sessionDiscovery, setSessionDiscovery] = useState(null);
  const [startFact, setStartFact] = useState(null);
  const discovered = useRef(null);
  const discoveryChoice = useRef(null), discoveryResult = useRef(null);
  const [prompt, setPrompt] = useState('Getting the camera ready…');
  const [status, setStatus] = useState('Loading the movement detector…');
  const [roundNumber, setRoundNumber] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [expression, setExpression] = useState('happy');
  const [countdown, setCountdown] = useState(null);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [detectionEnded, setDetectionEnded] = useState(false);
  const [repeatBusy, setRepeatBusy] = useState(false);
  const [canControl, setCanControl] = useState(false);
  const pausedRef = useRef(false), activeController = useRef(null), session = useRef(null);
  const command = useRef(''), doneRef = useRef(onDone), skip = useRef(false);
  doneRef.current = onDone;

  useEffect(() => {
    setError(false); setCameraReady(false); setDetectionEnded(false);
    setLives(STARTING_LIVES); setRoundNumber(0); setExpression('happy');
    discovered.current = null; discoveryResult.current = null; setSessionDiscovery(null);
    const controller = new AbortController(); session.current = controller;
    const signal = controller.signal;
    let running = false;
    // Defer startup so React's development remount cancels before requesting a camera.
    const timer = setTimeout(async () => {
      running = true;
      const rounds = buildRounds(6, settings.seconds, settings.poses).map(r => ({ ...r, timeLimitSec: settings.seconds }));
      void prepareSpeech(rounds[0].spokenText);
      checkPose(rounds[0].targetPose);
      const deadline = Date.now() + 25000;
      while (!signal.aborted && getVisionStatus().status === 'loading' && Date.now() < deadline) await wait(100);
      if (signal.aborted) return;
      if (getVisionStatus().status !== 'ready') { setError(true); stopVision(); return; }
      setCameraReady(true);
      // Start-of-game discovery: teach one fact now, then check recall at the break.
      if (settings.discovery && !signal.aborted) {
        try {
          const found = await getDiscovery(settings.topic, signal);
          const item = { ...found, movement: discoveryMovement(found, settings.poses, settings.seconds) || null };
          discovered.current = item; setSessionDiscovery(item); setStartFact(item);
          setDiscovery('startfact');
          await say(`Before we begin, a little discovery. ${found.fact} Try to remember it. I'll ask you about it soon.`, { signal });
          if (signal.aborted) return;
          await wait(5000);
          if (signal.aborted) return;
          setDiscovery(null);
        } catch { setDiscovery(null); }
      }
      setPrompt('Let’s stay sharp together.');
      setStatus('“Simon says…”: do the move. Otherwise, stay still. You have 3 lives; a slip costs one.');
      await say('When I say Simon says, do the move. Otherwise, stay still and keep your hands in view. You have three lives. A slip costs one. Let’s stay sharp together.', { signal });
      for (const count of [3, 2, 1]) {
        if (signal.aborted) return;
        setPrompt(`Get ready… ${count}`);
        await wait(700);
      }
      const results = [];
      const sessionRounds = rounds;
      for (let index = 0; index < sessionRounds.length; index++) {
        const round = sessionRounds[index];
        if (signal.aborted) break;
        while (pausedRef.current && !signal.aborted) await wait(100);
        if (signal.aborted) break;
        setRoundNumber(index + 1); setCountdown(null);
        setExpression('happy');
        command.current = round.spokenText || round.promptText;
        setPrompt('Ready for the next move?');
        setStatus('Relax your hands so Simon can get ready.');
        const next = rounds[index + 1];
        if (next) void prepareSpeech(next.spokenText || next.promptText);
        const positive = reactionFor(true, round.simonSays);
        const negative = reactionFor(false, round.simonSays);
        const unscored = 'No score for this round. Let’s try another.';
        void prepareSpeech(positive);
        void prepareSpeech(negative);
        void prepareSpeech(unscored);
        const roundController = new AbortController(); activeController.current = roundController;
        const abortRound = () => roundController.abort();
        signal.addEventListener('abort', abortRound, { once: true });
        skip.current = false; setCanControl(true);
        let instructionSpeech = Promise.resolve();
        const result = await judgeRound(round, checkPose, setCountdown, {
          maxTrackingWaitMs: 10000, signal: roundController.signal, isPaused: () => pausedRef.current,
          reset: resetPoseHistory, onState: state => setStatus(state === 'tracking-lost'
            ? `${getVisionStatus().trackingHint || 'Move into view.'} 10 seconds to reconnect.`
            : labels[state]),
          onReady: async () => {
            setPrompt(round.promptText);
            setStatus('Listen, then move.');
            instructionSpeech = say(command.current, { signal: roundController.signal });
            await instructionSpeech;
          },
        });
        await instructionSpeech;
        signal.removeEventListener('abort', abortRound);
        setCanControl(false); setCountdown(null);
        if (signal.aborted) break;
        if (skip.current) result.reason = 'skipped';
        if (result.reason === 'tracking-timeout' || result.reason === 'readiness-timeout') {
          stopVision(); cancelSpeech(); setCameraReady(false); setDetectionEnded(result.reason);
          return;
        }
        results.push(result);
        const summary = summarizeSession(results);
        setLives(summary.lives);
        setExpression(result.passed === true ? 'cheer' : result.passed === false ? 'oops' : 'happy');
        const feedback = result.passed == null ? unscored : result.passed ? positive : negative;
        setStatus(result.passed === false ? `${feedback} ${summary.lives} ${summary.lives === 1 ? 'life' : 'lives'} left.` : feedback);
        await say(feedback, { signal });
        if (summary.eliminated) break;
        if (index === 1 && settings.discovery && discovered.current && !signal.aborted) {
          stopVision(); setCameraReady(false);
          discoveryChoice.current = null;
          setDiscovery('recall'); // memory check on the start-of-game fact
          while (!discoveryChoice.current && !signal.aborted) await wait(100);
          if (signal.aborted) break;
          setDiscovery(null);
          // Let the discovery screen release its detector before movement resumes.
          await wait(100);
          if (signal.aborted) break;
          pausedRef.current = false; setPaused(false);
          setStatus('Getting your camera ready again…');
          checkPose(settings.poses[0]);
          const reconnectDeadline = Date.now() + 25000;
          while (!signal.aborted && getVisionStatus().status === 'loading' && Date.now() < reconnectDeadline) await wait(100);
          if (signal.aborted) break;
          if (getVisionStatus().status !== 'ready') { setError(true); stopVision(); return; }
          setCameraReady(true);
          setStatus('Back to movement. Listen for Simon says.');
          await say('Back to movement. Follow the instruction only if Simon says.', { signal });
        }
      }
      if (!signal.aborted) {
        stopVision();
        doneRef.current({ ...summarizeSession(results), discovery: discoveryResult.current });
      }
    }, 0);
    return () => {
      clearTimeout(timer); controller.abort(); activeController.current?.abort(); cancelSpeech();
      if (running) stopVision();
    };
  }, [settings, runtime, attempt]);

  async function repeat() {
    pausedRef.current = true; setPaused(true); setRepeatBusy(true);
    await say(command.current, { signal: session.current?.signal });
    if (!session.current?.signal.aborted) setRepeatBusy(false);
  }
  function finishDiscovery(summary = null) {
    if (discovery === 'recall' && discovered.current && !discoveryChoice.current) {
      const previous = discoveryResult.current || { correct: 0, answered: 0, items: [] };
      discoveryResult.current = {
        correct: previous.correct + (summary?.correct || 0),
        answered: previous.answered + (summary?.answered || 0),
        items: [...previous.items, discovered.current], item: discovered.current,
      };
    }
    setDiscovery(null); discoveryChoice.current = 'continue';
  }
  if (detectionEnded) return <main className="screen camera-error"><SimonCharacter expression="oops"/><p className="eyebrow">SESSION ENDED · CAMERA OFF</p><h1>{detectionEnded === 'readiness-timeout' ? 'Let’s adjust your starting position' : 'Simon couldn’t keep you in view'}</h1><p>{detectionEnded === 'readiness-timeout' ? 'Simon could not confirm a relaxed starting position within 10 seconds. Lower your hands below your shoulders, keeping them in the camera frame.' : 'The camera could not reliably see the body points needed for your movement within 10 seconds. Check that your head, shoulders, and hands fit in the frame.'}</p><p>Your camera is now off. Try again or choose a different movement.</p>{onExit && <button className="big-btn" onClick={onExit}>Back to setup</button>}</main>;
  if (discovery === 'offer') return <main className="screen discovery-offer"><p className="eyebrow">DISCOVERY · YOUR CHOICE</p><SimonCharacter />
    <h1>Let curiosity lead the next move.</h1>
    <p>Discover, move, then remember. Recall never costs a life.</p>
    <button className="big-btn" onClick={() => setDiscovery('fact')}>Explore {settings.topic}</button>
    <button onClick={() => finishDiscovery()}>Keep moving</button>
    {onExit && <button onClick={onExit}>End session</button>}
  </main>;
  if (discovery === 'fact') return <DiscoveryScreen settings={settings} runtime={runtime}
    onSkip={() => finishDiscovery()} onContinue={item => {
      discovered.current = item; setSessionDiscovery(item); finishDiscovery();
    }} />;
  if (discovery === 'startfact') return <main className="screen learn-screen">
    <div className="discovery-modal-backdrop"><div className="discovery-modal" role="dialog" aria-live="polite">
      <p className="modal-verdict">A little discovery</p>
      <blockquote>{startFact?.fact}</blockquote>
      {startFact && <DiscoverySource item={startFact} movement={startFact.movement} />}
      <p className="auto-advance-note">Starting in a few seconds…</p>
    </div></div>
  </main>;
  if (discovery === 'recall') return <LearnScreen settings={settings} runtime={runtime} discoveryItem={sessionDiscovery}
    onExit={() => finishDiscovery()} onFinish={finishDiscovery} />;
  if (error) return <div className="screen camera-error"><SimonCharacter expression="oops"/><p className="eyebrow">LET’S GET YOU CONNECTED</p><h1>Camera setup needs another try</h1>
    <p>Allow camera access in your browser and make sure the camera is available. Then try again. You have not lost any points.</p>
    <button className="big-btn" onClick={() => setAttempt(value => value + 1)}>Try again</button>
    {onExit && <button onClick={onExit}>Back to setup</button>}</div>;
  return <main className="session-layout">
    <aside className="camera-panel"><div className="camera-panel-heading"><strong>Your camera</strong><span>{cameraReady ? "Connected" : "Connecting…"}</span></div><div className="camera-window"><div className="camera-placeholder">Camera preview</div><div id="camera-preview-slot" aria-label="Live camera preview" /></div><p>Head, shoulders, and hands in view.</p><details className="quiet-help"><summary>Rules & privacy</summary><p>“Simon says…” — move. Otherwise, stay still. A slip costs one life.</p><p>Camera frames stay on your device. No microphone needed.</p></details></aside><div className="screen fair-game">
    <p className="round-label">{!cameraReady ? 'Camera setup' : roundNumber === 0 ? 'How to play' : `Round ${roundNumber} of 6`}</p>
    {cameraReady && <p className="lives-display" role="status" aria-label={`${lives} lives left`}><span aria-hidden="true">{'♥'.repeat(lives)}{'♡'.repeat(STARTING_LIVES - lives)}</span> <span>{lives} {lives === 1 ? 'life' : 'lives'} left</span></p>}
    <SimonCharacter expression={expression} />
    <h1 className="instruction">{prompt}</h1>
    <p role="status" aria-live="polite">{status}</p>
    {sessionDiscovery && <><p>{roundNumber === 3 ? sessionDiscovery.movement.cue : ''}</p><DiscoverySource item={sessionDiscovery} movement={sessionDiscovery.movement} explain /></>}
    {countdown != null && <p aria-label="Seconds remaining">{countdown}s remaining</p>}
    <div className="play-controls" aria-label="Session controls">
      <button disabled={!canControl || repeatBusy} onClick={() => {
        pausedRef.current = !pausedRef.current; setPaused(pausedRef.current);
      }}>{paused ? 'Resume' : 'Pause'}</button>
      <button disabled={!canControl || repeatBusy} onClick={repeat}>Repeat</button>
      <button disabled={!canControl || repeatBusy} onClick={() => {
        pausedRef.current = false; setPaused(false); skip.current = true; activeController.current?.abort();
      }}>Skip — no penalty</button>
      {onExit && <button onClick={onExit}>End game</button>}
    </div>
  </div></main>;
}
