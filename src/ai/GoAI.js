import { EMPTY, BLACK, WHITE, HOSHI_POINTS } from '../core/Constants.js';
import { GoRules } from '../core/GoRules.js';
import { IntentEvaluator } from './IntentEvaluator.js';

export class GoAI {
  constructor(game, level = 2) {
    this.game = game;
    this.level = level; // 1 = Beginner Kyu, 2 = Mid Dan, 3 = High Dan
  }

  setLevel(lvl) {
    this.level = Math.max(1, Math.min(3, lvl));
  }

  getCandidates(color = this.game.currentPlayer) {
    const candidates = [];
    const size = this.game.size;
    const board = this.game.board;

    // In 19x19 or 13x13 games with many moves, limit candidates to points adjacent or within 2 spaces of stones,
    // plus empty Hoshi points in the opening, to keep evaluation ultra-fast.
    const moveCount = this.game.history.length;
    const isBigBoard = size >= 13;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (board[x][y] !== EMPTY) continue;
        if (this.game.koPoint && this.game.koPoint[0] === x && this.game.koPoint[1] === y) continue;

        // On larger boards, prune empty space far from any action to keep performance snappy
        if (isBigBoard && moveCount > 4) {
          let hasNearby = false;
          const searchRad = 2;
          for (let dx = -searchRad; dx <= searchRad && !hasNearby; dx++) {
            for (let dy = -searchRad; dy <= searchRad && !hasNearby; dy++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                if (board[nx][ny] !== EMPTY) hasNearby = true;
              }
            }
          }
          if (!hasNearby && moveCount > 10) continue;
        }

        // Avoid filling own true eye
        const eyeInfo = GoRules.isEye(x, y, color, board, size);
        if (eyeInfo && eyeInfo.isEye && eyeInfo.isTrueEye) {
          continue;
        }

        const sim = GoRules.tryPlace(x, y, color, board, size, this.game.koPoint);
        if (sim.valid) {
          candidates.push({ x, y, ...sim });
        }
      }
    }
    return candidates;
  }

  evaluateMove(candidate, color, baseTerritory) {
    const opponent = color === BLACK ? WHITE : BLACK;
    const size = this.game.size;
    let score = 0;

    const { x, y, captured, newBoard, ownLiberties } = candidate;

    // 1. Immediate Captures
    const capturedCount = captured.length;
    if (capturedCount > 0) {
      score += capturedCount * 40;
      if (capturedCount > 1) score += capturedCount * 14;
    }

    // 2. Saving friendly stones in Atari
    let savedCount = 0;
    for (const [nx, ny] of GoRules.getNeighbors(x, y, size)) {
      if (this.game.board[nx][ny] === color) {
        const grp = GoRules.findGroup(nx, ny, this.game.board, size);
        if (grp && grp.liberties === 1) {
          savedCount += grp.stones.length;
        }
      }
    }
    if (savedCount > 0) {
      score += savedCount * 30;
    }

    // 3. Putting opponent in Atari
    let atariCount = 0;
    for (const [nx, ny] of GoRules.getNeighbors(x, y, size)) {
      if (newBoard[nx][ny] === opponent) {
        const grp = GoRules.findGroup(nx, ny, newBoard, size);
        if (grp && grp.liberties === 1) {
          atariCount += grp.stones.length;
        }
      }
    }
    if (atariCount > 0) {
      score += atariCount * 18;
    }

    // 4. Liberties safety
    if (ownLiberties === 1) {
      score -= 28; // dangerous self-atari
    } else if (ownLiberties === 2) {
      score += 2;
    } else if (ownLiberties >= 3) {
      score += 6;
    }

    // 5. Board edge geometry
    const distToEdge = Math.min(x, y, size - 1 - x, size - 1 - y);
    if (distToEdge === 0) {
      score -= 10; // First line penalty early on
    } else if (distToEdge === 1 && this.game.history.length < 16) {
      score -= 2;
    } else if (distToEdge === 2 || distToEdge === 3) {
      score += 8; // 3rd line (territory) and 4th line (influence)
    }

    // 6. Proximity to friendly / enemy stones
    let friendlyNeighbors = 0;
    let enemyNeighbors = 0;
    for (const [nx, ny] of GoRules.getNeighbors(x, y, size)) {
      if (this.game.board[nx][ny] === color) friendlyNeighbors++;
      else if (this.game.board[nx][ny] === opponent) enemyNeighbors++;
    }

    const isConnection = friendlyNeighbors >= 2;
    const isCut = enemyNeighbors >= 2;
    if (isConnection) score += 6;
    if (isCut) score += 10;

    // 7. Opening / Hoshi bonus
    const moveNumber = this.game.history.length;
    const isCorner = distToEdge >= 2 && ((x <= 3 && y <= 3) || (x >= size - 4 && y <= 3) || (x <= 3 && y >= size - 4) || (x >= size - 4 && y >= size - 4));
    const isSide = distToEdge === 2 || distToEdge === 3;
    const isCenter = distToEdge >= 4;

    if (moveNumber < (size === 9 ? 6 : size === 13 ? 12 : 20)) {
      const hoshiList = HOSHI_POINTS[size] || [];
      for (const [hx, hy] of hoshiList) {
        if (Math.abs(x - hx) <= 1 && Math.abs(y - hy) <= 1) {
          score += 16;
          break;
        }
      }
    }

    // 8. Territory influence score (Fast approximation via local influence)
    let territorySwing = 0;
    if (baseTerritory && baseTerritory.influence) {
      const localInf = baseTerritory.influence[x][y];
      const sign = color === BLACK ? 1 : -1;
      // If playing in opponent influence, invasion; if in neutral, expansion
      if (localInf * sign < -0.3) {
        score += 8; // Good invasion
        territorySwing = 2.5;
      } else if (Math.abs(localInf) < 0.25) {
        score += 5; // Establishing new base
      }
    }

    // 9. High Dan Lookahead (Level 3): Check immediate counter-captures
    if (this.level === 3) {
      let maxOppCounterCapture = 0;
      for (const [nx, ny] of GoRules.getNeighbors(x, y, size)) {
        if (newBoard[nx][ny] === EMPTY) {
          const oppSim = GoRules.tryPlace(nx, ny, opponent, newBoard, size);
          if (oppSim.valid && oppSim.captured.length > maxOppCounterCapture) {
            maxOppCounterCapture = oppSim.captured.length;
          }
        }
      }
      score -= maxOppCounterCapture * 28;
    }

    // Natural variability by level
    const noiseMagnitude = this.level === 1 ? 24 : this.level === 2 ? 6 : 1.5;
    score += (Math.random() - 0.5) * noiseMagnitude;

    // Build humanized description
    const intent = IntentEvaluator.describeMove({
      move: { x, y },
      color,
      capturedCount,
      savedCount,
      atariCount,
      moveNumber,
      size,
      isCorner,
      isSide,
      isCenter,
      territorySwing,
      isCut,
      isConnection
    });

    return { score, intent, x, y };
  }

  selectMove() {
    const candidates = this.getCandidates();
    if (candidates.length === 0) {
      return { pass: true, intent: { title: 'Pass', text: 'No advantageous or legal points remain.', japanese: 'Pasu (パス)' } };
    }

    // Compute base territory ONCE for all candidates
    const baseTerritory = this.game.calculateTerritory();
    const scored = candidates.map(c => this.evaluateMove(c, this.game.currentPlayer, baseTerritory));
    scored.sort((a, b) => b.score - a.score);

    // If top candidate is excessively negative and late in the game, AI gracefully passes
    if (scored[0].score < -50 && this.game.history.length > 25) {
      return { pass: true, intent: { title: 'Pass', text: 'Territory has solidified; AI yields turn.', japanese: 'Pasu (パス)' } };
    }

    // Level 1 picks from top 5 for instructional play
    if (this.level === 1 && Math.random() < 0.4) {
      const topN = Math.min(4, scored.length);
      const choice = scored[Math.floor(Math.random() * topN)];
      return { move: { x: choice.x, y: choice.y }, intent: choice.intent };
    }

    const best = scored[0];
    return { move: { x: best.x, y: best.y }, intent: best.intent };
  }
}
