import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechCache } from '../voice/elevenlabs.js';
test('preloading and playback share one request', async () => {
  let calls = 0;
  const prepare = createSpeechCache(async () => { calls++; return { ok: true, blob: async () => 'audio' }; });
  assert.deepEqual(await Promise.all([prepare('hello'), prepare('hello')]), ['audio', 'audio']);
  assert.equal(await prepare('hello'), 'audio'); assert.equal(calls, 1);
});
test('temporary speech failure is retryable', async () => {
  let calls = 0;
  const prepare = createSpeechCache(async () => ({ ok: ++calls > 1, blob: async () => 'audio' }));
  assert.equal(await prepare('hello'), null); assert.equal(await prepare('hello'), 'audio');
});
test('speech request timeout releases caller for fallback', async () => {
  const prepare = createSpeechCache((url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(Error('aborted')));
  }), 10);
  assert.equal(await prepare('hello'), null);
});
