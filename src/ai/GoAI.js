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

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (this.game.board[x][y] !== EMPTY) continue;
        if (this.game.koPoint && this.game.koPoint[0] === x && this.game.koPoint[1] === y) continue;

        // Check eye self-fill rule
        const eyeInfo = GoRules.isEye(x, y, color, this.game.board, size);
        if (eyeInfo && eyeInfo.isEye && eyeInfo.isTrueEye) {
          // Never fill own true eye unless it is the only move or in desperate self-atari
          continue;
        }

        const sim = GoRules.tryPlace(x, y, color, this.game.board, size, this.game.koPoint);
        if (sim.valid) {
          candidates.push({ x, y, ...sim });
        }
      }
    }
    return candidates;
  }

  evaluateMove(candidate, color) {
    const opponent = color === BLACK ? WHITE : BLACK;
    const size = this.game.size;
    let score = 0;

    const { x, y, captured, newBoard, ownLiberties } = candidate;

    // 1. Immediate Captures
    const capturedCount = captured.length;
    if (capturedCount > 0) {
      score += capturedCount * 36;
      if (capturedCount > 1) score += capturedCount * 12; // Bonus for multi-capture
    }

    // 2. Saving stones in Atari
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
      score += savedCount * 28;
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
      score += atariCount * 16;
    }

    // 4. Liberties safety
    if (ownLiberties === 1) {
      score -= 24; // Dangerous self-atari
    } else if (ownLiberties === 2) {
      score += 2;
    } else if (ownLiberties >= 3) {
      score += 6;
    }

    // 5. Edge and line penalties/bonuses
    const distToEdge = Math.min(x, y, size - 1 - x, size - 1 - y);
    if (distToEdge === 0) {
      score -= 8; // 1st line (death line in early/mid game)
    } else if (distToEdge === 1 && this.game.history.length < 15) {
      score -= 3; // 2nd line early on
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

    if (moveNumber < (size === 9 ? 6 : size === 13 ? 12 : 24)) {
      const hoshiList = HOSHI_POINTS[size] || [];
      for (const [hx, hy] of hoshiList) {
        if (Math.abs(x - hx) <= 1 && Math.abs(y - hy) <= 1) {
          score += 15;
          break;
        }
      }
    }

    // 8. Territory swings (for Dan levels)
    let territorySwing = 0;
    if (this.level >= 2) {
      const before = GoRules.calculateTerritory(this.game.board, size, this.game.komi);
      const after = GoRules.calculateTerritory(newBoard, size, this.game.komi);
      const ownBefore = color === BLACK ? before.blackArea : before.whiteArea;
      const ownAfter = color === BLACK ? after.blackArea : after.whiteArea;
      const oppBefore = color === BLACK ? before.whiteArea : before.blackArea;
      const oppAfter = color === BLACK ? after.whiteArea : after.blackArea;

      const ownGain = ownAfter - ownBefore;
      const oppLoss = oppBefore - oppAfter;
      territorySwing = (ownGain + oppLoss);
      score += territorySwing * 3.5;
    }

    // 9. High Dan Lookahead (Level 3)
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
      score -= maxOppCounterCapture * 30;
    }

    // Noise by difficulty
    const noiseMagnitude = this.level === 1 ? 22 : this.level === 2 ? 6 : 1.5;
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

    const scored = candidates.map(c => this.evaluateMove(c, this.game.currentPlayer));
    scored.sort((a, b) => b.score - a.score);

    // If top score is deeply negative, pass
    if (scored[0].score < -45 && this.game.history.length > 20) {
      return { pass: true, intent: { title: 'Pass', text: 'Board has solidified; passing turn.', japanese: 'Pasu (パス)' } };
    }

    // Level 1 picks from top 5 for natural human variety
    if (this.level === 1 && Math.random() < 0.45) {
      const topN = Math.min(5, scored.length);
      const choice = scored[Math.floor(Math.random() * topN)];
      return { move: { x: choice.x, y: choice.y }, intent: choice.intent };
    }

    const best = scored[0];
    return { move: { x: best.x, y: best.y }, intent: best.intent };
  }
}
