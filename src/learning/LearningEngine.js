import { RULES_LESSONS } from './curriculum/rulesLessons.js';
import { TACTICS_LESSONS } from './curriculum/tacticsLessons.js';
import { PRACTICE_PUZZLES } from './curriculum/practicePuzzles.js';
import { BLACK, WHITE } from '../core/Constants.js';

export class LearningEngine {
  constructor(game, soundEngine, onStateChange) {
    this.game = game;
    this.soundEngine = soundEngine;
    this.onStateChange = onStateChange;

    this.categories = {
      rules: RULES_LESSONS,
      tactics: TACTICS_LESSONS,
      puzzles: PRACTICE_PUZZLES
    };

    this.activeCategory = 'rules';
    this.activeLessonIndex = 0;
    this.currentLesson = null;
    this.lessonPhase = 0; // 0 = initial move, 1 = follow-up move (if applicable)
    this.completedLessons = this.loadCompleted();
  }

  loadCompleted() {
    try {
      const stored = localStorage.getItem('suiji_completed_lessons');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      return new Set();
    }
  }

  saveCompleted() {
    try {
      localStorage.setItem('suiji_completed_lessons', JSON.stringify(Array.from(this.completedLessons)));
    } catch (e) {}
  }

  getLessons(category = this.activeCategory) {
    return this.categories[category] || [];
  }

  selectLesson(category, index) {
    this.activeCategory = category;
    this.activeLessonIndex = index;
    this.lessonPhase = 0;

    const list = this.getLessons(category);
    this.currentLesson = list[index] || null;

    if (this.currentLesson) {
      this.loadCurrentLesson();
    }
  }

  loadCurrentLesson() {
    if (!this.currentLesson) return;
    const lesson = this.currentLesson;

    // Setup board
    this.game.setupCustomBoard(lesson.initialStones, lesson.boardSize || 9);
    this.game.currentPlayer = lesson.playerColor || BLACK;

    this.notifyState({
      status: 'ready',
      message: lesson.instruction,
      markers: lesson.markers || []
    });
  }

  handleUserMove(x, y) {
    if (!this.currentLesson) return { handled: false };

    const lesson = this.currentLesson;
    const targetMove = this.lessonPhase === 0 ? lesson.expectedMove : lesson.followUpMove;

    if (x === targetMove.x && y === targetMove.y) {
      // Correct move
      const placeRes = this.game.place(x, y);
      this.soundEngine.playStoneClick(1.2);
      if (placeRes.captured && placeRes.captured.length > 0) {
        this.soundEngine.playCaptureSound(placeRes.captured.length);
      }

      // Check if there is a follow-up phase (e.g. AI plays an escaping move)
      if (this.lessonPhase === 0 && lesson.aiResponse && lesson.followUpMove) {
        this.lessonPhase = 1;

        setTimeout(() => {
          this.game.place(lesson.aiResponse.x, lesson.aiResponse.y);
          this.soundEngine.playStoneClick(0.9);

          this.notifyState({
            status: 'follow-up',
            message: lesson.followUpInstruction,
            markers: [{ type: 'target', x: lesson.followUpMove.x, y: lesson.followUpMove.y, label: 'Block' }]
          });
        }, 500);

        return { handled: true, correct: true, phase: 1 };
      }

      // Completed scenario!
      this.completedLessons.add(lesson.id);
      this.saveCompleted();
      this.soundEngine.playSuccessChime();

      this.notifyState({
        status: 'completed',
        message: lesson.explanation,
        markers: []
      });

      return { handled: true, correct: true, completed: true };
    } else {
      // Incorrect attempt
      this.notifyState({
        status: 'incorrect',
        message: `Not quite! Aim for the targeted intersection to execute the technique. Try again!`,
        markers: lesson.markers || []
      });
      return { handled: true, correct: false };
    }
  }

  nextLesson() {
    const list = this.getLessons();
    if (this.activeLessonIndex < list.length - 1) {
      this.selectLesson(this.activeCategory, this.activeLessonIndex + 1);
    } else {
      // Switch category if at end
      if (this.activeCategory === 'rules') {
        this.selectLesson('tactics', 0);
      } else if (this.activeCategory === 'tactics') {
        this.selectLesson('puzzles', 0);
      }
    }
  }

  restartLesson() {
    this.lessonPhase = 0;
    this.loadCurrentLesson();
  }

  notifyState(extra = {}) {
    if (this.onStateChange) {
      this.onStateChange({
        category: this.activeCategory,
        lesson: this.currentLesson,
        lessonIndex: this.activeLessonIndex,
        totalLessons: this.getLessons().length,
        isCompleted: this.currentLesson ? this.completedLessons.has(this.currentLesson.id) : false,
        ...extra
      });
    }
  }
}
