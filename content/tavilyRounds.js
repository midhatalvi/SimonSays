// ============================================================================
// /content — Tavily round generation  (TEAMMATE OWNS THIS)
// ============================================================================
// Turns live web content (via the /server/tavily proxy) into trivia /
// reminiscence rounds the engine can play.
//
// Honor the shared Round shape (see /shared/poses.js):
//   { type: "trivia", promptText, targetPose: null, timeLimitSec }
//
// Call the proxy at /api/tavily (never call Tavily directly from the client —
// the key stays server-side).
// ============================================================================

/**
 * TODO(teammate): fetch content from /api/tavily and shape it into rounds.
 *
 * @param {number} count how many trivia rounds to produce
 * @returns {Promise<import("../shared/poses.js").Round[]>}
 */
export async function getTriviaRounds(count = 3) {
  void count;
  // Placeholder — return empty until wired up. Engine handles movement-only.
  return [];
}
const TOPICS = [
  "a fun fact about music from the 1960s",
  "a fun fact about classic movies",
  "an interesting fact that happened on this day in history",
  "a fun fact about a famous vintage car",
  "a fun fact about a classic board game",
];

function pickTopics(count) {
  return [...TOPICS].sort(() => Math.random() - 0.5).slice(0, Math.min(count, TOPICS.length));
}

function toShortLine(text, maxLen = 180) {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  const cut = trimmed.slice(0, maxLen);
  return cut.slice(0, cut.lastIndexOf(" ")) + "...";
}

async function fetchOne(topic) {
  const res = await fetch("/api/tavily", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: topic, max_results: 3 }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return toShortLine(data.answer) || toShortLine(data.results?.[0]?.content);
}

export async function getTriviaRounds(count = 3, timeLimitSec = 8) {
  const lines = await Promise.all(pickTopics(count).map(fetchOne));
  return lines.filter(Boolean).map((line) => ({
    type: "trivia", promptText: line, targetPose: null, timeLimitSec,
  }));
}