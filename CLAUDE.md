# CLAUDE.md — AhaMaze

## Project Overview

AhaMaze is a browser-based maze puzzle game built with React + TypeScript + Vite + Tailwind CSS 4.

## Quick Commands

```bash
npm run dev      # Dev server on http://localhost:3000
npm run build    # Production build
npm run lint     # Type-check (tsc --noEmit)
```

## Architecture

- **Single-page app** — `src/main.tsx` → `App.tsx` → `Game.tsx`
- **No routing** — The entire app is the `Game` component
- **No backend** — Pure client-side; `express` and `better-sqlite3` in deps are unused legacy
- **No state management library** — All state lives in `useState` hooks inside `Game.tsx`

## Key Files

| File | Purpose |
|------|---------|
| `src/components/Game.tsx` | All game UI: maze grid, player, minimap, settings modal, win overlay, mobile D-pad |
| `src/utils/maze.ts` | `generateMaze()` (Recursive Backtracker) and `solveMaze()` (BFS) |
| `src/utils/audio.ts` | Web Audio API synth: `playMoveSound`, `playWinSound`, `playBumpSound` |
| `src/index.css` | Tailwind v4 import + Inter/JetBrains Mono fonts |
| `vite.config.ts` | Vite config with `@tailwindcss/vite` plugin, `@vitejs/plugin-react`, env loading |

## Code Conventions

- **Tailwind CSS v4** — Uses `@import "tailwindcss"` and `@theme` block (not v3 `@tailwind` directives)
- **Motion library** — Import from `motion/react`, not `framer-motion`
- **Lucide icons** — Import individual icons from `lucide-react`
- **No CSS modules** — All styling via Tailwind utility classes inline
- **Functional components only** — No class components
- **TypeScript strict-ish** — `tsconfig` uses `ES2022` target, `bundler` module resolution, `noEmit`

## Styling

- Tailwind v4 with `@tailwindcss/vite` plugin
- Custom fonts: Inter (sans), JetBrains Mono (mono) via `@theme` block
- Three theme palettes defined as objects in `Game.tsx`: Neon, Retro, Light
- Dark background by default (`#020617` slate-950)

## Game Mechanics

- Maze generated with Recursive Backtracker (DFS with random neighbor selection)
- Optimal path calculated on win via BFS
- Three difficulty levels control grid size: Easy 25x25, Medium 35x35, Hard 45x45
- Cell size dynamically calculated to fit viewport
- Player movement validated against cell wall data
- Timer starts on first move, not on maze load

## Environment Variables

- `GEMINI_API_KEY` — Referenced in `vite.config.ts` but not currently used in game code
- See `.env.example` for format

## Things to Watch Out For

- `package.json` name is `react-example` (legacy from template) — project is actually called AhaMaze
- `express` and `better-sqlite3` deps are unused — can be removed if cleaning up
- `index.html` title says "My Google AI Studio App" — should match project name
- The `@google/genai` dependency is declared but not imported anywhere in current source
