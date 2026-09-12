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
