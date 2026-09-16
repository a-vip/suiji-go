import { EMPTY, BLACK, WHITE } from '../core/Constants.js';

export class HeatmapRenderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.currentInfluence = null;
    this.targetInfluence = null;
    this.currentBoard = null;
    this.targetBoard = null;

    this.setupCanvas();
    this.animate = this.animate.bind(this);
    this.animationId = requestAnimationFrame(this.animate);
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const size = Math.max(rect.width || 220, 160);

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.displayWidth = size;
    this.displayHeight = size;
  }

  resize() {
    this.setupCanvas();
  }

  update(influence, board) {
    this.targetInfluence = influence;
    this.targetBoard = board ? board.map(r => [...r]) : null;

    if (!this.currentInfluence || this.currentInfluence.length !== this.game.size) {
      this.currentInfluence = influence.map(r => [...r]);
      this.currentBoard = board ? board.map(r => [...r]) : this.game.board.map(r => [...r]);
    }
  }

  animate() {
    if (this.currentInfluence && this.targetInfluence) {
      const size = this.game.size;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          if (this.targetInfluence[x] && this.currentInfluence[x]) {
            const diff = this.targetInfluence[x][y] - this.currentInfluence[x][y];
            if (Math.abs(diff) > 0.005) {
              this.currentInfluence[x][y] += diff * 0.15;
            } else {
              this.currentInfluence[x][y] = this.targetInfluence[x][y];
            }
          }
        }
      }
    }

    if (this.targetBoard) {
      this.currentBoard = this.targetBoard.map(r => [...r]);
    }

    this.render();
    this.animationId = requestAnimationFrame(this.animate);
  }

  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;
    const size = this.game.size;

    ctx.clearRect(0, 0, w, h);

    // Warm parchment backing
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#ede1c2');
    bgGrad.addColorStop(1, '#dfd1a6');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    if (!this.currentInfluence) return;
    const board = this.currentBoard || this.game.board;
    const cellSize = w / size;

    // Influence tile heatmap
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (!this.currentInfluence[x]) continue;
        const inf = this.currentInfluence[x][y];
        const px = x * cellSize;
        const py = y * cellSize;

        if (board[x] && board[x][y] === EMPTY && Math.abs(inf) > 0.04) {
          const intensity = Math.min(1, Math.abs(inf) * 1.5);
          if (inf > 0) {
            ctx.fillStyle = `rgba(22, 14, 8, ${intensity * 0.78})`;
          } else {
            ctx.fillStyle = `rgba(252, 246, 230, ${intensity * 0.88})`;
          }
          ctx.fillRect(px, py, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(60, 40, 18, 0.2)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= size; i++) {
      const p = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, h);
      ctx.moveTo(0, p);
      ctx.lineTo(w, p);
      ctx.stroke();
    }

    // Mini Stones
    const stoneRadius = cellSize * 0.38;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (board[x] && board[x][y] !== EMPTY) {
          const px = (x + 0.5) * cellSize;
          const py = (y + 0.5) * cellSize;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.ellipse(px + 0.5, py + 1, stoneRadius, stoneRadius * 0.95, 0, 0, Math.PI * 2);
          ctx.fill();

          if (board[x][y] === BLACK) {
            const g = ctx.createRadialGradient(px - stoneRadius * 0.3, py - stoneRadius * 0.3, 0, px, py, stoneRadius);
            g.addColorStop(0, '#55555d');
            g.addColorStop(0.6, '#1a1a1e');
            g.addColorStop(1, '#000');
            ctx.fillStyle = g;
          } else {
            const g = ctx.createRadialGradient(px - stoneRadius * 0.3, py - stoneRadius * 0.3, 0, px, py, stoneRadius);
            g.addColorStop(0, '#fff');
            g.addColorStop(0.7, '#efe8d2');
            g.addColorStop(1, '#c6bca4');
            ctx.fillStyle = g;
          }
          ctx.beginPath();
          ctx.arc(px, py, stoneRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
