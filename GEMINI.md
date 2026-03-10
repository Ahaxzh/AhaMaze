# AhaMaze - Project Mandates & Architecture

This file provides foundational mandates and architectural context for Gemini CLI when working on the **AhaMaze** project.

## 1. Project Overview
AhaMaze is a high-quality, atmospheric web-based maze puzzle game built with React 19, Vite, and Tailwind CSS v4. It features procedural maze generation, multiple themes, difficulty levels, and game modes (Classic/Challenge).

## 2. Core Mandates
- **Pure Client-Side**: The project is designed to be zero-backend. Do NOT introduce server-side logic (Express, SQLite, etc.) unless explicitly requested.
- **Modern Tech Stack**: Strictly adhere to **React 19** patterns (e.g., `useActionState` if applicable) and **Tailwind CSS v4** conventions.
- **Performance**: Maze generation and solving (BFS) should remain efficient for large grids (up to 50x50+). Use Web Workers if extremely large mazes are introduced in the future.
- **Styling**: Use Vanilla CSS or Tailwind CSS v4. Maintain the "Neon/Atmospheric" aesthetic across all themes.
- **Accessibility**: Ensure keyboard, touch, and gamepad controls are always synchronized and functional.

## 3. Architecture & Symbols
- **`src/utils/maze.ts`**: The algorithmic heart.
  - `generateMaze(width, height, shape)`: Uses Recursive Backtracker with "strategic loops" logic.
  - `solveMaze(grid, start, end)`: Uses BFS to find the optimal path.
  - `MazeShape`: Supports `square`, `circle`, and `diamond`.
- **`src/components/Game.tsx`**: The main orchestration component.
  - Manages game state (timer, moves, level, theme, language).
  - Handles rendering of the maze, fog of war, and UI overlays.
- **`src/utils/audio.ts`**: Minimalist sound engine using Web Audio API.

## 4. Known Issues & Legacy
- **Unused Dependencies**: `express`, `better-sqlite3`, and `@google/genai` are currently in `package.json` but are **not used**. Do not import them or rely on them for core features.
- **State Management**: Uses React's `useState` and `useEffect`. For complex state, consider `useReducer` before introducing external libraries like Redux or Zustand.

## 5. Development Workflow
- **Linting**: Run `npm run lint` (tsc) to verify type safety.
- **Build**: Run `npm run build` to ensure the production build is successful.
- **Testing**: Add unit tests for `maze.ts` logic if making significant changes to generation or solving algorithms.

---
*Created by Gemini CLI for Ahaxzh*
