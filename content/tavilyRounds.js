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
