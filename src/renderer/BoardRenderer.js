import { EMPTY, BLACK, WHITE, HOSHI_POINTS, COORD_LETTERS } from '../core/Constants.js';

export class BoardRenderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.hoverPos = null;
    this.lastMovePulse = 0;
    this.animatingStones = new Map();
    this.woodTexture = null;
    this.dpr = window.devicePixelRatio || 1;
    this.tutorialMarkers = [];
    this.deadStones = new Set(); // For end of game scoring review

    this.setupCanvas();
    this.generateWoodTexture();

    this.animate = this.animate.bind(this);
    this.animationId = requestAnimationFrame(this.animate);
  }

  setupCanvas() {
    this.dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const size = Math.max(rect.width || 580, 320);

    this.canvas.width = size * this.dpr;
    this.canvas.height = size * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.displayWidth = size;
    this.displayHeight = size;
    this.padding = this.displayWidth * 0.07;
    this.cellSize = (this.displayWidth - 2 * this.padding) / (this.game.size - 1);
    this.stoneRadius = this.cellSize * 0.47;
  }

  resize() {
    this.setupCanvas();
    this.generateWoodTexture();
  }

  setTutorialMarkers(markers = []) {
    this.tutorialMarkers = markers;
  }

  setDeadStones(stones = []) {
    this.deadStones = new Set(stones.map(s => `${s.x},${s.y}`));
  }

  generateWoodTexture() {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const off = document.createElement('canvas');
    off.width = w * 2;
    off.height = h * 2;
    const ctx = off.getContext('2d');
    ctx.scale(2, 2);

    // Warm Japanese Kaya honey base
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#e8b87a');
    grad.addColorStop(0.4, '#dcab6d');
    grad.addColorStop(0.85, '#cf9a58');
    grad.addColorStop(1, '#be8743');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Fine wood grain fibers
    const grainCount = 120;
    for (let i = 0; i < grainCount; i++) {
      const opacity = 0.035 + Math.random() * 0.12;
      ctx.strokeStyle = `rgba(${100 + Math.random() * 45}, ${55 + Math.random() * 30}, ${15 + Math.random() * 15}, ${opacity})`;
      ctx.lineWidth = 0.35 + Math.random() * 1.5;

      const startX = Math.random() * w;
      const amp = 4 + Math.random() * 18;
      const freq = 0.005 + Math.random() * 0.012;
      const phase = Math.random() * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(startX, -4);
      for (let y = -4; y <= h + 4; y += 4) {
        const x = startX + Math.sin(y * freq + phase) * amp;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Natural wood knots
    for (let i = 0; i < 3; i++) {
      const cx = (0.2 + 0.6 * Math.random()) * w;
      const cy = (0.2 + 0.6 * Math.random()) * h;
      const r = 10 + Math.random() * 16;

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(85, 48, 16, 0.28)');
      g.addColorStop(0.5, 'rgba(110, 68, 24, 0.12)');
      g.addColorStop(1, 'rgba(120, 75, 30, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.72);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(45, 22, 8, 0.32)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Warm top lacquer sheen
    const sheen = ctx.createLinearGradient(0, 0, 0, h * 0.35);
    sheen.addColorStop(0, 'rgba(255, 245, 210, 0.16)');
    sheen.addColorStop(1, 'rgba(255, 245, 210, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h * 0.35);

    this.woodTexture = off;
  }

  drawWoodBackground() {
    if (this.woodTexture) {
      this.ctx.drawImage(this.woodTexture, 0, 0, this.displayWidth, this.displayHeight);
    } else {
      this.ctx.fillStyle = '#dcab6d';
      this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    }
  }

  drawGrid() {
    const ctx = this.ctx;
    const size = this.game.size;

    ctx.strokeStyle = 'rgba(40, 24, 10, 0.82)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    for (let i = 0; i < size; i++) {
      const pos = this.padding + i * this.cellSize;

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(this.padding, pos);
      ctx.lineTo(this.displayWidth - this.padding, pos);
      ctx.stroke();

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(pos, this.padding);
      ctx.lineTo(pos, this.displayHeight - this.padding);
      ctx.stroke();
    }

    // Outer border
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = 'rgba(35, 20, 8, 0.95)';
    ctx.strokeRect(
      this.padding,
      this.padding,
      this.displayWidth - 2 * this.padding,
      this.displayHeight - 2 * this.padding
    );

    // Hoshi Star Points
    const hoshi = HOSHI_POINTS[size] || [];
    ctx.fillStyle = 'rgba(35, 20, 8, 0.9)';
    const hoshiRadius = size <= 9 ? 3.4 : size <= 13 ? 3.0 : 2.6;

    for (const [hx, hy] of hoshi) {
      const px = this.padding + hx * this.cellSize;
      const py = this.padding + hy * this.cellSize;
      ctx.beginPath();
      ctx.arc(px, py, hoshiRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Coordinates (Numbers on left & right, Letters on top & bottom)
    ctx.fillStyle = 'rgba(65, 42, 20, 0.6)';
    const fontSize = Math.max(9, Math.min(13, this.cellSize * 0.28));
    ctx.font = `600 ${fontSize}px "Spline Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < size; i++) {
      const px = this.padding + i * this.cellSize;
      const letter = COORD_LETTERS[i];
      // Top & bottom
      ctx.fillText(letter, px, this.padding * 0.42);
      ctx.fillText(letter, px, this.displayHeight - this.padding * 0.42);

      const py = this.padding + i * this.cellSize;
      const number = (size - i).toString();
      // Left & right
      ctx.fillText(number, this.padding * 0.42, py);
      ctx.fillText(number, this.displayWidth - this.padding * 0.42, py);
    }
  }

  drawStone(x, y, color, opacity = 1, scale = 1) {
    const ctx = this.ctx;
    const px = this.padding + x * this.cellSize;
    const py = this.padding + y * this.cellSize;
    const r = Math.max(1, this.stoneRadius * scale);

    const isDead = this.deadStones.has(`${x},${y}`);
    const actualOpacity = isDead ? opacity * 0.45 : opacity;

    ctx.save();
    ctx.globalAlpha = actualOpacity;

    // Contact drop shadow
    ctx.fillStyle = `rgba(30, 16, 5, ${0.4 * actualOpacity})`;
    ctx.beginPath();
    ctx.ellipse(px + 1.6, py + 3.2, r * 1.05, r * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    if (color === BLACK) {
      // Traditional Slate stone
      const grad = ctx.createRadialGradient(px - r * 0.32, py - r * 0.34, 0, px, py, r);
      grad.addColorStop(0, '#585860');
      grad.addColorStop(0.3, '#26262b');
      grad.addColorStop(0.75, '#0e0e12');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      // Specular shine
      const hl = ctx.createRadialGradient(px - r * 0.38, py - r * 0.42, 0, px - r * 0.38, py - r * 0.42, r * 0.55);
      hl.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
      hl.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
      hl.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Clamshell White stone
      const grad = ctx.createRadialGradient(px - r * 0.28, py - r * 0.3, 0, px, py, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#f8f2e2');
      grad.addColorStop(0.85, '#ded2b4');
      grad.addColorStop(1, '#b6a482');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      // Outer delicate bevel
      ctx.strokeStyle = 'rgba(110, 85, 50, 0.3)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Highlights
      const hl = ctx.createRadialGradient(px - r * 0.32, py - r * 0.38, 0, px - r * 0.32, py - r * 0.38, r * 0.5);
      hl.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      hl.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
      hl.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isDead) {
      // Draw red 'X' on dead stones
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 2.4;
      const xSize = r * 0.5;
      ctx.beginPath();
      ctx.moveTo(px - xSize, py - xSize);
      ctx.lineTo(px + xSize, py + xSize);
      ctx.moveTo(px + xSize, py - xSize);
      ctx.lineTo(px - xSize, py + xSize);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawLastMoveMarker() {
    if (!this.game.lastMove) return;
    const ctx = this.ctx;
    const { x, y, color } = this.game.lastMove;
    const px = this.padding + x * this.cellSize;
    const py = this.padding + y * this.cellSize;
    const pulse = (Math.sin(this.lastMovePulse * 0.07) + 1) / 2;
    const r = Math.max(1, this.stoneRadius * 0.36);

    ctx.save();
    if (color === BLACK) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 + pulse * 0.25})`;
    } else {
      ctx.strokeStyle = `rgba(25, 14, 5, ${0.75 + pulse * 0.25})`;
    }
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(px, py, r + pulse * 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawHoverGhost() {
    if (!this.hoverPos || this.game.gameOver) return;
    const { x, y } = this.hoverPos;
    if (this.game.board[x][y] !== EMPTY) return;
    if (!this.game.canPlace(x, y, this.game.currentPlayer)) return;

    this.drawStone(x, y, this.game.currentPlayer, 0.45, 0.92);
  }

  drawTutorialMarkers() {
    if (!this.tutorialMarkers || this.tutorialMarkers.length === 0) return;
    const ctx = this.ctx;

    for (const marker of this.tutorialMarkers) {
      const { type, x, y, label, color = '#a52828' } = marker;
      const px = this.padding + x * this.cellSize;
      const py = this.padding + y * this.cellSize;

      ctx.save();
      if (type === 'target') {
        // Glowing target ring
        const pulse = (Math.sin(this.lastMovePulse * 0.08) + 1) / 2;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(px, py, this.stoneRadius * 1.15 + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bullseye center dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label if present
        if (label) {
          ctx.fillStyle = '#1f1410';
          ctx.font = 'bold 11px "Spline Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, px, py - this.stoneRadius * 1.4);
        }
      } else if (type === 'highlight') {
        // Soft aura highlight
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, this.stoneRadius * 1.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'label') {
        // Text tag on stone or point
        ctx.fillStyle = color;
        ctx.font = `bold ${Math.max(11, this.cellSize * 0.38)}px "Spline Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label || '', px, py);
      } else if (type === 'liberty') {
        // Small green liberty dot
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#faf2dc';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  getDropScale(key) {
    const anim = this.animatingStones.get(key);
    if (!anim) return 1;
    const elapsed = performance.now() - anim.startTime;
    const dur = 280;
    if (elapsed >= dur) {
      this.animatingStones.delete(key);
      return 1;
    }
    const t = elapsed / dur;
    if (t < 0.4) {
      return 0.3 + (t / 0.4) * 0.85;
    } else if (t < 0.7) {
      return 1.15 - ((t - 0.4) / 0.3) * 0.2;
    } else {
      return 0.95 + ((t - 0.7) / 0.3) * 0.05;
    }
  }

  animateStoneDrop(x, y, color) {
    this.animatingStones.set(`${x},${y}`, { startTime: performance.now(), color });
  }

  pixelToGrid(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;

    // Convert client coordinates to internal canvas display coordinates
    const scaleX = this.displayWidth / rect.width;
    const scaleY = this.displayHeight / rect.height;

    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;

    const x = Math.round((px - this.padding) / this.cellSize);
    const y = Math.round((py - this.padding) / this.cellSize);
    if (x < 0 || x >= this.game.size || y < 0 || y >= this.game.size) return null;

    const gx = this.padding + x * this.cellSize;
    const gy = this.padding + y * this.cellSize;
    const dist = Math.hypot(px - gx, py - gy);
    if (dist > this.cellSize * 0.54) return null;

    return { x, y };
  }

  setHover(pos) {
    this.hoverPos = pos;
  }

  animate() {
    this.lastMovePulse++;
    this.render();
    this.animationId = requestAnimationFrame(this.animate);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    this.drawWoodBackground();
    this.drawGrid();

    // Draw active board stones
    for (let x = 0; x < this.game.size; x++) {
      for (let y = 0; y < this.game.size; y++) {
        const stone = this.game.board[x][y];
        if (stone !== EMPTY) {
          const scale = this.getDropScale(`${x},${y}`);
          this.drawStone(x, y, stone, 1, scale);
        }
      }
    }

    this.drawTutorialMarkers();
    this.drawLastMoveMarker();
    this.drawHoverGhost();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
