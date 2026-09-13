# SimonSays — Submission Kit

Live app: https://simonsays-ashy.vercel.app
Repo: https://github.com/midhatalvi/SimonSays

Everything the LOCK IN Hack submission needs, in one place. Edit freely.

---

## Project description (what we created and how it works)

**SimonSays — a movement and memory game that helps older adults stay sharp, and gives caregivers a simple daily signal.**

After a stroke, my grandpa's mobility and memory started to slip, and living in
another country with a full work schedule, I couldn't be there the way I wanted
to. SimonSays grew out of that: a companion that can sit with him when I can't,
and exercise both his brain and his body.

**How it works**

- A warm voice (ElevenLabs) calls out moves. "Simon says raise your right hand,"
  and you do it. If Simon doesn't say it, you stay still. Every round makes you
  listen, remember, and turn that memory into movement, quickly.
- The camera reads your pose live and on-device (MediaPipe), so your video never
  leaves your device.
- Three lives, gentle grading, and it times each action plus other metrics, so a
  caregiver can tell an active day from a slower one.
- Short discovery breaks pull real, source-checked facts (Tavily) to keep the
  mind curious. You answer with a gesture, then a fact popup reads itself aloud.
- Built older-adult-first: large text, a friendly robot named Simon, a calm
  patient voice, and forgiving feedback.

**Tech stack:** React + Vite, MediaPipe Tasks Vision (on-device pose), ElevenLabs
text-to-speech and Tavily search through serverless proxies, deployed on Vercel.
52 automated tests.

*Not a medical product. Framed for engagement and staying sharp, not diagnosis
or treatment.*

---

## Demo video script (~2.5 min, audio covers the tech stack)

1. **0:00–0:20 — the why.** On camera or voiceover: the grandpa story in two
   sentences. "This is why we built SimonSays."
2. **0:20–1:10 — play it.** Screen-record the phone: Start, camera on, do two
   "Simon says" moves correctly, then intentionally do a fake command to show a
   life lost. Let Simon's voice and reactions be heard.
3. **1:10–1:40 — discovery break.** Show the "What do you think?" question,
   answer with a gesture, and let the fact popup read itself aloud.
4. **1:40–2:05 — score + metrics.** Show the end screen with average/best
   reaction time. One line about caregiver tracking (active vs slower days).
5. **2:05–2:30 — tech stack.** Over the UI: "On-device MediaPipe pose detection
   so video stays private, ElevenLabs for the voice, Tavily for source-checked
   facts, React and Vercel, and 52 automated tests."

---

## LinkedIn post

Have you watched a grandparent slowly lose the mobility and sharpness they used
to have? You want to give them your time and help them stay as independent as
they once were.

After my grandpa's stroke, his mobility and memory started to fade. He travels
between countries, and with work I can't be there the way I want to be. So I
built something that could sit with him when I can't: an AI companion that
exercises both his brain and his body.

This weekend at LOCK IN Hack, our team turned that idea into SimonSays.

It's the childhood game, reimagined for staying sharp. A warm voice calls out a
move. "Simon says raise your right hand," and you do it. If Simon doesn't say
it, you hold still. Every round asks you to listen, remember, and turn that
memory into movement, fast.

What it does:
- Reads your movements live through the camera, on your own device
- Rewards and grades each round, with three lives to keep it playful
- Times how long each action takes, so a caregiver can see an active day from a slower one
- Adds short discovery breaks with real, source-checked facts to keep the mind curious

We built it with React and MediaPipe for on-device pose detection, ElevenLabs
for a calm patient voice, and Tavily for live verified facts, all on Vercel.

It started as a way to help one person. I hope it helps many more stay
independent, and stay themselves, a little longer.

Try it: https://simonsays-ashy.vercel.app

#LOCKINHack #ElevenLabs #Tavily #AgingWell #ComputerVision

---

## X post (fits in 280)

My grandpa's stroke took some of his memory and mobility, and I can't always be
there. So we built SimonSays: a camera game that keeps older adults sharp in
body and mind, and shows caregivers their active days vs slower ones.

Try it: simonsays-ashy.vercel.app
#LOCKINHack
