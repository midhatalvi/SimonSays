import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS, supportedQuestion } from '../content/learningQuestions.js';
import { readAnswer } from '../engine/learningEngine.js';
import handler from '../server/tavily/index.js';
const source = { title: 'Jupiter Facts', url: 'https://science.nasa.gov/jupiter/facts/', content: 'Jupiter is the largest planet in our solar system.' };
test('question requires supporting evidence from an allowed HTTPS source', () => {
  assert.equal(supportedQuestion(TOPICS.space[0], []), null);
  assert.equal(supportedQuestion(TOPICS.space[0], [{...source, content:'Jupiter is interesting.'}]), null);
  assert.equal(supportedQuestion(TOPICS.space[0], [{...source, url:'https://nasa.gov.example.com/'}]), null);
  assert.equal(supportedQuestion(TOPICS.space[0], [{...source, url:'javascript:alert(1)'}]), null);
  const q = supportedQuestion(TOPICS.space[0], [source], () => 1);
  assert.equal(q.answers[q.correct], 'Jupiter'); assert.equal(q.source.excerpt, source.content.slice(0,-1));
});
test('shuffling preserves correct answer and source', () => {
  const q = supportedQuestion(TOPICS.space[0], [source], () => 0);
  assert.equal(q.correct, 1); assert.equal(q.answers[1], 'Jupiter'); assert.equal(q.source.url, source.url);
});
function simulation(trace, options = {}) {
  let t = 0;
  return readAnswer(['a','b'], p => trace(t, p), { now: () => t,
    sleep: async ms => { t += ms; if (t > 20000) throw Error('No completion'); }, ...options });
}
const neutral = { tracking:true, confidence:0, matched:false }, match = {tracking:true, confidence:1, matched:true};
test('exclusive gesture selects the mapped answer', async () => {
  assert.equal(await simulation((t,p) => t > 600 && p === 'b' ? match : neutral), 1);
});
test('ambiguous two-gesture match is not accepted', async () => {
  const result = await simulation((t,p) => t < 500 ? neutral : t < 1000 ? match : p === 'a' ? match : neutral);
  assert.equal(result, 0);
});
test('missing tracking never selects an answer', async () => {
  assert.equal(await simulation(() => ({tracking:false}), {lostLimit:400}), null);
});
test('held pose requires neutral before answering', async () => {
  assert.equal(await simulation((t,p) => p === 'a' && (t < 500 || t > 1100) ? match : neutral), 0);
});
function response() { return { code:200, status(c){this.code=c;return this;}, json(body){this.body=body;return this;}, setHeader(){} }; }
test('API rejects unknown topics and missing configuration', async () => {
  const key = process.env.TAVILY_API_KEY; delete process.env.TAVILY_API_KEY;
  try {
    let res=response(); await handler({method:'POST',body:{topic:'unknown'}},res); assert.equal(res.code,400);
    res=response(); await handler({method:'POST',body:{topic:'space'}},res); assert.equal(res.code,503);
  } finally { if (key !== undefined) process.env.TAVILY_API_KEY=key; }
});
test('API serves supported questions despite partial upstream failure', async () => {
  const key=process.env.TAVILY_API_KEY, oldFetch=globalThis.fetch;
  process.env.TAVILY_API_KEY='synthetic-test-key';
  globalThis.fetch=async (url, options) => JSON.parse(options.body).query.startsWith('Jupiter')
    ? {ok:true,json:async()=>({results:[source]})} : {ok:false};
  try { const res=response(); await handler({method:'POST',body:{topic:'space'}},res);
    assert.equal(res.code,200); assert.equal(res.body.questions.length,1); assert.equal(res.body.questions[0].id,'jupiter');
  } finally { globalThis.fetch=oldFetch; if(key===undefined)delete process.env.TAVILY_API_KEY;else process.env.TAVILY_API_KEY=key; }
});
