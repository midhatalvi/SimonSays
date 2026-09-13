import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeSession } from '../engine/sessionScore.js';

test('third slip ends the session with zero lives', () => {
  const results = [{ passed: false }, { passed: true, reactionMs: 600 }, { passed: false }];
  assert.equal(summarizeSession(results).lives, 1);
  assert.equal(summarizeSession(results).eliminated, false);
  const summary = summarizeSession([...results, { passed: false }]);
  assert.equal(summary.lives, 0);
  assert.equal(summary.eliminated, true);
  assert.equal(summary.score, 1);
  assert.equal(summary.roundsPlayed, 4);
  assert.deepEqual(summary.reactions, [600]);
});
test('skips and tracking interruptions never take a life', () => {
  const summary = summarizeSession([{ passed: null, reason: 'skipped' }, { passed: null, reason: 'tracking-timeout' }]);
  assert.equal(summary.lives, 3);
  assert.equal(summary.total, 0);
  assert.equal(summary.unscored, 2);
});
test('six successful rounds preserve all lives', () => {
  const summary = summarizeSession(Array.from({ length: 6 }, () => ({ passed: true })));
  assert.equal(summary.score, 6);
  assert.equal(summary.lives, 3);
  assert.equal(summary.eliminated, false);
});
