// ============================================================================
// /voice — ElevenLabs client  (MIDHAT)
// ============================================================================
// Calls our own /api/elevenlabs proxy (key stays server-side), plays the audio.
// Falls back to the browser's built-in speech synthesis so the loop is testable
// before the proxy is deployed.
// ============================================================================

let useFallback = false;

/**
 * Speak a line. Resolves when audio finishes (so rounds sequence cleanly).
 * @param {string} text
 */
export async function say(text) {
  if (!useFallback) {
    try {
      const res = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`proxy ${res.status}`);
      const blob = await res.blob();
      await playBlob(blob);
      return;
    } catch (err) {
      // Proxy not ready yet — switch to browser speech for the rest of the run.
      console.warn("[voice] falling back to browser speech:", err.message);
      useFallback = true;
    }
  }
  await browserSpeak(text);
}

function playBlob(blob) {
  return new Promise((resolve) => {
    const audio = new Audio(URL.createObjectURL(blob));
    audio.onended = resolve;
    audio.onerror = resolve;
    audio.play().catch(resolve);
  });
}

function browserSpeak(text) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}
