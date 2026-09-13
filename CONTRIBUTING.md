# Contributing to Simon Says

[Home](README.md) · [Developer setup](docs/development.md) · [Architecture](docs/architecture.md)

## Before editing

Read the developer guide, then identify the area you are changing. Keep changes focused and preserve the simple React/Vite/JavaScript stack. This project was organized for two teammates working in parallel.

## Folder ownership

| Area | Owner | Responsibility |
| --- | --- | --- |
| `vision/` | Teammate | MediaPipe and pose detection |
| `content/` | Teammate | Tavily round generation |
| `server/tavily/` | Teammate | Tavily proxy |
| `engine/` | Midhat | Game logic and rounds |
| `voice/` | Midhat | ElevenLabs client |
| `ui/` | Midhat | Start, game, and score screens |
| `server/elevenlabs/` | Midhat | ElevenLabs proxy |
| `shared/` | Both; locked contracts | Pose constants and interfaces |
| `api/` | Both | Thin serverless wrappers |

Coordinate before editing another person's area. Change shared contracts only after explicit agreement, and update `CLAUDE.md` in the same commit. Documentation cleanup does not authorize an interface change.

## Working conventions

- Keep code readable and dependencies minimal. Ask before adding dependencies or frameworks.
- Keep API keys on the server and out of committed files.
- Design for older adults: large text, high contrast, and one main action per screen.
- Check camera assumptions on both laptops and phones over an appropriate secure origin.
- Describe the app as movement and engagement; avoid treatment or clinical claims.
- Distinguish implemented behavior from proposed work in documentation.

## Before proposing a change

Run the build and the relevant [manual checks](docs/development.md#manual-verification). Describe what changed, why, and what was actually tested. Update the player guide for visible behavior changes and the architecture guide for component changes.

The original hackathon plan used a stub detector to unblock independent development. The real detector is now integrated; the review-branch engine additionally requires explicit tracking validity (main still uses the older contract). Use the development verification harness or a compatible detector mock.
