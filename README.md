# 🧩 AhaMaze

AhaMaze is a high-quality, atmospheric web-based maze puzzle game with neon aesthetics, fluid animations, and a rich set of themes. It's designed to be both a relaxing puzzle experience and a challenging race against time.

[![License](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

- **Procedural Maze Generation** — Recursive Backtracker algorithm with "strategic loops" to create unique, perfect mazes with subtle alternative routes.
- **Multiple Shapes** — Choose between **Square**, **Circle**, and **Diamond** maze layouts.
- **4 Difficulty Levels** —
  - **Kids** (15x15)
  - **Easy** (25x25)
  - **Medium** (35x35)
  - **Hard** (45x45)
- **10+ Atmospheric Themes** — Neon, Retro, Princess, Starry, Midnight, Ocean, Amber, Rose, and more.
- **Game Modes** —
  - **Classic**: Navigate to the exit with full visibility.
  - **Challenge**: Experience "Fog of War" — navigate in the dark with only a small light around you.
- **Bilingual UI** — Full support for **English** and **简体中文**.
- **Cross-Platform Controls** — Desktop keyboard (WASD/Arrows), Mobile touch (Swipe/D-pad), and Gamepad support.
- **Sound Effects** — Minimalist Web Audio API synth sounds for immersive feedback.
- **Leaderboard** — Track your best times and scores locally for each difficulty level.
- **Export to Image** — Save your generated mazes as high-quality PNG images.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Animation** | [Motion (Framer Motion)](https://motion.dev/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **SFX** | Web Audio API |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 18.x)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/AhaMaze.git

# Navigate to the project directory
cd AhaMaze

# Install dependencies
npm install

# Start the development server
npm run dev
```

The game will be available at `http://localhost:3000`.

## 🎮 Controls

### Desktop
- **Move**: `W`, `A`, `S`, `D` or `Arrow Keys`
- **Reset/New Maze**: `R`
- **Undo**: `U` (if implemented)
- **Screenshot**: `P`

### Mobile
- **Swipe**: Swipe in any direction to move.
- **Virtual D-pad**: Use the on-screen controls.

### Gamepad
- **Left Stick / D-pad**: Move the player.
- **South Button (A)**: Reset/New Maze.

## 📁 Project Structure

```
AhaMaze/
├── src/
│   ├── components/
│   │   └── Game.tsx       # Core Game Engine & UI
│   ├── utils/
│   │   ├── maze.ts        # Maze Gen & BFS Solving Algorithms
│   │   └── audio.ts       # Web Audio SFX Generator
│   ├── App.tsx            # Main Entry Component
│   ├── main.tsx           # React Mounting
│   └── index.css          # Tailwind & Global Styles
├── public/                # Static Assets
├── vite.config.ts         # Vite Configuration
├── tsconfig.json          # TypeScript Configuration
└── GEMINI.md              # Project Mandates for AI Agents
```

## 📜 License

Distributed under the Apache-2.0 License. See `LICENSE` for more information.

---
*Created with ❤️ by [Ahaxzh](https://github.com/ahaxzh)*
