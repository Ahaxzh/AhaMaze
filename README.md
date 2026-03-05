# AhaMaze

A beautiful, atmospheric maze puzzle game with neon aesthetics, smooth animations, and multiple themes.

Navigate through procedurally generated mazes, race against the clock, and try to match the optimal solution path.

## Features

- **Procedural Maze Generation** — Recursive Backtracker algorithm creates unique mazes every time
- **3 Difficulty Levels** — Easy (25x25), Medium (35x35), Hard (45x45)
- **3 Visual Themes** — Neon, Retro, Light
- **Bilingual UI** — English / 中文
- **Responsive Design** — Desktop keyboard (WASD / Arrow keys) + mobile touch controls (swipe & D-pad)
- **Real-time Minimap** — Canvas-rendered overview with path tracking
- **Sound Effects** — Web Audio API synth sounds for move, bump, and win
- **Win Celebration** — Confetti particles + optimal path comparison
- **Timer & Move Counter** — Track your performance per level

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| Effects | canvas-confetti |

## Getting Started

### Prerequisites

- Node.js >= 18

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove `dist/` directory |
| `npm run lint` | Type-check with `tsc --noEmit` |

## Project Structure

```
AhaMaze/
├── index.html              # Entry HTML
├── package.json
├── vite.config.ts          # Vite + Tailwind + React config
├── tsconfig.json
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Root component
    ├── index.css           # Global styles + Tailwind imports
    ├── components/
    │   └── Game.tsx        # Main game UI (maze grid, controls, settings, win overlay)
    └── utils/
        ├── maze.ts         # Maze generation (Recursive Backtracker) & solving (BFS)
        └── audio.ts        # Web Audio API sound effects
```

## Controls

| Input | Action |
|-------|--------|
| `W` / `Arrow Up` | Move up |
| `A` / `Arrow Left` | Move left |
| `S` / `Arrow Down` | Move down |
| `D` / `Arrow Right` | Move right |
| `R` | New maze |
| Swipe (mobile) | Move in swipe direction |

## License

Apache-2.0
