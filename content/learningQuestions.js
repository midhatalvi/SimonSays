// Reviewed question templates. Retrieval is required; these are not presented as AI-generated questions.
export const TOPICS = {
  space: [
    { id: 'jupiter', question: 'Which is the largest planet in our solar system?', answers: ['Jupiter', 'Mars'], correct: 0,
      query: 'Jupiter is the largest planet in our solar system', domains: ['nasa.gov'],
      evidence: /Jupiter[^.!?]{0,160}largest planet[^.!?]{0,80}/i },
    { id: 'venus', question: 'Which is the hottest planet in our solar system?', answers: ['Mercury', 'Venus'], correct: 1,
      query: 'Venus is the hottest planet in our solar system', domains: ['nasa.gov'],
      evidence: /Venus[^.!?]{0,160}hottest planet[^.!?]{0,80}/i },
  ],
  animals: [
    { id: 'whale', question: 'Which animal is the largest animal on Earth?', answers: ['Blue whale', 'Elephant'], correct: 0,
      query: 'blue whale largest animal on Earth', domains: ['noaa.gov'],
      evidence: /blue whale[^.!?]{0,100}largest animal[^.!?]{0,80}/i },
    { id: 'octopus', question: 'How many hearts does an octopus have?', answers: ['One', 'Three'], correct: 1,
      query: 'octopuses have three hearts', domains: ['si.edu', 'nhm.ac.uk'],
      evidence: /octopus(?:es)?[^.!?]{0,100}three hearts[^.!?]{0,80}/i },
  ],
};
export function supportedQuestion(template, results, random = Math.random) {
  for (const result of Array.isArray(results) ? results : []) {
    let url;
    try { url = new URL(result.url); } catch { continue; }
    if (url.protocol !== 'https:' || !template.domains.some(d => url.hostname === d || url.hostname.endsWith('.' + d))) continue;
    const content = typeof result.content === 'string' ? result.content.replace(/\s+/g, ' ') : '';
    const match = content.match(template.evidence);
    if (!match) continue;
    const reverse = random() < 0.5;
    return { id: template.id, question: template.question,
      answers: reverse ? [...template.answers].reverse() : template.answers,
      correct: reverse ? 1 - template.correct : template.correct,
      source: { title: String(result.title || url.hostname).slice(0,160), url: url.href,
        excerpt: match[0], retrievedAt: new Date().toISOString() } };
  }
  return null;
}
