import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePose } from '../vision/checkPose.js';

function body() {
  const lm = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0 }));
  for (const [i, x, y] of [[0,.5,.25],[7,.55,.25],[8,.45,.25],[11,.6,.45],[12,.4,.45],
    [13,.65,.6],[14,.35,.6],[15,.65,.75],[16,.35,.75],[19,.65,.78],[20,.35,.78]])
    lm[i] = { x, y, visibility: 1 };
  return lm;
}
const move = (lm, i, x, y) => { lm[i] = { x, y, visibility: 1 }; };
const read = (target, lm) => evaluatePose(target, lm, 1);
const poses = ['LEFT_HAND_UP','RIGHT_HAND_UP','TOUCH_HEAD','TOUCH_NOSE','TOUCH_SHOULDERS','ARMS_OUT'];

test('relaxed seated upper body is ready for all six movements and matches none', () => {
  for (const pose of poses) {
    const r = read(pose, body());
    assert.equal(r.tracking, true, pose);
    assert.equal(r.ready, true, pose);
    assert.ok(r.confidence < .35, pose);
  }
});
test('nose touch accepts either fingertip when the wrist is away from the face', () => {
  for (const finger of [19,20]) {
    const lm = body(); move(lm,finger,.5,.25);
    assert.ok(read('TOUCH_NOSE',lm).confidence >= .55);
    assert.equal(read('TOUCH_NOSE',lm).ready,false);
  }
});
test('an unseen wrist does not hide a clearly visible fingertip touch', () => {
  const lm = body(); lm[15].visibility=0; lm[16].visibility=0;
  move(lm,19,.5,.25);
  assert.equal(read('TOUCH_NOSE',lm).tracking,true);
  assert.ok(read('TOUCH_NOSE',lm).confidence >= .55);
});
test('top-of-head touch matches while a nose touch is not a head touch', () => {
  const lm = body(); move(lm,19,.5,.18);
  assert.ok(read('TOUCH_HEAD',lm).confidence >= .55);
  move(lm,19,.5,.25);
  assert.ok(read('TOUCH_HEAD',lm).confidence < .55);
});
test('each raised hand is specific to the requested side', () => {
  const lm = body(); move(lm,15,.65,.28);
  assert.ok(read('LEFT_HAND_UP',lm).confidence >= .55);
  assert.ok(read('RIGHT_HAND_UP',lm).confidence < .35);
  assert.equal(read('RIGHT_HAND_UP',lm).ready,true);
});
test('either hand raise tolerates an obscured wrist with a visible raised finger', () => {
  for (const [pose,wrist,finger] of [['LEFT_HAND_UP',15,19],['RIGHT_HAND_UP',16,20]]) {
    const lm=body(); lm[wrist].visibility=0; move(lm,finger,lm[finger].x,.28);
    const reading=read(pose,lm);
    assert.equal(reading.tracking,true); assert.ok(reading.confidence >= .55);
    assert.equal(reading.ready,false);
    move(lm,finger,lm[finger].x,.45);
    assert.ok(read(pose,lm).confidence < .35);
    lm[finger].visibility=0;
    assert.equal(read(pose,lm).tracking,false);
  }
});
test('relaxed wrist permits readiness even with fingers pointing upward', () => {
  for (const [pose,wrist,finger] of [['LEFT_HAND_UP',15,19],['RIGHT_HAND_UP',16,20]]) {
    const lm=body(); move(lm,wrist,lm[wrist].x,.48); move(lm,finger,lm[finger].x,.4);
    assert.equal(read(pose,lm).ready,true);
    assert.equal(read(pose,lm).confidence,0);
  }
});
test('both shoulder touches support crossed and uncrossed hands', () => {
  for (const [a,b] of [[.6,.4],[.4,.6]]) {
    const lm=body(); move(lm,19,a,.45); move(lm,20,b,.45);
    assert.ok(read('TOUCH_SHOULDERS',lm).confidence >= .55);
    lm[20].visibility=0;
    assert.ok(read('TOUCH_SHOULDERS',lm).confidence < .55);
  }
});
test('arms out accepts comfortable outward reach but rejects crossed arms', () => {
  const lm=body(); move(lm,15,.82,.45); move(lm,16,.18,.45);
  assert.ok(read('ARMS_OUT',lm).confidence >= .55);
  move(lm,15,.18,.45); move(lm,16,.82,.45);
  assert.ok(read('ARMS_OUT',lm).confidence < .35);
});
test('equivalent portrait and landscape coordinates yield the same score', () => {
  const lm=body(); move(lm,19,.5,.26);
  const expected=read('TOUCH_NOSE',lm).confidence;
  for (const aspect of [4/3,3/4,16/9]) {
    const scaled=lm.map(p=>({...p,x:p.x/aspect}));
    assert.ok(Math.abs(evaluatePose('TOUCH_NOSE',scaled,aspect).confidence-expected)<1e-8);
  }
});
test('missing shoulders and non-finite landmarks cannot score', () => {
  const lm=body(); lm[11].x=NaN;
  for (const pose of poses) assert.equal(read(pose,lm).tracking,false);
});
