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
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const key = process.env.TAVILY_API_KEY;
  if (!key) {
    res.status(500).json({ error: "TAVILY_API_KEY not set" });
    return;
  }
  const { query, max_results } = req.body || {};
  if (!query) {
    res.status(400).json({ error: "missing query" });
    return;
  }

  const r = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: max_results || 5,
      include_answer: true, // short synthesized line, good for TTS
    }),
  });

  if (!r.ok) {
    res.status(r.status).json({ error: "tavily request failed" });
    return;
  }
  res.status(200).json(await r.json());
}