import { TOPICS, supportedQuestion } from './learningQuestions.js';

// Reviewed language, not instructions or prose copied from search results.
const FACTS = {
  jupiter: ['Jupiter is the largest planet in our solar system.', 'Jupiter', 'https://science.nasa.gov/jupiter/jupiter-facts/'],
  venus: ['Venus is the hottest planet in our solar system.', 'Venus', 'https://science.nasa.gov/venus/'],
  whale: ['The blue whale is the largest animal on Earth.', 'Blue whale', 'https://www.fisheries.noaa.gov/species/blue-whale'],
  octopus: ['An octopus has three hearts.', 'Octopus', 'https://www.nhm.ac.uk/discover/octopuses-keep-surprising-us-here-are-eight-examples-how.html'],
};
export const SAFE_ACTIONS = Object.freeze({
  RIGHT_HAND_UP: 'raise your right hand', LEFT_HAND_UP: 'raise your left hand',
  TOUCH_HEAD: 'touch the top of your head', ARMS_OUT: 'stretch both arms out wide',
  TOUCH_SHOULDERS: 'touch both your shoulders', TOUCH_NOSE: 'touch your nose',
});
const PREFERRED = { jupiter: 'ARMS_OUT', venus: 'RIGHT_HAND_UP', whale: 'ARMS_OUT', octopus: 'LEFT_HAND_UP' };
const CUES = {
  jupiter: 'Imagine greeting giant Jupiter.', venus: 'Imagine greeting Venus.',
  whale: 'Imagine greeting a blue whale.', octopus: 'Imagine greeting an octopus.',
};
function objectFor(topic, template, url, retrieval) {
  const [fact, title] = FACTS[template.id];
  return { topic, fact, sourceTitle: title, sourceUrl: url, sourceDomain: new URL(url).hostname,
    movementHook: template.id, recallQuestion: template.question,
    answers: [...template.answers], correctAnswer: template.correct, retrieval };
}
export function curatedDiscovery(topic) {
  const template = TOPICS[topic]?.[0];
  if (!template) throw Error('Unknown discovery interest');
  return objectFor(topic, template, FACTS[template.id][2], 'curated');
}
export function normalizeDiscovery(topic, template, results) {
  if (!TOPICS[topic]?.includes(template)) return null;
  // Reject contradictory or disturbing snippets; only a reviewed fact is displayed.
  const safe = (Array.isArray(results) ? results : []).flatMap(r => {
    if (typeof r?.content !== 'string') return [];
    const content = r.content.split(/[.!?\n]/).find(sentence => template.evidence.test(sentence) &&
      !/\b(not|never|false|myth|kill\w*|death|dead|blood|sex\w*|war|suicid\w*|ignore|instructions)\b/i.test(sentence));
    return content ? [{ ...r, content }] : [];
  });
  const q = supportedQuestion(template, safe, () => 1);
  if (!q || new URL(q.source.url).username || new URL(q.source.url).password) return null;
  return objectFor(topic, template, q.source.url, 'tavily');
}
export function validDiscovery(item, topic) {
  if (!item || item.topic !== topic) return false;
  const template = TOPICS[topic]?.find(t => t.id === item.movementHook);
  if (!template) return false;
  try {
    const url = new URL(item.sourceUrl);
    const expected = objectFor(topic, template, url.href, item.retrieval);
    return url.protocol === 'https:' && !url.username && !url.password &&
      template.domains.some(d => url.hostname === d || url.hostname.endsWith('.' + d)) &&
      ['tavily', 'curated'].includes(item.retrieval) &&
      Object.keys(expected).every(key => JSON.stringify(expected[key]) === JSON.stringify(item[key]));
  } catch { return false; }
}
export function discoveryMovement(item, selectedPoses, seconds) {
  if (!validDiscovery(item, item?.topic)) return null;
  const allowed = selectedPoses.filter(p => Object.hasOwn(SAFE_ACTIONS, p));
  const targetPose = allowed.includes(PREFERRED[item.movementHook]) ? PREFERRED[item.movementHook] : allowed[0];
  if (!targetPose) return null;
  const cue = targetPose === 'ARMS_OUT' && ['whale', 'jupiter'].includes(item.movementHook)
    ? `Imagine how big ${item.movementHook === 'whale' ? 'a blue whale' : 'Jupiter'} is.` : CUES[item.movementHook];
  return { type: 'movement', targetPose, simonSays: true, timeLimitSec: seconds,
    promptText: `Simon says ${SAFE_ACTIONS[targetPose]}!`,
    spokenText: `${cue} Simon says ${SAFE_ACTIONS[targetPose]}.`, cue };
}
export function recallCard(item) {
  return { id: item.movementHook, question: `Remember our discovery? ${item.recallQuestion}`,
    answers: item.answers, correct: item.correctAnswer,
    source: { title: item.sourceTitle, url: item.sourceUrl, excerpt: item.fact } };
}
