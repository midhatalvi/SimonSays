import React, { useEffect, useRef, useState } from 'react';
import { getLearningQuestions } from '../content/tavilyRounds.js';
import { readAnswer } from '../engine/learningEngine.js';
import { checkPose, getVisionStatus, resetPoseHistory, stopVision } from '../vision/checkPose.js';
import { say, prepareSpeech, cancelSpeech } from '../voice/elevenlabs.js';
const names = { RIGHT_HAND_UP: 'Raise right hand', LEFT_HAND_UP: 'Raise left hand', TOUCH_HEAD: 'Touch head',
  TOUCH_NOSE: 'Touch nose', TOUCH_SHOULDERS: 'Touch shoulders', ARMS_OUT: 'Arms out wide' };
const live = { getLearningQuestions, checkPose, getVisionStatus, resetPoseHistory, stopVision, say, prepareSpeech, cancelSpeech };
export default function LearnScreen({ settings, onExit, onFinish, runtime = live }) {
  const [questions, setQuestions] = useState(null), [error, setError] = useState('');
  const [step, setStep] = useState(2), [result, setResult] = useState(undefined);
  const [status, setStatus] = useState('Finding supporting sources…'), [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false), [repeatBusy, setRepeatBusy] = useState(false);
  const pause = useRef(false), turn = useRef(null), line = useRef(''), totals = useRef({ correct: 0, answered: 0 });
  const poses = settings.poses.slice(0, 2);
  const [buttons, setButtons] = useState(settings.answerMode === 'buttons');
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort(); setError('Discovery search took too long. You can continue moving.'); }, 16000);
    runtime.getLearningQuestions(settings.topic, controller.signal).then(q => { if (!controller.signal.aborted) setQuestions(onFinish ? q.slice(0, 1) : q); }).catch(e => {
      if (!controller.signal.aborted) setError(e.message);
    }).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); turn.current?.abort(); runtime.cancelSpeech(); runtime.stopVision(); };
  }, [settings, runtime]);
  const practice = step < 2;
  const card = questions && (practice ? { question: `Practice: choose ${step === 0 ? 'A' : 'B'}. This is not scored.`,
    answers: ['A', 'B'], correct: step } : questions[step - 2]);
  const finished = questions && step >= questions.length + 2;
  useEffect(() => { if (finished || error) runtime.stopVision(); }, [finished, error, runtime]);
  useEffect(() => {
    if (!card || finished) return;
    const controller = new AbortController(); turn.current = controller;
    const signal = controller.signal;
    setReady(false); setResult(undefined); setPaused(false); pause.current = false;
    let didAnswer = false;
    const accept = answer => {
      if (signal.aborted || didAnswer) return;
      didAnswer = true; setReady(false); setResult(answer);
      if (!practice && answer != null) { totals.current.answered++; if (answer === card.correct) totals.current.correct++; }
      const text = answer == null ? 'Skipped without penalty. Continue when you are ready.' : practice
        ? answer === card.correct ? 'You chose the requested answer. Ready for the next step?' : 'That was the other answer. You can practice again.'
        : answer === card.correct ? `Correct. ${card.answers[card.correct]}. ${card.source.excerpt}` : `The supported answer is ${card.answers[card.correct]}. ${card.source.excerpt}`;
      setStatus(text); void runtime.say(text, { signal });
    };
    controller.accept = accept;
    (async () => {
      if (!buttons) {
        setStatus('Getting the camera ready…'); runtime.checkPose(poses[0]);
        const deadline = Date.now() + 25000;
        while (!signal.aborted && runtime.getVisionStatus().status === 'loading' && Date.now() < deadline) await new Promise(r => setTimeout(r, 100));
        if (signal.aborted) return;
        if (runtime.getVisionStatus().status !== 'ready') { setError('Camera setup failed. Use answer buttons instead, or return to movement.'); return; }
      }
      line.current = `Question round. Choose A or B. No Simon says tricks here. ${card.question} A: ${card.answers[0]}. B: ${card.answers[1]}.`;
      const next = questions[Math.max(0, step - 1)];
      if (next) void runtime.prepareSpeech(`Question round. Choose A or B. No Simon says tricks here. ${next.question} A: ${next.answers[0]}. B: ${next.answers[1]}.`);
      setStatus('Listen or read the question.'); await runtime.say(line.current, { signal });
      if (signal.aborted) return;
      setReady(true);
      if (buttons) setStatus('Choose A or B. There is no time limit.');
      else accept(await readAnswer(poses, runtime.checkPose, { signal, paused: () => pause.current,
        onState: setStatus, reset: runtime.resetPoseHistory }));
    })().catch(() => { if (!signal.aborted) setError('This round could not start. Return to setup and try again.'); });
    return () => { controller.abort(); runtime.cancelSpeech(); };
  }, [questions, step, runtime, buttons]);
  function skip() {
    turn.current?.accept?.(null); turn.current?.abort(); runtime.cancelSpeech();
  }
  async function repeat() {
    pause.current = true; setPaused(true); setRepeatBusy(true); setStatus('Repeating the question. Answers are paused.');
    await runtime.say(line.current, { signal: turn.current?.signal });
    if (!turn.current?.signal.aborted) { setRepeatBusy(false); setStatus('Paused. Select Resume when you are ready to answer.'); }
  }
  return <main className="screen setup-screen learn-screen">
    <p className="eyebrow">A MOMENT TO EXPLORE · NO TIME LIMIT</p><h1>Discovery break</h1>
    <p>This is a question round—choose A or B. No Simon says tricks here. Take your time.</p>
    <button onClick={() => onFinish && totals.current.answered ? onFinish({ ...totals.current }) : onExit()}>{onFinish ? 'Return to movement' : 'Back to setup'}</button>
    {!buttons && questions && result === undefined && <button onClick={() => { turn.current?.abort(); runtime.cancelSpeech(); runtime.stopVision(); setError(''); setButtons(true); setStep(s => Math.max(2, s)); }}>Use answer buttons instead</button>}
    {error ? <p role="alert">{error}</p> : finished ? <>
      <h2>Learning session complete</h2><p>{totals.current.correct} correct from {totals.current.answered} answered questions. Practice and skips were not scored.</p>
      <p>This score is not a measure of health or ability.</p><ul>{questions.map(q => <li key={q.id}><a href={q.source.url} target="_blank" rel="noopener noreferrer">{q.source.title}</a></li>)}</ul>
    </> : !card ? <p role="status">{status}</p> : <>
      {!buttons && <div id="camera-preview-slot" aria-label="Camera preview" />}
      <p>{practice ? `Practice ${step + 1} of 2` : `Question ${step - 1} of ${questions.length} · ${settings.topic}`}</p>
      <h2>{card.question}</h2>
      <div className="play-controls">{card.answers.map((answer, i) => <div key={i} className="answer-card">
        <strong>{i === 0 ? 'A' : 'B'}: {answer}</strong>
        {buttons ? <button disabled={!ready || paused || result !== undefined} onClick={() => turn.current?.accept?.(i)}>Choose {i === 0 ? 'A' : 'B'}</button>
          : <p>{names[poses[i]]}</p>}
      </div>)}</div>
      <p role="status">{status}</p>
      {result === undefined ? <div className="play-controls">
        <button disabled={!ready || repeatBusy} onClick={() => { pause.current = !pause.current; setPaused(pause.current); setStatus(pause.current ? 'Paused. Resume when ready.' : 'Choose A or B.'); }}>{paused ? 'Resume' : 'Pause'}</button>
        <button disabled={!ready || repeatBusy} onClick={repeat}>Repeat question</button>
        <button disabled={!ready || repeatBusy} onClick={skip}>Skip — no penalty</button>
      </div> : <>
        {!practice && <section aria-label="Answer evidence"><p>Answer: {card.answers[card.correct]}</p>
          <details><summary>Explore this fact</summary><blockquote>{card.source.excerpt}</blockquote>
          <a href={card.source.url} target="_blank" rel="noopener noreferrer">Read source: {card.source.title}</a>
          <p>{card.source.synthetic ? 'Synthetic example — no live retrieval' : `Retrieved through Tavily · ${new Date(card.source.retrievedAt).toLocaleDateString()}`}</p></details>
        </section>}
        <div className="play-controls">
          {practice && <button onClick={() => { setQuestions([...questions]); }}>Practice again</button>}
          <button onClick={() => { if (onFinish && !practice) onFinish({ ...totals.current }); else { setRepeatBusy(false); setStep(s => s + 1); } }}>{onFinish && !practice ? 'Back to movement' : step === 1 ? 'Start question' : 'Continue'}</button>
        </div>
      </>}
    </>}
  </main>;
}
