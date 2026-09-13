import test from 'node:test';
import assert from 'node:assert/strict';
import { getLearningQuestions } from '../content/tavilyRounds.js';

test('client forwards cancellation without retrying the request', async () => {
  const original=globalThis.fetch, controller=new AbortController(); let calls=0;
  globalThis.fetch=async (url, options) => {
    calls++; assert.equal(url,'/api/tavily'); assert.deepEqual(JSON.parse(options.body),{topic:'space'});
    assert.equal(options.signal,controller.signal);
    return new Promise((resolve,reject) => options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true}));
  };
  try {
    const pending=getLearningQuestions('space',controller.signal); controller.abort();
    await assert.rejects(pending,{name:'AbortError'}); assert.equal(calls,1);
  } finally {globalThis.fetch=original;}
});

test('client surfaces unavailable search and rejects empty or non-JSON responses', async () => {
  const original=globalThis.fetch;
  try {
    for (const fixture of [
      {ok:false,json:async()=>({error:'Return to movement.'})},
      {ok:true,json:async()=>({questions:[]})},
      {ok:false,json:async()=>{throw Error('HTML login page');}},
    ]) {
      globalThis.fetch=async()=>fixture;
      await assert.rejects(getLearningQuestions('space',new AbortController().signal));
    }
  } finally {globalThis.fetch=original;}
});
