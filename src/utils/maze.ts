// Recursive Backtracker Algorithm for Maze Generation

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
};

export const generateMaze = (width: number, height: number): Cell[][] => {
  const grid: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      });
    }
    grid.push(row);
  }

  const stack: Cell[] = [];
  const startCell = grid[0][0];
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

  return grid;
};

export const solveMaze = (grid: Cell[][], start: {x: number, y: number}, end: {x: number, y: number}): {x: number, y: number}[] => {
  const queue: {x: number, y: number, path: {x: number, y: number}[]}[] = [];
  const visited = new Set<string>();
  
  queue.push({ ...start, path: [start] });
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { x, y, path } = current;

    if (x === end.x && y === end.y) {
      return path;
    }

    const cell = grid[y][x];
    const neighbors = [];

    // Check all 4 directions based on walls
    if (!cell.walls.top) neighbors.push({ x, y: y - 1 });
    if (!cell.walls.right) neighbors.push({ x: x + 1, y });
    if (!cell.walls.bottom) neighbors.push({ x, y: y + 1 });
    if (!cell.walls.left) neighbors.push({ x: x - 1, y });

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ ...neighbor, path: [...path, neighbor] });
      }
    }
  }

  return [];
};

const getUnvisitedNeighbors = (
  cell: Cell,
  grid: Cell[][],
  width: number,
  height: number
): Cell[] => {
  const neighbors: Cell[] = [];
  const { x, y } = cell;

  if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]); // Top
  if (x < width - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]); // Right
  if (y < height - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]); // Bottom
  if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]); // Left

  return neighbors;
};

const removeWalls = (a: Cell, b: Cell) => {
  const xDiff = a.x - b.x;
  if (xDiff === 1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if (xDiff === -1) {
    a.walls.right = false;
    b.walls.left = false;
  }

  const yDiff = a.y - b.y;
  if (yDiff === 1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (yDiff === -1) {
    a.walls.bottom = false;
    b.walls.top = false;
  }
};
