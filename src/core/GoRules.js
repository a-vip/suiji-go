import { EMPTY, BLACK, WHITE } from './Constants.js';

export class GoRules {
  /**
   * Get 4 orthogonal neighbor coordinates.
   */
  static getNeighbors(x, y, size) {
    const list = [];
    if (x > 0) list.push([x - 1, y]);
    if (x < size - 1) list.push([x + 1, y]);
    if (y > 0) list.push([x, y - 1]);
    if (y < size - 1) list.push([x, y + 1]);
    return list;
  }

  /**
   * Get 4 diagonal neighbor coordinates.
   */
  static getDiagonals(x, y, size) {
    const list = [];
    if (x > 0 && y > 0) list.push([x - 1, y - 1]);
    if (x < size - 1 && y > 0) list.push([x + 1, y - 1]);
    if (x > 0 && y < size - 1) list.push([x - 1, y + 1]);
    if (x < size - 1 && y < size - 1) list.push([x + 1, y + 1]);
    return list;
  }

  /**
   * Finds connected chain of stones and its liberties.
   */
  static findGroup(x, y, board, size) {
    const color = board[x][y];
    if (color === EMPTY) return null;

    const stones = [];
    const liberties = new Set();
    const visited = new Set();
    const stack = [[x, y]];

    while (stack.length > 0) {
      const [cx, cy] = stack.pop();
      const key = cx * size + cy;
      if (visited.has(key)) continue;
      visited.add(key);
      stones.push([cx, cy]);

      for (const [nx, ny] of this.getNeighbors(cx, cy, size)) {
        const neighborColor = board[nx][ny];
        if (neighborColor === EMPTY) {
          liberties.add(nx * size + ny);
        } else if (neighborColor === color && !visited.has(nx * size + ny)) {
          stack.push([nx, ny]);
        }
      }
    }

    const libertyCoords = Array.from(liberties).map(k => [Math.floor(k / size), k % size]);
    return {
      color,
      stones,
      liberties: liberties.size,
      libertyCoords
    };
  }

  /**
   * Evaluates simulated move without mutating original board.
   * Returns { valid, reason, newBoard, captured, ownLiberties, ownGroup }
   */
  static tryPlace(x, y, color, board, size, koPoint = null) {
    if (x < 0 || x >= size || y < 0 || y >= size) {
      return { valid: false, reason: 'out-of-bounds' };
    }
    if (board[x][y] !== EMPTY) {
      return { valid: false, reason: 'occupied' };
    }
    if (koPoint && koPoint[0] === x && koPoint[1] === y) {
      return { valid: false, reason: 'ko' };
    }

    // Clone board
    const newBoard = board.map(row => [...row]);
    newBoard[x][y] = color;
    const opponent = color === BLACK ? WHITE : BLACK;
    const captured = [];

    // Check adjacent opponent groups for zero liberties (captures)
    for (const [nx, ny] of this.getNeighbors(x, y, size)) {
      if (newBoard[nx][ny] === opponent) {
        const oppGroup = this.findGroup(nx, ny, newBoard, size);
        if (oppGroup && oppGroup.liberties === 0) {
          for (const [sx, sy] of oppGroup.stones) {
            if (newBoard[sx][sy] !== EMPTY) {
              newBoard[sx][sy] = EMPTY;
              captured.push([sx, sy]);
            }
          }
        }
      }
    }

    // Check if own newly formed group has liberties
    const ownGroup = this.findGroup(x, y, newBoard, size);
    if (!ownGroup || ownGroup.liberties === 0) {
      return { valid: false, reason: 'suicide' };
    }

    return {
      valid: true,
      newBoard,
      captured,
      ownLiberties: ownGroup.liberties,
      ownGroup
    };
  }

  /**
   * Determine if an intersection is an eye for a given player.
   * Also distinguishes true eyes vs false eyes.
   */
  static isEye(x, y, color, board, size) {
    if (board[x][y] !== EMPTY) return false;

    // All orthogonal neighbors must be of player's color
    const neighbors = this.getNeighbors(x, y, size);
    for (const [nx, ny] of neighbors) {
      if (board[nx][ny] !== color) return false;
    }

    // Check diagonals to verify true eye vs false eye
    const isEdge = (x === 0 || x === size - 1 || y === 0 || y === size - 1);
    const diagonals = this.getDiagonals(x, y, size);
    const opponent = color === BLACK ? WHITE : BLACK;
    let oppDiagCount = 0;

    for (const [dx, dy] of diagonals) {
      if (board[dx][dy] === opponent) {
        oppDiagCount++;
      }
    }

    // On edges, an eye is false if 1 or more diagonal points are occupied by the opponent.
    // In the center, an eye is false if 2 or more diagonals are occupied by opponent.
    if (isEdge && oppDiagCount >= 1) {
      return { isEye: true, isTrueEye: false };
    }
    if (!isEdge && oppDiagCount >= 2) {
      return { isEye: true, isTrueEye: false };
    }

    return { isEye: true, isTrueEye: true };
  }

  /**
   * Calculate territory, influence field, stone counts, and Komi-adjusted scores.
   * Optimized with bounded radii to run smoothly on 9x9, 13x13, and 19x19 boards.
   */
  static calculateTerritory(board, size, komi = 6.5) {
    const influence = Array(size).fill(0).map(() => Array(size).fill(0));
    const decay = 0.44;
    const maxRadius = size <= 9 ? 3 : size <= 13 ? 4 : 4;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const stone = board[x][y];
        if (stone !== EMPTY) {
          const sign = stone === BLACK ? 1 : -1;
          const minDx = Math.max(-maxRadius, -x);
          const maxDx = Math.min(maxRadius, size - 1 - x);
          const minDy = Math.max(-maxRadius, -y);
          const maxDy = Math.min(maxRadius, size - 1 - y);

          for (let dx = minDx; dx <= maxDx; dx++) {
            for (let dy = minDy; dy <= maxDy; dy++) {
              const dist = Math.abs(dx) + Math.abs(dy);
              if (dist > 0 && dist <= maxRadius) {
                influence[x + dx][y + dy] += sign * Math.pow(decay, dist);
              }
            }
          }
        }
      }
    }

    let blackTerritory = 0;
    let whiteTerritory = 0;
    let blackStones = 0;
    let whiteStones = 0;
    let neutral = 0;

    const territoryMap = Array(size).fill(0).map(() => Array(size).fill(EMPTY));

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (board[x][y] === BLACK) {
          blackStones++;
          territoryMap[x][y] = BLACK;
        } else if (board[x][y] === WHITE) {
          whiteStones++;
          territoryMap[x][y] = WHITE;
        } else {
          const inf = influence[x][y];
          if (inf > 0.28) {
            blackTerritory++;
            territoryMap[x][y] = BLACK;
          } else if (inf < -0.28) {
            whiteTerritory++;
            territoryMap[x][y] = WHITE;
          } else {
            neutral++;
          }
        }
      }
    }

    const blackArea = blackStones + blackTerritory;
    const whiteArea = whiteStones + whiteTerritory + komi;

    return {
      influence,
      territoryMap,
      blackStones,
      whiteStones,
      blackTerritory,
      whiteTerritory,
      neutral,
      blackArea,
      whiteArea,
      komi
    };
  }
}
