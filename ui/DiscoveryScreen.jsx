import React, { useEffect, useState } from 'react';
import { getDiscovery, discoveryForChoice } from '../content/tavilyRounds.js';
import { curatedDiscovery, discoveryMovement } from '../content/discovery.js';
import DiscoverySource from './DiscoverySource.jsx';

export default function DiscoveryScreen({ settings, runtime, onContinue, onSkip }) {
  const [item, setItem] = useState(null), [narrated, setNarrated] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      let found = await discoveryForChoice(settings, true, controller.signal, runtime.getDiscovery || getDiscovery);
      let movement = discoveryMovement(found, settings.poses, settings.seconds);
      if (!movement) {
        found = curatedDiscovery(settings.topic);
        movement = discoveryMovement(found, settings.poses, settings.seconds);
      }
      if (controller.signal.aborted) return;
      if (!movement) { onSkip(); return; }
      setItem({ ...found, movement });
      await runtime.say(`${found.fact} ${movement.cue} We'll use one of your chosen movements next, and remember this discovery later.`, { signal: controller.signal });
      if (!controller.signal.aborted) setNarrated(true);
    })().catch(() => { if (!controller.signal.aborted) onSkip(); });
    return () => { controller.abort(); runtime.cancelSpeech(); };
  }, [settings, runtime]);
  return <main className="screen discovery-offer">
    <h1>A little discovery</h1>
    {!item ? <p role="status">Finding something for you…</p> : <>
      <p className="discovery-fact">{item.fact}</p>
      <p>{item.movement.cue}</p>
      <DiscoverySource item={item} movement={item.movement} explain />
      <button className="big-btn" disabled={!narrated} onClick={() => onContinue(item)}>Let’s move</button>
    </>}
    <button onClick={onSkip}>Skip discovery</button>
  </main>;
}
