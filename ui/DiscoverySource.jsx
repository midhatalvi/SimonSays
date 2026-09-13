import React from 'react';
import { SAFE_ACTIONS } from '../content/discovery.js';

export default function DiscoverySource({ item, movement, explain = false }) {
  return <div className="discovery-source">
    <p>{item.retrieval === 'tavily' ? 'Discovered with Tavily' : 'Curated discovery'} · Source: <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.sourceDomain}</a></p>
    {explain && <details><summary>How this round was created</summary>
      <p>Interest: {item.topic}. {item.retrieval === 'tavily' ? 'Tavily found' : 'Our reviewed collection provides'} this source: {item.sourceTitle}.</p>
      <p>{item.fact}</p><p>Safe movement: {SAFE_ACTIONS[movement?.targetPose]}. A recall question follows the movement rounds.</p>
    </details>}
  </div>;
}
