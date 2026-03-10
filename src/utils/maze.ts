// Maze Generation with multiple algorithms and shapes

export type Cell = {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
  disabled: boolean; // true = cell is outside the maze shape (e.g. circular mask)
};

export type MazeShape = 'square' | 'circle' | 'diamond';

// --- Main entry point ---
export const generateMaze = (
  width: number,
  height: number,
  shape: MazeShape = 'square',
): Cell[][] => {
  const grid = createGrid(width, height);

  // Apply shape mask
  if (shape === 'circle') {
    applyCircleMask(grid, width, height);
  } else if (shape === 'diamond') {
    applyDiamondMask(grid, width, height);
  }

  // Find valid start/end for shaped mazes
  const startPos = findStart(grid, width, height, shape);
  const endPos = findEnd(grid, width, height, shape);

  // Phase 1: Generate perfect maze using Recursive Backtracker
  carvePassages(grid, width, height, startPos);

  // Phase 2: Add a small number of strategic loops near the solution path
  // This creates a few key decision points where the player must choose, not open corridors
  addStrategicLoops(grid, width, height, startPos, endPos);

  // Phase 3: Verify solvability
  const path = solveMaze(grid, startPos, endPos);
  if (path.length === 0) {
    ensureConnection(grid, width, height, startPos, endPos);
  }

  return grid;
};

// --- Grid creation ---
function createGrid(width: number, height: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x, y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
        disabled: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

// --- Shape masks ---
function applyCircleMask(grid: Cell[][], width: number, height: number) {
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const r = Math.min(cx, cy) - 0.5;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > r * r) {
        grid[y][x].disabled = true;
      }
    }
  }
}

function applyDiamondMask(grid: Cell[][], width: number, height: number) {
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const r = Math.min(cx, cy) - 0.5;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (Math.abs(x - cx) + Math.abs(y - cy) > r) {
        grid[y][x].disabled = true;
      }
    }
  }
}

// --- Start/End positions for shaped mazes ---
function findStart(grid: Cell[][], width: number, height: number, shape: MazeShape): { x: number; y: number } {
  if (shape === 'square') return { x: 0, y: 0 };
  const cy = Math.floor(height / 2);
  for (let x = 0; x < width; x++) {
    if (!grid[cy][x].disabled) return { x, y: cy };
  }
  return { x: 0, y: 0 };
}

function findEnd(grid: Cell[][], width: number, height: number, shape: MazeShape): { x: number; y: number } {
  if (shape === 'square') return { x: width - 1, y: height - 1 };
  const cy = Math.floor(height / 2);
  for (let x = width - 1; x >= 0; x--) {
    if (!grid[cy][x].disabled) return { x, y: cy };
  }
  return { x: width - 1, y: height - 1 };
}

export function getMazeStartEnd(grid: Cell[][], width: number, height: number, shape: MazeShape) {
  return {
    start: findStart(grid, width, height, shape),
    end: findEnd(grid, width, height, shape),
  };
}

// --- Phase 1: Recursive Backtracker (DFS) ---
function carvePassages(grid: Cell[][], width: number, height: number, start: { x: number; y: number }) {
  const stack: Cell[] = [];
  const startCell = grid[start.y][start.x];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, grid, width, height);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, next);
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // Carve any disconnected regions (can happen with shaped mazes)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      if (!cell.disabled && !cell.visited) {
        const visited = getVisitedNeighbors(cell, grid, width, height);
        if (visited.length > 0) {
          const neighbor = visited[Math.floor(Math.random() * visited.length)];
          removeWalls(cell, neighbor);
          cell.visited = true;
          carvePassages(grid, width, height, { x, y });
        }
      }
    }
  }
}

// --- Phase 2: Strategic loops ---
// Instead of blindly removing walls everywhere, we:
// 1. Solve the maze to find the optimal path
// 2. Pick a few walls NEAR the solution path to remove (creates forks that look tempting but may be wrong)
// 3. Also pick a very small number of random walls far from the path (adds subtle alternative routes)
// Total removal: ~3-5% of remaining walls — just enough to create a handful of decision points
function addStrategicLoops(
  grid: Cell[][],
  width: number,
  height: number,
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  const solution = solveMaze(grid, start, end);
  if (solution.length === 0) return;

  // Build a set of cells on or adjacent to the solution path
  const pathSet = new Set<string>();
  const nearPathSet = new Set<string>();
  for (const p of solution) {
    pathSet.add(`${p.x},${p.y}`);
    // Mark neighbors as "near path"
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]]) {
      const nx = p.x + dx;
      const ny = p.y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !grid[ny][nx].disabled) {
        nearPathSet.add(`${nx},${ny}`);
      }
    }
  }

  // Collect wall candidates, separated into "near path" and "far from path"
  const nearPathWalls: Array<{ cell: Cell; neighbor: Cell }> = [];
  const farWalls: Array<{ cell: Cell; neighbor: Cell }> = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      if (cell.disabled) continue;

      const key = `${x},${y}`;
      const isNear = nearPathSet.has(key) || pathSet.has(key);

      // Right wall
      if (x < width - 1 && !grid[y][x + 1].disabled && cell.walls.right) {
        const entry = { cell, neighbor: grid[y][x + 1] };
        if (isNear || nearPathSet.has(`${x + 1},${y}`)) {
          nearPathWalls.push(entry);
        } else {
          farWalls.push(entry);
        }
      }
      // Bottom wall
      if (y < height - 1 && !grid[y + 1][x].disabled && cell.walls.bottom) {
        const entry = { cell, neighbor: grid[y + 1][x] };
        if (isNear || nearPathSet.has(`${x},${y + 1}`)) {
          nearPathWalls.push(entry);
        } else {
          farWalls.push(entry);
        }
      }
    }
  }

  // Shuffle both arrays
  shuffle(nearPathWalls);
  shuffle(farWalls);

  // Remove a small number of near-path walls (creates tempting wrong turns near the solution)
  // ~4-6 walls for small mazes, ~8-12 for large ones
  const nearCount = Math.max(4, Math.floor(solution.length * 0.06));
  let removed = 0;
  for (const { cell, neighbor } of nearPathWalls) {
    if (removed >= nearCount) break;
    if (wouldCreate2x2Open(grid, cell, neighbor, width, height)) continue;
    removeWalls(cell, neighbor);
    removed++;
  }

  // Remove a very small number of far walls (~2-4 total, just for slight variety)
  const farCount = Math.max(2, Math.floor(width * height * 0.002));
  let farRemoved = 0;
  for (const { cell, neighbor } of farWalls) {
    if (farRemoved >= farCount) break;
    if (wouldCreate2x2Open(grid, cell, neighbor, width, height)) continue;
    removeWalls(cell, neighbor);
    farRemoved++;
  }
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Check if removing a wall between two cells creates a 2x2 fully open area
function wouldCreate2x2Open(grid: Cell[][], a: Cell, b: Cell, width: number, height: number): boolean {
  const minX = Math.min(a.x, b.x);
  const minY = Math.min(a.y, b.y);

  for (let dy = -1; dy <= 0; dy++) {
    for (let dx = -1; dx <= 0; dx++) {
      const bx = minX + dx;
      const by = minY + dy;
      if (bx < 0 || by < 0 || bx + 1 >= width || by + 1 >= height) continue;

      const tl = grid[by][bx];
      const tr = grid[by][bx + 1];
      const bl = grid[by + 1][bx];

      if (tl.disabled || tr.disabled || bl.disabled || grid[by + 1][bx + 1].disabled) continue;

      let wc = 0;
      if (tl.walls.right) wc++;
      if (tl.walls.bottom) wc++;
      if (tr.walls.bottom) wc++;
      if (bl.walls.right) wc++;

      if (wc <= 1) return true;
    }
  }
  return false;
}

// --- BFS Solver ---
export const solveMaze = (
  grid: Cell[][],
  start: { x: number; y: number },
  end: { x: number; y: number },
): { x: number; y: number }[] => {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const queue: { x: number; y: number; path: { x: number; y: number }[] }[] = [];
  const visited = new Set<string>();

  queue.push({ ...start, path: [start] });
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { x, y, path } = current;

    if (x === end.x && y === end.y) return path;

    const cell = grid[y][x];
    const neighbors: { x: number; y: number }[] = [];

    if (!cell.walls.top && y > 0) neighbors.push({ x, y: y - 1 });
    if (!cell.walls.right && x < cols - 1) neighbors.push({ x: x + 1, y });
    if (!cell.walls.bottom && y < rows - 1) neighbors.push({ x, y: y + 1 });
    if (!cell.walls.left && x > 0) neighbors.push({ x: x - 1, y });

    for (const neighbor of neighbors) {
      if (grid[neighbor.y][neighbor.x].disabled) continue;
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ ...neighbor, path: [...path, neighbor] });
      }
    }
  }

  return [];
};

// --- Fallback connection if maze is unsolvable ---
function ensureConnection(
  grid: Cell[][],
  _width: number,
  _height: number,
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  let { x, y } = start;
  while (x !== end.x || y !== end.y) {
    const cell = grid[y][x];
    if (x < end.x && !grid[y][x + 1].disabled) {
      removeWalls(cell, grid[y][x + 1]);
      x++;
    } else if (y < end.y && !grid[y + 1][x].disabled) {
      removeWalls(cell, grid[y + 1][x]);
      y++;
    } else if (x > end.x && !grid[y][x - 1].disabled) {
      removeWalls(cell, grid[y][x - 1]);
      x--;
    } else if (y > end.y && !grid[y - 1][x].disabled) {
      removeWalls(cell, grid[y - 1][x]);
      y--;
    } else {
      break;
    }
  }
}

// --- Helpers ---
function getUnvisitedNeighbors(cell: Cell, grid: Cell[][], width: number, height: number): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;
  if (y > 0 && !grid[y - 1][x].visited && !grid[y - 1][x].disabled) neighbors.push(grid[y - 1][x]);
  if (x < width - 1 && !grid[y][x + 1].visited && !grid[y][x + 1].disabled) neighbors.push(grid[y][x + 1]);
  if (y < height - 1 && !grid[y + 1][x].visited && !grid[y + 1][x].disabled) neighbors.push(grid[y + 1][x]);
  if (x > 0 && !grid[y][x - 1].visited && !grid[y][x - 1].disabled) neighbors.push(grid[y][x - 1]);
  return neighbors;
}

function getVisitedNeighbors(cell: Cell, grid: Cell[][], width: number, height: number): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;
  if (y > 0 && grid[y - 1][x].visited && !grid[y - 1][x].disabled) neighbors.push(grid[y - 1][x]);
  if (x < width - 1 && grid[y][x + 1].visited && !grid[y][x + 1].disabled) neighbors.push(grid[y][x + 1]);
  if (y < height - 1 && grid[y + 1][x].visited && !grid[y + 1][x].disabled) neighbors.push(grid[y + 1][x]);
  if (x > 0 && grid[y][x - 1].visited && !grid[y][x - 1].disabled) neighbors.push(grid[y][x - 1]);
  return neighbors;
}

const removeWalls = (a: Cell, b: Cell) => {
  const xDiff = a.x - b.x;
  if (xDiff === 1) { a.walls.left = false; b.walls.right = false; }
  else if (xDiff === -1) { a.walls.right = false; b.walls.left = false; }

  const yDiff = a.y - b.y;
  if (yDiff === 1) { a.walls.top = false; b.walls.bottom = false; }
  else if (yDiff === -1) { a.walls.bottom = false; b.walls.top = false; }
};
