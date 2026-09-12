// ============================================================================
// /server/tavily — Tavily proxy  (TEAMMATE OWNS THIS)
// ============================================================================
// Vercel serverless function. Keeps TAVILY_API_KEY server-side; the client
// calls this instead of Tavily directly.
//
// Deployed path: /api/tavily  (Vercel maps /api/* to serverless functions;
// you may need to move/symlink this to /api/tavily.js at integration time —
// confirm the api routing with Midhat before changing repo layout.)
//
// Env var needed on Vercel: TAVILY_API_KEY
// ============================================================================

export default async function handler(req, res) {
  // TODO(teammate): read the query, call Tavily with process.env.TAVILY_API_KEY,
  // return trimmed results as JSON.
  res.status(501).json({ error: "tavily proxy not implemented yet" });
}
