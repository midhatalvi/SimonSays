import test from 'node:test';
import assert from 'node:assert/strict';
import { judgeRound } from '../engine/gameEngine.js';
const round = { targetPose: 'RIGHT_HAND_UP', simonSays: false, timeLimitSec: 1 };
function run(poseAt, overrides = {}) {
  let time = 0;
  return judgeRound({ ...round, ...overrides.round }, () => poseAt(time), null, {
    now: () => time, sleep: async ms => { time += ms; if (time > 30000) throw Error('Hung round'); },
    ...overrides.options,
  });
}
const neutral = { tracking: true, matched: false, confidence: 0 };
test('missing tracking cannot pass a trick round', async () => {
  const result = await run(() => ({ matched: false, confidence: 0 }), { options: { maxTrackingWaitMs: 500 } });
  assert.equal(result.passed, null); assert.equal(result.reason, 'tracking-timeout');
});
test('loss of tracking cannot fail a movement round', async () => {
  const result = await run(() => ({ tracking: false, confidence: 0 }), {
    round: { simonSays: true }, options: { maxTrackingWaitMs: 500 },
  });
  assert.equal(result.passed, null);
});
test('held-over pose must return to neutral before it can score', async () => {
  const result = await run(t => t < 500 || t >= 1200
    ? { tracking: true, matched: true, confidence: 1 } : neutral, { round: { simonSays: true } });
  assert.equal(result.passed, true); assert.ok(result.reactionMs >= 100);
});
test('visible still player passes full trick window', async () => {
  const result = await run(() => neutral); assert.equal(result.passed, true);
});
test('moving on trick fails after neutral readiness', async () => {
  const result = await run(t => t < 700 ? neutral : { tracking: true, matched: true, confidence: 1 });
  assert.equal(result.passed, false); assert.equal(result.reason, 'trick-move');
});
test('tracking recovery requires neutral and excludes timing metric', async () => {
  const result = await run(t => t < 300 ? { tracking: false } : t < 1000 ? neutral
    : { tracking: true, matched: true, confidence: 1 }, { round: { simonSays: true } });
  assert.equal(result.passed, true); assert.equal(result.reactionMs, null);
});
test('pause consumes no response-window time', async () => {
  let end = 0;
  const result = await run(t => { end = t; return neutral; }, { options: { isPaused: (() => {
    let calls = 0; return () => ++calls <= 20;
  })() } });
  assert.equal(result.passed, true); assert.ok(end >= 3400);
});
test('abort ends round without score', async () => {
  const controller = new AbortController(); controller.abort();
  const result = await run(() => neutral, { options: { signal: controller.signal } });
  assert.equal(result.passed, null); assert.equal(result.reason, 'cancelled');
});
test('mid-round tracking loss does not consume the remaining trick window', async () => {
  let finishAt = 0;
  const result = await run(t => {
    finishAt = t;
    return t >= 800 && t < 1800 ? { tracking: false } : neutral;
  });
  assert.equal(result.passed, true);
  assert.ok(finishAt >= 2900, `window ended prematurely at ${finishAt}`);
});
test('a held pose never scores without a neutral transition', async () => {
  const controller = new AbortController();
  const result = await run(t => {
    if (t >= 2000) controller.abort();
    return { tracking: true, matched: true, confidence: 1 };
  }, { round: { simonSays: true }, options: { signal: controller.signal } });
  assert.equal(result.passed, null); assert.equal(result.reason, 'cancelled');
});
