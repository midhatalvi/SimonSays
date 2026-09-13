import { TOPICS, supportedQuestion } from '../../content/learningQuestions.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const topic = req.body?.topic;
  if (!Object.hasOwn(TOPICS, topic)) return res.status(400).json({ error: 'Choose Space or Animals.' });
  const key = process.env.TAVILY_API_KEY?.trim();
  if (!key) return res.status(503).json({ error: 'Discovery search is not configured. You can return to movement.' });
  try {
    // One question is shown per break. Search the second template only when needed.
    // Both attempts share a deadline, so fallback cannot double the waiting time.
    const signal = AbortSignal.timeout(12000);
    for (const template of TOPICS[topic]) {
      if (signal.aborted) break;
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST', signal,
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: template.query, include_domains: template.domains,
            max_results: 3, search_depth: 'advanced', include_answer: false }),
        });
        if (!response.ok) continue;
        const data = await response.json();
        const question = supportedQuestion(template, data.results);
        if (!question) continue;
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ questions: [question], topic });
      } catch {
        // An unavailable or malformed result must not become an unsupported fact.
      }
    }
    return res.status(503).json({ error: 'No supported question is available. Return to movement and try discovery another time.' });
  } catch {
    return res.status(503).json({ error: 'Learning search is unavailable. Please try again later.' });
  }
}
