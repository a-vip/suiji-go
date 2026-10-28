export class LearningUI {
  constructor(learningEngine, boardRenderer) {
    this.engine = learningEngine;
    this.boardRenderer = boardRenderer;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.els = {
      // Progress
      progressCount: document.getElementById('dojoProgressCount'),
      progressBar: document.getElementById('dojoProgressBar'),
      // Category buttons
      catBtns: document.querySelectorAll('.dojo-cat-btn'),
      // Lessons list container
      lessonsList: document.getElementById('dojoLessonsList'),
      // Scenario Stage elements
      scenBadge: document.getElementById('scenBadge'),
      scenTitle: document.getElementById('scenTitle'),
      scenSub: document.getElementById('scenSub'),
      scenDesc: document.getElementById('scenDesc'),
      scenObjective: document.getElementById('scenObjective'),
      scenFeedback: document.getElementById('scenFeedback'),
      // Stage buttons
      btnHint: document.getElementById('btnScenHint'),
      btnReset: document.getElementById('btnScenReset'),
      btnPrev: document.getElementById('btnScenPrev'),
      btnNext: document.getElementById('btnScenNext')
    };
  }

  bindEvents() {
    // Category switcher
    if (this.els.catBtns) {
      this.els.catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.els.catBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.dataset.cat;
          this.engine.selectLesson(cat, 0);
          this.renderLessonsList();
          this.clearFeedback();
        });
      });
    }

    // Hint button
    if (this.els.btnHint) {
      this.els.btnHint.addEventListener('click', () => {
        this.engine.showHint();
      });
    }

    // Reset scenario button
    if (this.els.btnReset) {
      this.els.btnReset.addEventListener('click', () => {
        this.engine.restartLesson();
        this.clearFeedback();
      });
    }

    // Prev / Next buttons
    if (this.els.btnPrev) {
      this.els.btnPrev.addEventListener('click', () => {
        this.engine.prevLesson();
        this.renderLessonsList();
        this.clearFeedback();
      });
    }

    if (this.els.btnNext) {
      this.els.btnNext.addEventListener('click', () => {
        this.engine.nextLesson();
        this.renderLessonsList();
        this.clearFeedback();
      });
    }
  }

  renderLessonsList() {
    if (!this.els.lessonsList) return;
    const lessons = this.engine.getLessons();
    const currentIdx = this.engine.activeLessonIndex;

    this.els.lessonsList.innerHTML = lessons.map((item, idx) => {
      const activeCls = idx === currentIdx ? 'active' : '';
      const isDone = this.engine.completedLessons.has(item.id);
      return `
        <div class="lesson-item ${activeCls}" data-idx="${idx}">
          <div class="lesson-item-info">
            <span class="lesson-item-title">${item.title}</span>
            <span class="lesson-item-sub">${item.subtitle || ''}</span>
          </div>
          ${isDone ? '<div class="lesson-check-icon"><i class="fa-solid fa-check"></i></div>' : ''}
        </div>
      `;
    }).join('');

    this.els.lessonsList.querySelectorAll('.lesson-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        this.engine.selectLesson(this.engine.activeCategory, idx);
        this.renderLessonsList();
        this.clearFeedback();
      });
    });

    this.updateProgress();
  }

  updateProgress() {
    let total = 0;
    let completed = 0;

    Object.keys(this.engine.categories).forEach(cat => {
      const list = this.engine.getLessons(cat);
      total += list.length;
      list.forEach(l => {
        if (this.engine.completedLessons.has(l.id)) completed++;
      });
    });

    if (this.els.progressCount) {
      this.els.progressCount.textContent = `${completed} / ${total} Mastered`;
    }
    if (this.els.progressBar) {
      const pct = total > 0 ? (completed / total) * 100 : 0;
      this.els.progressBar.style.width = `${pct}%`;
    }

    // Update category badge count
    if (this.els.catBtns) {
      this.els.catBtns.forEach(btn => {
        const cat = btn.dataset.cat;
        const countBadge = btn.querySelector('.badge-count');
        if (countBadge) {
          const catList = this.engine.getLessons(cat);
          const catDone = catList.filter(l => this.engine.completedLessons.has(l.id)).length;
          countBadge.textContent = `${catDone}/${catList.length}`;
        }
      });
    }
  }

  updateStage(state) {
    if (!state || !state.lesson) return;
    const lesson = state.lesson;

    const catBadgeNames = {
      rules: 'Fundamentals of Go',
      tactics: 'Master Tactics & Shapes',
      shapes: 'The Go Codex • Shapes',
      puzzles: 'Tsumego Life & Death'
    };

    if (this.els.scenBadge) {
      this.els.scenBadge.textContent = catBadgeNames[state.category] || 'Suiji Academy';
    }
    if (this.els.scenTitle) {
      this.els.scenTitle.textContent = lesson.title;
    }
    if (this.els.scenSub) {
      this.els.scenSub.textContent = lesson.subtitle || '';
    }
    if (this.els.scenDesc) {
      this.els.scenDesc.innerHTML = lesson.description;
    }
    if (this.els.scenObjective) {
      this.els.scenObjective.textContent = state.message || lesson.instruction;
    }

    // Set interactive markers on canvas board
    this.boardRenderer.setTutorialMarkers(state.markers || []);

    // Buttons state
    if (this.els.btnPrev) {
      this.els.btnPrev.disabled = state.lessonIndex === 0;
    }

    // Feedback state
    if (state.status === 'completed') {
      this.showSuccess(state.message || lesson.explanation);
      this.renderLessonsList(); // refresh checkmarks
      if (this.els.btnNext) {
        this.els.btnNext.classList.add('primary');
      }
    } else if (state.status === 'incorrect') {
      this.showError(state.message);
    } else if (state.status === 'hint') {
      this.showHint(state.message);
    } else if (state.status === 'ai-replying') {
      this.showInfo(state.message);
    } else {
      this.clearFeedback();
    }
  }

  showSuccess(text) {
    if (!this.els.scenFeedback) return;
    this.els.scenFeedback.className = 'scenario-feedback success';
    this.els.scenFeedback.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Splendid!</strong> ${text}`;
  }

  showError(text) {
    if (!this.els.scenFeedback) return;
    this.els.scenFeedback.className = 'scenario-feedback error';
    this.els.scenFeedback.innerHTML = `<strong><i class="fa-solid fa-circle-xmark"></i> Try Again:</strong> ${text}`;
  }

  showHint(text) {
    if (!this.els.scenFeedback) return;
    this.els.scenFeedback.className = 'scenario-feedback hint';
    this.els.scenFeedback.innerHTML = `<strong><i class="fa-solid fa-lightbulb"></i> Strategic Hint:</strong> ${text}`;
  }

  showInfo(text) {
    if (!this.els.scenFeedback) return;
    this.els.scenFeedback.className = 'scenario-feedback';
    this.els.scenFeedback.style.display = 'block';
    this.els.scenFeedback.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${text}`;
  }

  clearFeedback() {
    if (!this.els.scenFeedback) return;
    this.els.scenFeedback.style.display = 'none';
    this.els.scenFeedback.className = 'scenario-feedback';
    this.els.scenFeedback.innerHTML = '';
  }
}
