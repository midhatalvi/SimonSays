// Two gestures must be distinguishable. Ambiguous matches never select an answer.
export async function readAnswer(poses, checkPose, { signal, paused = () => false,
  onState = () => {}, reset = () => {}, now = () => performance.now(),
  sleep = ms => new Promise(r => setTimeout(r, ms)), lostLimit = 15000 } = {}) {
  let last = now(), neutralMs = 0, ready = false, lostMs = 0;
  reset();
  while (!signal?.aborted) {
    const current = now(), delta = Math.min(200, current - last); last = current;
    if (paused()) { ready = false; neutralMs = 0; reset(); onState('Paused. Resume when ready.'); await sleep(100); continue; }
    const readings = poses.map(checkPose);
    if (readings.some(p => p.tracking !== true)) {
      lostMs += delta; ready = false; neutralMs = 0; reset();
      onState('Tracking paused. Bring the needed body points into view, or skip.');
      if (lostMs >= lostLimit) return null;
    } else {
      lostMs = 0;
      if (!ready) {
        neutralMs = readings.every(p => p.confidence < .25) ? neutralMs + delta : 0;
        onState('Relax your hands first. Wait for Go.');
        if (neutralMs >= 400) { ready = true; reset(); }
      } else {
        onState('Go — choose A or B. There is no time limit.');
        const index = readings.findIndex(p => p.matched);
        if (index >= 0 && readings[1 - index].confidence < .25) return index;
        if (readings.some(p => p.matched)) onState('I see both gestures. Relax, then try just one.');
      }
    }
    await sleep(100);
  }
  return null;
}
