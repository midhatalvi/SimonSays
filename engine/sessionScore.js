export const STARTING_LIVES = 3;
export function summarizeSession(results) {
  const scored = results.filter(result => result.passed != null);
  const lives = Math.max(0, STARTING_LIVES - scored.filter(result => result.passed === false).length);
  return {
    score: scored.filter(result => result.passed === true).length,
    total: scored.length,
    roundsPlayed: results.length,
    lives,
    eliminated: lives === 0,
    unscored: results.length - scored.length,
    reactions: scored.filter(result => result.passed && result.reactionMs != null).map(result => result.reactionMs),
  };
}
