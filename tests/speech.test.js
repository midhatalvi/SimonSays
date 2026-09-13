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

async function withAudioEnvironment(name, work, { refuseAudio = false } = {}) {
  const previous = { fetch: globalThis.fetch, Audio: globalThis.Audio, window: globalThis.window,
    SpeechSynthesisUtterance: globalThis.SpeechSynthesisUtterance };
  const state = { spoken: [], paused: 0, requested: 0, cancelled: 0 };
  globalThis.fetch = async () => { state.requested++; return { ok: true, blob: async () => new Blob(['audio'], { type: 'audio/mpeg' }) }; };
  globalThis.Audio = class {
    play() { if (refuseAudio) return Promise.reject(Error('playback failed')); queueMicrotask(() => this.onended?.()); return Promise.resolve(); }
    pause() { state.paused++; }
  };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.window = { speechSynthesis: {
    speak(u) { state.spoken.push(u.text); queueMicrotask(() => u.onend?.()); },
    cancel() { state.cancelled++; },
  } };
  try { await work(await import(`../voice/elevenlabs.js?test=${name}`), state); }
  finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
}

test('successful prepared audio completes and releases player', async () => {
  await withAudioEnvironment('playback', async ({ say, prepareSpeech }, state) => {
    await prepareSpeech('ready'); await say('ready');
    assert.equal(state.requested, 1); assert.equal(state.paused, 1); assert.deepEqual(state.spoken, []);
  });
});
test('audio playback rejection falls back to browser speech', async () => {
  await withAudioEnvironment('rejection', async ({ say }, state) => {
    await say('repeat this'); assert.deepEqual(state.spoken, ['repeat this']);
  }, { refuseAudio: true });
});
test('already cancelled speech makes no network or playback request', async () => {
  await withAudioEnvironment('aborted', async ({ say }, state) => {
    const controller = new AbortController(); controller.abort();
    await say('do not speak', { signal: controller.signal });
    assert.equal(state.requested, 0); assert.deepEqual(state.spoken, []);
  });
});
test('aborting while audio plays ends promptly', async () => {
  await withAudioEnvironment('abort-playing', async ({ say }, state) => {
    const controller = new AbortController();
    globalThis.Audio = class {
      play() { queueMicrotask(() => controller.abort()); return Promise.resolve(); }
      pause() { state.paused++; }
    };
    await say('stop now', { signal: controller.signal });
    assert.equal(state.paused, 1); assert.deepEqual(state.spoken, []);
  });
});
test('speech completion has a deadline even when playback never ends', async () => {
  await withAudioEnvironment('stalled-playback', async ({ say }, state) => {
    globalThis.Audio = class {
      play() { return Promise.resolve(); }
      pause() { state.paused++; }
    };
    await say('stuck audio', { maxDurationMs: 20 });
    assert.equal(state.paused, 1);
  });
});
