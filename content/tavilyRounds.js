import { curatedDiscovery, validDiscovery } from './discovery.js';

export async function discoveryForChoice(settings, accepted, signal, load = getDiscovery) {
  if (!settings.discovery || !accepted || signal?.aborted) return null;
  return load(settings.topic, signal);
}

export async function getDiscovery(topic, signal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 14000);
  try {
    const response = await fetch('/api/tavily', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }), signal: controller.signal,
    });
    const data = await response.json();
    if (!signal?.aborted && response.ok && validDiscovery(data.discovery, topic)) return data.discovery;
  } catch { /* Network and API failures use the reviewed local item. */ }
  finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); }
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
  return curatedDiscovery(topic);
}

export async function getLearningQuestions(topic, signal) {
  const response = await fetch('/api/tavily', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }), signal,
  });
  let data;
  try { data = await response.json(); } catch { throw Error('Learning search needs the deployed API. Movement mode is still available.'); }
  if (!response.ok) throw Error(data.error || 'Learning search is unavailable.');
  if (!Array.isArray(data.questions) || !data.questions.length) throw Error('No supported questions found.');
  return data.questions;
}
