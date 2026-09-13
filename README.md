# Simon Says

Simon Says is a camera-based movement and listening game designed to make a short activity break feel familiar, approachable, and encouraging—especially for older adults. Simon gives a spoken and written instruction, the player decides whether Simon really said “Simon says,” and the browser checks the chosen movement through the webcam.

## Why we are building it

Many movement products begin with workouts, equipment, accounts, or performance goals. Simon Says begins with a game people already understand. It asks for no wearable or controller, lets players sit or stand, and offers only movements they choose in advance.

The product is built around four principles:

- **Familiar play:** the classic rule is the core interaction.
- **Comfort and control:** players choose movements and pace, and can pause, repeat, or skip.
- **Clear encouragement:** instructions stay visible and mistakes receive gentle feedback.
- **Optional discovery:** after three movement rounds, Tavily can provide one sourced Space or Animals question. It never changes the movement score.

Simon Says is an engagement prototype. It does not assess, diagnose, or treat health conditions.

## Current experience

1. Choose one or more comfortable movements and a 5, 8, or 12-second pace.
2. Start the camera and listen to the rules.
3. Play up to six rounds with three lives. Move only when the instruction begins with “Simon says.”
4. Optionally explore one sourced question halfway through.
5. Review movement and discovery results separately.

Camera frames stay in the browser and are processed with MediaPipe. ElevenLabs provides voice when configured; browser speech is the fallback. Tavily runs behind a server endpoint and receives only the selected discovery topic after the player accepts the break.

## Start here

| I want to… | Read |
| --- | --- |
| Understand the product and its motivation | [Project story](docs/project-story.md) |
| Play the game | [Player guide](docs/player-guide.md) |
| Run or deploy the project | [Developer guide](docs/development.md) |
| Understand the code and data flow | [Architecture](docs/architecture.md) |
| Review what has and has not been tested | [Validation](docs/EVIDENCE_CASES.md) |
| Contribute safely | [Contributing](CONTRIBUTING.md) |
| Browse every document | [Documentation index](docs/README.md) |

## Quick start

Node.js 20 or newer is recommended.

```bash
npm ci
npm run dev
```

Open `http://localhost:5174`. Camera access works on localhost; testing from a phone requires an HTTPS deployment.

To enable sponsor services locally, create an ignored `.env.local` file from `.env.example`, add the server-side keys, and restart the development server. Never use `VITE_` variables for secrets.

```bash
npm test
npm run build
```

The current review branch is `design/a-little-lift`, proposed in [PR #2](https://github.com/midhatalvi/SimonSays/pull/2).
