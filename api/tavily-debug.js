// TEMPORARY diagnostic — remove after checking. Never returns the key itself.
export default async function handler(req, res) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return res.status(200).json({ keyPresent: false });
  try {
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Jupiter largest planet",
        max_results: 3,
        search_depth: "advanced",
        include_domains: ["nasa.gov"],
      }),
    });
    const body = await r.text();
    res.status(200).json({
      keyPresent: true,
      keyPrefix: key.slice(0, 4),
      upstreamStatus: r.status,
      bodySnippet: body.slice(0, 300),
    });
  } catch (e) {
    res.status(200).json({ keyPresent: true, fetchError: String(e).slice(0, 200) });
  }
}
