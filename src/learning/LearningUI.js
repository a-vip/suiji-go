import { RULES_LESSONS } from './curriculum/rulesLessons.js';
import { TACTICS_LESSONS } from './curriculum/tacticsLessons.js';
import { PRACTICE_PUZZLES } from './curriculum/practicePuzzles.js';

export class LearningUI {
  constructor(learningEngine, boardRenderer, onExitDojo) {
    this.engine = learningEngine;
    this.boardRenderer = boardRenderer;
    this.onExitDojo = onExitDojo;

    this.isOpen = false;
    this.createDOM();
    this.bindEvents();
  }

  createDOM() {
    const modal = document.createElement('div');
    modal.className = 'dojo-modal';
    modal.id = 'dojoModal';

    modal.innerHTML = `
      <div class="dojo-container">
        <!-- Header -->
        <div class="dojo-header">
          <div class="dojo-title-group">
            <div class="dojo-seal">道</div>
            <div>
              <h2 class="dojo-title">Suiji Academy • 囲碁道場</h2>
              <div class="dojo-tagline">Interactive Masterclass & Tactics Dojo</div>
            </div>
          </div>
          <button class="btn" id="dojoCloseBtn">
            <i class="fa-solid fa-xmark"></i> Return to Board
          </button>
        </div>

        <!-- Category Tabs -->
        <div class="dojo-tabs" id="dojoTabs">
          <button class="dojo-tab active" data-cat="rules">
            <i class="fa-solid fa-scroll"></i> 1. Rules & Basics
          </button>
          <button class="dojo-tab" data-cat="tactics">
            <i class="fa-solid fa-khanda"></i> 2. Named Moves & Tactics
          </button>
          <button class="dojo-tab" data-cat="puzzles">
            <i class="fa-solid fa-puzzle-piece"></i> 3. Tsumego Challenges
          </button>
        </div>

        <!-- Body -->
        <div class="dojo-body">
          <!-- Sidebar -->
          <div class="dojo-sidebar" id="dojoSidebar"></div>

          <!-- Stage -->
          <div class="dojo-stage" id="dojoStage">
            <div class="scenario-header">
              <div class="scenario-category-badge" id="scenCatBadge">Rules of Go</div>
              <h3 class="scenario-title" id="scenTitle">Title</h3>
              <p class="scenario-desc" id="scenDesc">Description</p>
            </div>

            <div class="scenario-instruction-box">
              <i class="fa-solid fa-hand-pointer"></i>
              <div class="scenario-instruction-text" id="scenInstruction">Instruction text...</div>
            </div>

            <div class="scenario-feedback" id="scenFeedback"></div>

            <div class="dojo-actions">
              <button class="btn" id="scenRetryBtn">
                <i class="fa-solid fa-rotate-left"></i> Reset Scenario
              </button>
              <button class="btn primary" id="scenNextBtn">
                Next Lesson <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    this.els = {
      modal,
      closeBtn: modal.querySelector('#dojoCloseBtn'),
      tabs: modal.querySelectorAll('.dojo-tab'),
      sidebar: modal.querySelector('#dojoSidebar'),
      scenCatBadge: modal.querySelector('#scenCatBadge'),
      scenTitle: modal.querySelector('#scenTitle'),
      scenDesc: modal.querySelector('#scenDesc'),
      scenInstruction: modal.querySelector('#scenInstruction'),
      scenFeedback: modal.querySelector('#scenFeedback'),
      scenRetryBtn: modal.querySelector('#scenRetryBtn'),
      scenNextBtn: modal.querySelector('#scenNextBtn')
    };
  }

  bindEvents() {
    this.els.closeBtn.addEventListener('click', () => this.close());

    this.els.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.els.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;
        this.engine.selectLesson(cat, 0);
        this.renderSidebar();
      });
    });

    this.els.scenRetryBtn.addEventListener('click', () => {
      this.engine.restartLesson();
      this.clearFeedback();
    });

    this.els.scenNextBtn.addEventListener('click', () => {
      this.engine.nextLesson();
      this.renderSidebar();
      this.clearFeedback();
    });
  }

  open() {
    this.isOpen = true;
    this.els.modal.classList.add('show');
    this.engine.selectLesson(this.engine.activeCategory, this.engine.activeLessonIndex);
    this.renderSidebar();
    this.clearFeedback();
  }

  close() {
    this.isOpen = false;
    this.els.modal.classList.remove('show');
    this.boardRenderer.setTutorialMarkers([]);
    if (this.onExitDojo) {
      this.onExitDojo();
    }
  }

  renderSidebar() {
    const list = this.engine.getLessons();
    const currentIdx = this.engine.activeLessonIndex;

    this.els.sidebar.innerHTML = list.map((item, idx) => {
      const activeClass = idx === currentIdx ? 'active' : '';
      const isDone = this.engine.completedLessons.has(item.id);
      return `
        <div class="lesson-card ${activeClass}" data-idx="${idx}">
          <div class="lesson-card-info">
            <h4>${item.title}</h4>
            <p>${item.subtitle || ''}</p>
          </div>
          ${isDone ? '<div class="lesson-badge-done"><i class="fa-solid fa-check"></i></div>' : ''}
        </div>
      `;
    }).join('');

    this.els.sidebar.querySelectorAll('.lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx, 10);
        this.engine.selectLesson(this.engine.activeCategory, idx);
        this.renderSidebar();
        this.clearFeedback();
      });
    });
  }

  updateStage(state) {
    if (!state || !state.lesson) return;
    const lesson = state.lesson;

    const catLabels = {
      rules: 'Fundamentals of Go',
      tactics: 'Master Tactics & Shapes',
      puzzles: 'Tsumego Life & Death Challenge'
    };
    this.els.scenCatBadge.textContent = catLabels[state.category] || 'Suiji Dojo';
    this.els.scenTitle.textContent = lesson.title;
    this.els.scenDesc.innerHTML = lesson.description;
    this.els.scenInstruction.textContent = state.message || lesson.instruction;

    // Update board markers on main renderer
    this.boardRenderer.setTutorialMarkers(state.markers || []);

    if (state.status === 'completed') {
      this.showSuccess(state.message || lesson.explanation);
      this.renderSidebar(); // refresh checkmarks
    } else if (state.status === 'incorrect') {
      this.showError(state.message);
    } else if (state.status === 'follow-up') {
      this.clearFeedback();
    }
  }

  showSuccess(text) {
    this.els.scenFeedback.className = 'scenario-feedback success';
    this.els.scenFeedback.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Excellent!</strong> ${text}`;
  }

  showError(text) {
    this.els.scenFeedback.className = 'scenario-feedback error';
    this.els.scenFeedback.innerHTML = `<strong><i class="fa-solid fa-triangle-exclamation"></i> Try Again:</strong> ${text}`;
  }

  clearFeedback() {
    this.els.scenFeedback.style.display = 'none';
    this.els.scenFeedback.className = 'scenario-feedback';
    this.els.scenFeedback.innerHTML = '';
  }
}
