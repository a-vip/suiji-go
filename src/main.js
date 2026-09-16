import { BLACK, WHITE, coordToName } from './core/Constants.js';
import { GoGame } from './core/GoGame.js';
import { GoAI } from './ai/GoAI.js';
import { SoundEngine } from './audio/SoundEngine.js';
import { BoardRenderer } from './renderer/BoardRenderer.js';
import { HeatmapRenderer } from './renderer/HeatmapRenderer.js';
import { SgfParser } from './core/SgfParser.js';
import { LearningEngine } from './learning/LearningEngine.js';
import { LearningUI } from './learning/LearningUI.js';

class SuijiApp {
  constructor() {
    this.game = new GoGame(9, 6.5);
    this.sound = new SoundEngine();
    this.ai = new GoAI(this.game, 2);

    this.aiThinking = false;
    this.reviewMode = false;
    this.reviewIndex = 0;
    this.reviewInterval = null;
    this.inDojoMode = false;

    this.initDOM();
    this.initRenderers();
    this.initLearningSystem();
    this.bindEvents();
    this.startTimer();
    this.updateUI();
  }

  initDOM() {
    this.els = {
      board: document.getElementById('board'),
      heatmap: document.getElementById('heatmap'),
      coordHint: document.getElementById('coordHint'),
      thinkingOverlay: document.getElementById('thinkingOverlay'),
      thinkingSub: document.getElementById('thinkingSub'),
      moveCounter: document.getElementById('moveCounter'),
      gameTime: document.getElementById('gameTime'),
      moveList: document.getElementById('moveList'),
      playerBlack: document.getElementById('playerBlack'),
      playerWhite: document.getElementById('playerWhite'),
      capturesBlack: document.getElementById('capturesBlack'),
      capturesWhite: document.getElementById('capturesWhite'),
      blackScore: document.getElementById('blackScore'),
      whiteScore: document.getElementById('whiteScore'),
      blackBar: document.getElementById('blackBar'),
      whiteBar: document.getElementById('whiteBar'),
      scoreMargin: document.getElementById('scoreMargin'),
      intentLabel: document.getElementById('intentLabel'),
      intentText: document.getElementById('intentText'),
      intentMeta: document.getElementById('intentMeta'),
      intentMove: document.getElementById('intentMove'),
      infoBoardSize: document.getElementById('infoBoardSize'),
      infoKomi: document.getElementById('infoKomi'),
      btnPass: document.getElementById('btnPass'),
      btnResign: document.getElementById('btnResign'),
      btnNew: document.getElementById('btnNew'),
      btnUndo: document.getElementById('btnUndo'),
      btnExportSgf: document.getElementById('btnExportSgf'),
      btnLaunchDojo: document.getElementById('btnLaunchDojo'),
      sizeSelector: document.getElementById('sizeSelector'),
      rankSelector: document.getElementById('rankSelector'),
      replayBar: document.getElementById('replayBar'),
      replaySlider: document.getElementById('replaySlider'),
      replayPrev: document.getElementById('replayPrev'),
      replayPlay: document.getElementById('replayPlay'),
      replayNext: document.getElementById('replayNext'),
      replayClose: document.getElementById('replayClose'),
      replayInfo: document.getElementById('replayInfo'),
      replayReason: document.getElementById('replayReason'),
      gameOverCard: document.getElementById('gameOverCard'),
      goTitle: document.getElementById('goTitle'),
      goSub: document.getElementById('goSub'),
      goBlack: document.getElementById('goBlack'),
      goWhite: document.getElementById('goWhite'),
      goReview: document.getElementById('goReview'),
      goNew: document.getElementById('goNew'),
      toast: document.getElementById('toast')
    };
  }

  initRenderers() {
    this.boardRenderer = new BoardRenderer(this.els.board, this.game);
    this.heatmapRenderer = new HeatmapRenderer(this.els.heatmap, this.game);
  }

  initLearningSystem() {
    this.learningEngine = new LearningEngine(this.game, this.sound, (state) => {
      this.learningUI.updateStage(state);
      this.boardRenderer.render();
      this.updateTerritory();
    });

    this.learningUI = new LearningUI(this.learningEngine, this.boardRenderer, () => {
      // Exiting Dojo -> return to regular game
      this.inDojoMode = false;
      this.game.reset();
      this.updateUI();
      this.showToast('Returned to normal game mode');
    });
  }

  bindEvents() {
    // Board interaction
    this.els.board.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.els.board.addEventListener('mouseleave', () => {
      this.boardRenderer.setHover(null);
      this.els.coordHint.classList.remove('show');
    });
    this.els.board.addEventListener('click', (e) => this.onBoardClick(e));
    this.els.board.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });

    // Buttons
    this.els.btnPass.addEventListener('click', () => this.onPass());
    this.els.btnResign.addEventListener('click', () => this.onResign());
    this.els.btnNew.addEventListener('click', () => this.onNewGame());
    this.els.btnUndo.addEventListener('click', () => this.onUndo());
    this.els.btnExportSgf.addEventListener('click', () => this.onExportSgf());

    // Dojo Launch
    this.els.btnLaunchDojo.addEventListener('click', () => {
      this.inDojoMode = true;
      this.learningUI.open();
    });

    // Board Size Selector
    this.els.sizeSelector.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.size, 10);
        this.changeBoardSize(size);
        this.els.sizeSelector.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // AI Rank Selector
    this.els.rankSelector.querySelectorAll('.rank-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        this.els.rankSelector.querySelectorAll('.rank-badge').forEach(b => b.classList.remove('active'));
        badge.classList.add('active');
        const lvl = parseInt(badge.dataset.level, 10);
        this.ai.setLevel(lvl);
        const name = badge.querySelector('.name').textContent;
        this.showToast(`AI strength set to ${name}`);
      });
    });

    // Replay controls
    this.els.replaySlider.addEventListener('input', (e) => this.scrubReview(parseInt(e.target.value, 10)));
    this.els.replayPrev.addEventListener('click', () => this.scrubReview(this.reviewIndex - 1));
    this.els.replayNext.addEventListener('click', () => this.scrubReview(this.reviewIndex + 1));
    this.els.replayPlay.addEventListener('click', () => this.toggleReplayPlay());
    this.els.replayClose.addEventListener('click', () => this.closeReview());

    // Game Over actions
    this.els.goReview.addEventListener('click', () => {
      this.els.gameOverCard.classList.remove('show');
      setTimeout(() => this.openReview(), 250);
    });
    this.els.goNew.addEventListener('click', () => {
      this.els.gameOverCard.classList.remove('show');
      setTimeout(() => this.onNewGame(), 250);
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.boardRenderer.resize();
      this.heatmapRenderer.resize();
    });
  }

  changeBoardSize(size) {
    if (this.game.size === size) return;
    const komi = size === 19 ? 7.5 : 6.5;
    this.game.reset(size, komi);
    this.els.infoBoardSize.textContent = `${size} × ${size}`;
    this.els.infoKomi.textContent = komi.toString();
    this.boardRenderer.resize();
    this.heatmapRenderer.resize();
    this.updateUI();
    this.showToast(`Board switched to ${size}×${size}`);
  }

  onMouseMove(e) {
    if (this.aiThinking || this.reviewMode || this.game.gameOver) {
      this.boardRenderer.setHover(null);
      this.els.coordHint.classList.remove('show');
      return;
    }
    if (this.game.currentPlayer !== BLACK && !this.inDojoMode) {
      this.boardRenderer.setHover(null);
      return;
    }

    const rect = this.els.board.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const grid = this.boardRenderer.pixelToGrid(px, py);
    this.boardRenderer.setHover(grid);

    if (grid) {
      const coordName = coordToName(grid.x, grid.y, this.game.size);
      this.els.coordHint.textContent = coordName;
      this.els.coordHint.style.left = `${this.boardRenderer.padding + grid.x * this.boardRenderer.cellSize}px`;
      this.els.coordHint.style.top = `${this.boardRenderer.padding + grid.y * this.boardRenderer.cellSize}px`;
      this.els.coordHint.classList.add('show');
    } else {
      this.els.coordHint.classList.remove('show');
    }
  }

  onTouchStart(e) {
    e.preventDefault();
    if (this.aiThinking || this.reviewMode || this.game.gameOver) return;
    const touch = e.touches[0];
    const rect = this.els.board.getBoundingClientRect();
    const px = touch.clientX - rect.left;
    const py = touch.clientY - rect.top;
    const grid = this.boardRenderer.pixelToGrid(px, py);
    if (grid) this.handleCoordinateAction(grid.x, grid.y);
  }

  onBoardClick(e) {
    if (this.aiThinking || this.reviewMode || this.game.gameOver) return;
    const rect = this.els.board.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const grid = this.boardRenderer.pixelToGrid(px, py);
    if (grid) this.handleCoordinateAction(grid.x, grid.y);
  }

  handleCoordinateAction(x, y) {
    if (this.inDojoMode) {
      this.learningEngine.handleUserMove(x, y);
      return;
    }

    if (this.game.currentPlayer !== BLACK) return;

    if (this.game.koPoint && this.game.koPoint[0] === x && this.game.koPoint[1] === y) {
      this.showToast('Ko Rule: Illegal to immediately recapture here');
      return;
    }

    const res = this.game.place(x, y);
    if (!res.valid) {
      if (res.reason === 'suicide') this.showToast('Illegal move: Suicide is forbidden');
      else if (res.reason === 'occupied') this.showToast('Intersection already occupied');
      return;
    }

    this.boardRenderer.animateStoneDrop(x, y, BLACK);
    this.sound.playStoneClick(1.0);
    if (res.captured.length > 0) {
      setTimeout(() => this.sound.playCaptureSound(res.captured.length), 70);
    }

    this.updateUI();
    const coord = coordToName(x, y, this.game.size);
    const capInfo = res.captured.length > 0 ? ` · +${res.captured.length} capture${res.captured.length > 1 ? 's' : ''}` : '';
    this.setIntent('Your Move', `You played ${coord}.`, `Black ${coord}${capInfo}`);

    if (this.game.gameOver) {
      setTimeout(() => this.showGameOver(), 500);
    } else {
      setTimeout(() => this.triggerAiTurn(), 450);
    }
  }

  async triggerAiTurn() {
    if (this.game.gameOver || this.game.currentPlayer !== WHITE || this.inDojoMode) return;

    this.aiThinking = true;
    this.els.thinkingOverlay.classList.add('show');
    this.updatePlayerTags();

    const subs = [
      'Reading ladder variations',
      'Evaluating territorial influence',
      'Assessing eye-shapes',
      'Calculating liberties',
      'Formulating counter-attack'
    ];
    let subIdx = 0;
    const subInterval = setInterval(() => {
      subIdx = (subIdx + 1) % subs.length;
      this.els.thinkingSub.textContent = subs[subIdx];
    }, 850);

    const thinkDuration = this.ai.level === 1 ? 550 + Math.random() * 400 :
                          this.ai.level === 2 ? 850 + Math.random() * 600 :
                          1200 + Math.random() * 800;

    await new Promise(r => setTimeout(r, thinkDuration));

    clearInterval(subInterval);
    this.aiThinking = false;
    this.els.thinkingOverlay.classList.remove('show');

    const decision = this.ai.selectMove();

    if (decision.pass) {
      this.game.pass();
      this.sound.playPassSound();
      this.setIntent('AI Passed', 'White found no advantageous move on the board.', 'White pass');
    } else {
      const placeRes = this.game.place(decision.move.x, decision.move.y);
      if (placeRes.valid) {
        this.boardRenderer.animateStoneDrop(decision.move.x, decision.move.y, WHITE);
        this.sound.playStoneClick(1.0);
        if (placeRes.captured.length > 0) {
          setTimeout(() => this.sound.playCaptureSound(placeRes.captured.length), 70);
        }

        const coord = coordToName(decision.move.x, decision.move.y, this.game.size);
        const capInfo = placeRes.captured.length > 0 ? ` · +${placeRes.captured.length} capture${placeRes.captured.length > 1 ? 's' : ''}` : '';
        this.setIntent(
          decision.intent.title || 'AI Move',
          decision.intent.text || `White played ${coord}.`,
          `White ${coord}${capInfo}`
        );
      }
    }

    this.updateUI();

    if (this.game.gameOver) {
      setTimeout(() => this.showGameOver(), 600);
    }
  }

  onPass() {
    if (this.aiThinking || this.game.gameOver || this.reviewMode || this.inDojoMode) return;
    this.game.pass();
    this.sound.playPassSound();
    this.setIntent('Turn Passed', 'You yielded your turn to White.', 'Black pass');
    this.updateUI();

    if (this.game.gameOver) {
      setTimeout(() => this.showGameOver(), 500);
    } else {
      setTimeout(() => this.triggerAiTurn(), 400);
    }
  }

  onResign() {
    if (this.aiThinking || this.game.gameOver || this.reviewMode || this.inDojoMode) return;
    this.game.resign();
    this.setIntent('Resignation', 'You yielded the game.', 'Black resigned');
    this.updateUI();
    setTimeout(() => this.showGameOver(), 400);
  }

  onUndo() {
    if (this.aiThinking || this.reviewMode || this.inDojoMode) return;
    // Undo both AI move and Player move to return turn to player
    const undone1 = this.game.undo();
    const undone2 = this.game.undo();

    if (undone1 || undone2) {
      this.updateUI();
      this.showToast('Move undone');
    }
  }

  onExportSgf() {
    const sgf = SgfParser.exportToSgf(this.game, {
      blackPlayer: 'Human',
      whitePlayer: `Suiji AI (Level ${this.ai.level})`
    });

    const blob = new Blob([sgf], { type: 'application/x-go-sgf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suiji-match-${Date.now()}.sgf`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Game exported as SGF file');
  }

  onNewGame() {
    if (this.reviewMode) this.closeReview();
    this.game.reset();
    this.aiThinking = false;
    this.els.thinkingOverlay.classList.remove('show');
    this.setIntent('Opening', 'Black plays first — the board begins empty.', 'Awaiting opening');
    this.updateUI();
    this.showToast('New game initiated');
  }

  showGameOver() {
    let title = 'Game Complete';
    let sub = '';

    if (this.game.resignedBy) {
      title = this.game.winner === BLACK ? 'Black Wins by Resignation' : 'White Wins by Resignation';
      sub = this.game.resignedBy === BLACK ? 'You resigned' : 'AI resigned';
    } else {
      const t = this.game.calculateTerritory();
      const diff = Math.abs(t.blackArea - t.whiteArea).toFixed(1);
      if (this.game.winner === BLACK) {
        title = 'Black Wins';
        sub = `Victory by ${diff} points`;
      } else if (this.game.winner === WHITE) {
        title = 'White Wins';
        sub = `Victory by ${diff} points`;
      } else {
        title = 'Jigo (Draw)';
        sub = 'Equal territory & stones';
      }
    }

    this.els.goTitle.textContent = title;
    this.els.goSub.textContent = sub;

    const t = this.game.calculateTerritory();
    this.els.goBlack.textContent = t.blackArea.toFixed(0);
    this.els.goWhite.textContent = t.whiteArea.toFixed(1);

    this.els.gameOverCard.classList.add('show');
  }

  openReview() {
    if (this.game.history.length === 0) {
      this.showToast('No moves to review');
      return;
    }
    this.reviewMode = true;
    this.reviewIndex = this.game.history.length;
    this.els.replaySlider.max = this.game.history.length;
    this.els.replaySlider.value = this.reviewIndex;
    this.els.replayBar.classList.add('show');
    this.scrubReview(this.reviewIndex);
  }

  closeReview() {
    this.reviewMode = false;
    this.els.replayBar.classList.remove('show');
    if (this.reviewInterval) {
      clearInterval(this.reviewInterval);
      this.reviewInterval = null;
      this.els.replayPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    if (this.game.history.length > 0) {
      const last = this.game.history[this.game.history.length - 1];
      this.game.board = last.boardSnapshot.map(r => [...r]);
      this.game.captures = { ...last.captures };
      this.game.lastMove = last.type === 'move' ? { x: last.x, y: last.y, color: last.color } : null;
    }
    this.updateUI();
  }

  scrubReview(idx) {
    if (idx < 0 || idx > this.game.history.length) return;
    this.reviewIndex = idx;
    this.els.replaySlider.value = idx;

    let reason = '';

    if (idx === 0) {
      this.game.board = Array(this.game.size).fill(0).map(() => Array(this.game.size).fill(0));
      this.game.captures = { [BLACK]: 0, [WHITE]: 0 };
      this.game.lastMove = null;
      this.els.replayInfo.querySelector('.move-num').textContent = 'Initial Board';
      this.els.replayReason.textContent = '';
    } else {
      const record = this.game.history[idx - 1];
      this.game.board = record.boardSnapshot.map(r => [...r]);
      this.game.captures = { ...record.captures };

      if (record.type === 'move') {
        this.game.lastMove = { x: record.x, y: record.y, color: record.color };
        const colorName = record.color === BLACK ? 'Black' : 'White';
        const coord = coordToName(record.x, record.y, this.game.size);
        this.els.replayInfo.querySelector('.move-num').textContent = `Move ${idx} • ${colorName} at ${coord}`;

        if (record.captured.length > 0) {
          reason = `Captured ${record.captured.length} stone${record.captured.length > 1 ? 's' : ''}`;
        }
      } else {
        this.game.lastMove = null;
        this.els.replayInfo.querySelector('.move-num').textContent = `Move ${idx} • ${record.color === BLACK ? 'Black' : 'White'} ${record.type}`;
      }
    }

    this.els.replayReason.textContent = reason;
    this.updateUI(false);
  }

  toggleReplayPlay() {
    if (this.reviewInterval) {
      clearInterval(this.reviewInterval);
      this.reviewInterval = null;
      this.els.replayPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
      if (this.reviewIndex >= this.game.history.length) this.reviewIndex = 0;
      this.els.replayPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
      this.reviewInterval = setInterval(() => {
        this.reviewIndex++;
        if (this.reviewIndex > this.game.history.length) {
          clearInterval(this.reviewInterval);
          this.reviewInterval = null;
          this.els.replayPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
          this.reviewIndex = this.game.history.length;
          return;
        }
        this.scrubReview(this.reviewIndex);
      }, 950);
    }
  }

  updateUI(updateMoves = true) {
    this.updatePlayerTags();
    this.els.moveCounter.textContent = this.game.history.length;
    this.els.capturesBlack.textContent = this.game.captures[BLACK];
    this.els.capturesWhite.textContent = this.game.captures[WHITE];

    const canAct = !this.aiThinking && !this.game.gameOver && !this.reviewMode && !this.inDojoMode;
    this.els.btnPass.disabled = !canAct || this.game.currentPlayer !== BLACK;
    this.els.btnResign.disabled = !canAct;

    if (updateMoves) this.renderMoveList();
    this.updateTerritory();
  }

  updatePlayerTags() {
    if (this.game.gameOver) {
      this.els.playerBlack.classList.remove('active');
      this.els.playerWhite.classList.remove('active');
      return;
    }
    const isBlackTurn = this.game.currentPlayer === BLACK && !this.aiThinking;
    this.els.playerBlack.classList.toggle('active', isBlackTurn);
    this.els.playerWhite.classList.toggle('active', !isBlackTurn);
  }

  renderMoveList() {
    if (this.game.history.length === 0) {
      this.els.moveList.innerHTML = '<div class="move-empty">The board awaits the first stone.</div>';
      return;
    }

    this.els.moveList.innerHTML = this.game.history.map((m, idx) => {
      const isCur = idx === this.game.history.length - 1 && !this.reviewMode ? 'current' : '';
      const colorCls = m.color === BLACK ? 'black' : 'white';
      if (m.type === 'move') {
        const coord = coordToName(m.x, m.y, this.game.size);
        const cap = m.captured.length > 0 ? `<span class="move-cap">×${m.captured.length}</span>` : '<span></span>';
        return `
          <div class="move-row ${isCur}" data-index="${idx}">
            <span class="move-num">${idx + 1}</span>
            <span class="move-stone ${colorCls}"></span>
            <span class="move-coord">${coord}</span>
            ${cap}
          </div>
        `;
      } else {
        return `
          <div class="move-row ${isCur}" data-index="${idx}">
            <span class="move-num">${idx + 1}</span>
            <span class="move-stone ${colorCls}"></span>
            <span class="move-coord">— ${m.type} —</span>
            <span></span>
          </div>
        `;
      }
    }).join('');

    this.els.moveList.scrollTop = this.els.moveList.scrollHeight;
  }

  updateTerritory() {
    const t = this.game.calculateTerritory();
    this.heatmapRenderer.update(t.influence, this.game.board);

    this.els.blackScore.textContent = t.blackArea.toFixed(0);
    this.els.whiteScore.textContent = t.whiteArea.toFixed(1);

    const total = t.blackArea + t.whiteArea;
    if (total > 0) {
      this.els.blackBar.style.width = `${(t.blackArea / total) * 100}%`;
      this.els.whiteBar.style.width = `${(t.whiteArea / total) * 100}%`;
    }

    const diff = t.blackArea - t.whiteArea;
    if (Math.abs(diff) < 1) {
      this.els.scoreMargin.innerHTML = `Even balance — match is in contest`;
    } else if (diff > 0) {
      this.els.scoreMargin.innerHTML = `Black leads by <strong>${diff.toFixed(1)}</strong> pts`;
    } else {
      this.els.scoreMargin.innerHTML = `White leads by <strong>${Math.abs(diff).toFixed(1)}</strong> pts`;
    }
  }

  setIntent(title, text, meta) {
    this.els.intentLabel.textContent = title;
    this.els.intentText.textContent = text;
    this.els.intentMove.textContent = `Move ${this.game.history.length}`;
    if (meta) {
      this.els.intentMeta.innerHTML = `<span>${meta}</span>`;
    }
  }

  showToast(msg) {
    this.els.toast.textContent = msg;
    this.els.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.els.toast.classList.remove('show'), 2800);
  }

  startTimer() {
    setInterval(() => {
      if (!this.game.startTime || this.game.gameOver) return;
      const elapsed = Math.floor((Date.now() - this.game.startTime) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      this.els.gameTime.textContent = `${m}:${s}`;
    }, 1000);
  }
}

// Launch Suiji
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SuijiApp();
});
