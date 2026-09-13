import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPoseTracking, updatePoseHold } from '../vision/poseTracking.js';

const visible = p => p?.visibility >= 0.5;
const landmarks = (...indices) => Array.from({ length: 33 }, (_, i) => ({ visibility: indices.includes(i) ? 1 : 0 }));
test('one-hand touches do not require the unused hand', () => {
  const lm = landmarks(0, 11, 12, 15);
  assert.equal(hasPoseTracking('TOUCH_NOSE', lm, visible), true);
  assert.equal(hasPoseTracking('TOUCH_HEAD', lm, visible), true);
  assert.equal(hasPoseTracking('RIGHT_HAND_UP', lm, visible), false);
  assert.equal(hasPoseTracking('TOUCH_SHOULDERS', lm, visible), false);
});
test('arms-out tracking permits the existing elbow fallback', () => {
  assert.equal(hasPoseTracking('ARMS_OUT', landmarks(11, 12, 13, 14), visible), true);
  assert.equal(hasPoseTracking('ARMS_OUT', landmarks(11, 12, 13), visible), false);
});
test('a repeated frame cannot accumulate confirmation time', () => {
  const first = updatePoseHold(null, 0.9, 100);
  assert.equal(updatePoseHold(first, 0.9, 100).matched, false);
  assert.equal(updatePoseHold(first, 0.9, 300).matched, true);
});
test('jitter and gaps restart the confirmation period', () => {
  let hold = updatePoseHold(null, 0.9, 0);
  hold = updatePoseHold(hold, 0.1, 100);
  hold = updatePoseHold(hold, 0.9, 200);
  assert.equal(hold.matched, false);
  hold = updatePoseHold(hold, 0.9, 500);
  assert.equal(hold.matched, false);
  assert.equal(updatePoseHold(hold, 0.9, 700).matched, true);
});
