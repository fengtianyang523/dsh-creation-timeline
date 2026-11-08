# CLAUDE.md

This repository ships instructions for all coding agents in [AGENTS.md](./AGENTS.md). Read that file first; it covers installation in DeepSeek Harness, the contract surface, invariants, and verification.

Quick facts for Claude Code:

- This is a **DSH client plugin** (`index.js` Host + `client.js` browser), not a standalone app.
- Install via DSH's Plugin Manager ("install bundle" → this directory), then reload the GUI.
- Edit `client.js` / `index.js` directly — plain JS, no build step. `node --check` both before shipping.
- Keep locale dictionaries (`zh`, `en`) key-symmetric; keep the switch hook-minimal (see invariant 1 in `AGENTS.md`).
