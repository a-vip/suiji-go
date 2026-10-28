import { EMPTY, BLACK, WHITE } from './Constants.js';
import { GoRules } from './GoRules.js';

export class GoGame {
  constructor(size = 9, komi = 6.5) {
    this.size = size;
    this.komi = komi;
    this.reset();
  }

  reset(size = this.size, komi = this.komi) {
    this.size = size;
    this.komi = komi;
    this.board = Array(this.size).fill(EMPTY).map(() => Array(this.size).fill(EMPTY));
    this.currentPlayer = BLACK;
    this.history = [];
    this.captures = { [BLACK]: 0, [WHITE]: 0 };
    this.koPoint = null;
    this.lastMove = null;
    this.consecutivePasses = 0;
    this.gameOver = false;
    this.winner = null;
    this.resignedBy = null;
    this.startTime = Date.now();
  }

  canPlace(x, y, color = this.currentPlayer) {
    if (this.gameOver) return false;
    const res = GoRules.tryPlace(x, y, color, this.board, this.size, this.koPoint);
    return res.valid;
  }

  place(x, y) {
    if (this.gameOver) return { valid: false, reason: 'game-over' };
    const color = this.currentPlayer;

    const result = GoRules.tryPlace(x, y, color, this.board, this.size, this.koPoint);
    if (!result.valid) return result;

    this.board = result.newBoard;
    this.captures[color] += result.captured.length;

    // Ko detection: Single stone captured AND playing stone now has exactly 1 liberty and is a single stone
    if (result.captured.length === 1 && result.ownLiberties === 1) {
      const group = GoRules.findGroup(x, y, this.board, this.size);
      if (group && group.stones.length === 1) {
        this.koPoint = result.captured[0];
      } else {
        this.koPoint = null;
      }
    } else {
      this.koPoint = null;
    }

    this.lastMove = { x, y, color };
    this.consecutivePasses = 0;

    const record = {
      type: 'move',
      x,
      y,
      color,
      captured: result.captured,
      boardSnapshot: this.board.map(r => [...r]),
      captures: { ...this.captures },
      timestamp: Date.now()
    };
    this.history.push(record);

    this.currentPlayer = color === BLACK ? WHITE : BLACK;
    return {
      valid: true,
      captured: result.captured,
      moveIndex: this.history.length
    };
  }

  pass() {
    if (this.gameOver) return;
    const color = this.currentPlayer;
    this.consecutivePasses++;

    this.history.push({
      type: 'pass',
      color,
      boardSnapshot: this.board.map(r => [...r]),
      captures: { ...this.captures },
      timestamp: Date.now()
    });

    this.lastMove = null;
    this.koPoint = null;

    if (this.consecutivePasses >= 2) {
      this.gameOver = true;
      this.calculateWinner();
    } else {
      this.currentPlayer = color === BLACK ? WHITE : BLACK;
    }
  }

  resign() {
    if (this.gameOver) return;
    const color = this.currentPlayer;
    this.gameOver = true;
    this.winner = color === BLACK ? WHITE : BLACK;
    this.resignedBy = color;

    this.history.push({
      type: 'resign',
      color,
      boardSnapshot: this.board.map(r => [...r]),
      captures: { ...this.captures },
      timestamp: Date.now()
    });
  }

  undo() {
    if (this.history.length === 0) return false;
    this.history.pop();
    if (this.history.length === 0) {
      this.board = Array(this.size).fill(EMPTY).map(() => Array(this.size).fill(EMPTY));
      this.captures = { [BLACK]: 0, [WHITE]: 0 };
      this.lastMove = null;
      this.currentPlayer = BLACK;
      this.koPoint = null;
      this.gameOver = false;
      this.winner = null;
      this.resignedBy = null;
      return true;
    }

    const prev = this.history[this.history.length - 1];
    this.board = prev.boardSnapshot.map(r => [...r]);
    this.captures = { ...prev.captures };
    this.currentPlayer = prev.color === BLACK ? WHITE : BLACK;
    this.gameOver = false;
    this.winner = null;
    this.resignedBy = null;
    this.koPoint = null;

    if (prev.type === 'move') {
      this.lastMove = { x: prev.x, y: prev.y, color: prev.color };
    } else {
      this.lastMove = null;
    }
    return true;
  }

  calculateTerritory(board = this.board) {
    return GoRules.calculateTerritory(board, this.size, this.komi);
  }

  calculateWinner() {
    const t = this.calculateTerritory();
    if (t.blackArea > t.whiteArea) {
      this.winner = BLACK;
    } else if (t.whiteArea > t.blackArea) {
      this.winner = WHITE;
    } else {
      this.winner = 0; // Jigo (draw)
    }
    return this.winner;
  }

  /**
   * Set a custom board layout (used for tutorials & tsumego)
   */
  setupCustomBoard(stones = [], size = this.size, toPlay = BLACK) {
    this.size = size;
    this.reset(size);
    this.currentPlayer = toPlay;
    for (const item of stones) {
      const { x, y, color } = item;
      if (x >= 0 && x < size && y >= 0 && y < size) {
        this.board[x][y] = color;
      }
    }
  }
}
