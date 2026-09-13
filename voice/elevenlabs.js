// Bounded cache deduplicates in-flight requests. Failed requests can be retried.
export function createSpeechCache(fetcher = fetch, timeoutMs = 5000) {
  const cache = new Map();
  return function prepare(text) {
    if (cache.has(text)) return cache.get(text);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const pending = Promise.resolve().then(() => fetcher('/api/elevenlabs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }), signal: controller.signal,
    })).then(async res => {
      if (!res.ok) throw new Error('Speech unavailable');
      return res.blob();
    }).catch(() => { cache.delete(text); return null; }).finally(() => clearTimeout(timer));
    cache.set(text, pending);
    if (cache.size > 24) cache.delete(cache.keys().next().value);
    return pending;
  };
}
export const prepareSpeech = createSpeechCache();
let stopCurrent = () => {};
export function cancelSpeech() { stopCurrent(); }
export async function say(text, { signal } = {}) {
  if (signal?.aborted) return;
  const blob = await prepareSpeech(text);
  if (signal?.aborted) return;
  if (blob && await playBlob(blob, signal)) return;
  if (!signal?.aborted) await browserSpeak(text, signal);
}
function playBlob(blob, signal) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(blob), audio = new Audio(url);
    let done = false;
    const finish = success => {
      if (done) return; done = true;
      clearTimeout(timer); audio.pause(); URL.revokeObjectURL(url);
      signal?.removeEventListener('abort', abort);
      stopCurrent = () => {}; resolve(success);
    };
    const abort = () => finish(true);
    const timer = setTimeout(() => finish(false), 30000);
    stopCurrent = abort;
    signal?.addEventListener('abort', abort, { once: true });
    audio.onended = () => finish(true); audio.onerror = () => finish(false);
    audio.play().catch(() => finish(false));
  });
}
function browserSpeak(text, signal) {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) return resolve();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      clearTimeout(timer); signal?.removeEventListener('abort', abort);
      stopCurrent = () => {}; resolve();
    };
    const abort = () => { window.speechSynthesis.cancel(); finish(); };
    const timer = setTimeout(abort, 30000);
    stopCurrent = abort;
    signal?.addEventListener('abort', abort, { once: true });
    utterance.onend = finish; utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  });
}
