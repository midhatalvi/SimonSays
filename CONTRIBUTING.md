# Contributing to Simon Says

[Project home](README.md) · [Documentation](docs/README.md) · [Developer guide](docs/development.md) · [Architecture](docs/architecture.md)

## Before editing

Read the [current build](docs/current-build.md) and inspect the source before assuming a document describes implemented behavior. Keep changes focused and preserve the simple React/Vite/JavaScript stack.

## Working conventions

- Keep camera inference in the browser and secret-bearing services behind server handlers.
- Never commit `.env` files or credentials.
- Design for older adults with readable text, strong contrast, clear state, large targets, and comfortable movement choices.
- Keep the original Simon Says rules and product story unless the change explicitly revises them.
- Treat `shared/` as a co-owned interface. Coordinate changes and update [shared contracts](shared/README.md).
- Record only verification actually performed; distinguish synthetic tests from physical camera sessions.
- Add dependencies only when the benefit justifies the new maintenance and loading cost.

## Documentation expectations

- Visible behavior changes: update the [player guide](docs/player-guide.md) and [current build](docs/current-build.md).
- Runtime or component changes: update [architecture](docs/architecture.md).
- Interface changes: update [shared contracts](shared/README.md) and `CLAUDE.md`.
- New checks or observed failures: update [validation evidence](docs/EVIDENCE_CASES.md).

## Before opening or updating a PR

1. Run `npm test` and `npm run build`.
2. Run the relevant synthetic browser flow at `/?lab`.
3. Perform the [live playtest](docs/FIRST_PLAYTEST.md) when camera behavior changes.
4. Confirm secrets are excluded and `git diff --check` passes.
5. Describe known limitations directly in the PR.
