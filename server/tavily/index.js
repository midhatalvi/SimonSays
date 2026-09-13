import { TOPICS, supportedQuestion } from '../../content/learningQuestions.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const topic = req.body?.topic;
  if (!Object.hasOwn(TOPICS, topic)) return res.status(400).json({ error: 'Choose Space or Animals.' });
  const key = process.env.TAVILY_API_KEY;
  if (!key) return res.status(503).json({ error: 'Learning search is not configured. Please use Movement mode for now.' });
  try {
    const results = await Promise.allSettled(TOPICS[topic].map(async template => {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST', signal: AbortSignal.timeout(12000),
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: template.query, include_domains: template.domains,
          max_results: 3, search_depth: 'advanced', include_answer: false }),
      });
      if (!response.ok) throw Error('Search unavailable');
      const data = await response.json();
      return supportedQuestion(template, data.results);
    }));
    const questions = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
    if (!questions.length) return res.status(503).json({ error: 'No supported questions found. Try again or choose another topic.' });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ questions, topic });
  } catch {
    return res.status(503).json({ error: 'Learning search is unavailable. Please try again later.' });
  }
}
