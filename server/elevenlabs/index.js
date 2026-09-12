// ============================================================================
// /server/elevenlabs — ElevenLabs TTS proxy  (MIDHAT)
// ============================================================================
// Vercel serverless function. Keeps ELEVENLABS_API_KEY server-side; the client
// (/voice) POSTs { text } and gets audio back.
//
// Deployed path: /api/elevenlabs  (at integration, move/symlink to
// /api/elevenlabs.js so Vercel routes it).
//
// Env vars on Vercel: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (optional)
// ============================================================================

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // default: Rachel

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  // Accept the standard name or the one set in the Vercel dashboard.
  const key = process.env.ELEVENLABS_API_KEY || process.env.Eleven_labs_key;
  if (!key) {
    res.status(500).json({ error: "ELEVENLABS_API_KEY not set" });
    return;
  }
  const { text } = req.body || {};
  if (!text) {
    res.status(400).json({ error: "missing text" });
    return;
  }

  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5", // low latency for a live demo
      }),
    }
  );

  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    console.error("[elevenlabs]", r.status, detail); // server logs only
    res.status(r.status).json({ error: "elevenlabs request failed" });
    return;
  }

  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader("Content-Type", "audio/mpeg");
  res.status(200).send(buf);
}
