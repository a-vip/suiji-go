import { RULES_LESSONS } from './curriculum/rulesLessons.js';
import { TACTICS_LESSONS } from './curriculum/tacticsLessons.js';
import { SHAPES_LESSONS } from './curriculum/shapesLessons.js';
import { PRACTICE_PUZZLES } from './curriculum/practicePuzzles.js';
import { BLACK, WHITE } from '../core/Constants.js';

export class LearningEngine {
  constructor(game, soundEngine, onStateChange) {
    this.game = game;
    this.soundEngine = soundEngine;
    this.onStateChange = onStateChange;

    this.categories = {
      rules: { title: '1. Rules & Basics', lessons: RULES_LESSONS },
      tactics: { title: '2. Named Moves & Tactics', lessons: TACTICS_LESSONS },
      shapes: { title: '3. Essential Shapes (Codex)', lessons: SHAPES_LESSONS },
      puzzles: { title: '4. Tsumego Challenges', lessons: PRACTICE_PUZZLES }
    };

    this.activeCategory = 'rules';
    this.activeLessonIndex = 0;
    this.currentLesson = null;
    this.lessonPhase = 0;
    this.hintRevealed = false;
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
    return this.categories[category] ? this.categories[category].lessons : [];
  }

  selectLesson(category, index) {
    this.activeCategory = category;
    this.activeLessonIndex = index;
    this.lessonPhase = 0;
    this.hintRevealed = false;

    const list = this.getLessons(category);
    this.currentLesson = list[index] || null;

    if (this.currentLesson) {
      this.loadCurrentLesson();
    }
  }

  loadCurrentLesson() {
    if (!this.currentLesson) return;
    const lesson = this.currentLesson;

    // Setup board layout
    this.game.setupCustomBoard(lesson.initialStones, lesson.boardSize || 9, lesson.playerColor || BLACK);

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
      // Correct Move!
      const placeRes = this.game.place(x, y);
      this.soundEngine.playStoneClick(1.2);
      if (placeRes.captured && placeRes.captured.length > 0) {
        this.soundEngine.playCaptureSound(placeRes.captured.length);
      }

      // Check if there is an AI follow-up response in the scenario
      if (this.lessonPhase === 0 && lesson.aiResponse && lesson.followUpMove) {
        this.lessonPhase = 1;

        this.notifyState({
          status: 'ai-replying',
          message: 'White is countering...',
          markers: []
        });

        setTimeout(() => {
          this.game.place(lesson.aiResponse.x, lesson.aiResponse.y);
          this.soundEngine.playStoneClick(0.9);

          this.notifyState({
            status: 'follow-up',
            message: lesson.followUpInstruction,
            markers: [
              { type: 'target', x: lesson.followUpMove.x, y: lesson.followUpMove.y, label: 'Trap' }
            ]
          });
        }, 550);

        return { handled: true, correct: true, phase: 1 };
      }

      // Scenario completed!
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
      this.soundEngine.playPassSound();
      this.notifyState({
        status: 'incorrect',
        message: `Not quite! Aim for the strategic point to execute the technique. Try again!`,
        markers: lesson.markers || []
      });
      return { handled: true, correct: false };
    }
  }

  showHint() {
    if (!this.currentLesson) return;
    this.hintRevealed = true;
    const lesson = this.currentLesson;
    const target = this.lessonPhase === 0 ? lesson.expectedMove : lesson.followUpMove;

    this.notifyState({
      status: 'hint',
      message: `💡 Hint: Play at [${target.x}, ${target.y}] to execute the move!`,
      markers: [
        { type: 'target', x: target.x, y: target.y, label: 'Play Here', color: '#b8860b' }
      ]
    });
  }

  prevLesson() {
    if (this.activeLessonIndex > 0) {
      this.selectLesson(this.activeCategory, this.activeLessonIndex - 1);
    }
  }

  nextLesson() {
    const list = this.getLessons();
    if (this.activeLessonIndex < list.length - 1) {
      this.selectLesson(this.activeCategory, this.activeLessonIndex + 1);
    } else {
      // Advance to next category
      const catKeys = Object.keys(this.categories);
      const curCatIdx = catKeys.indexOf(this.activeCategory);
      if (curCatIdx < catKeys.length - 1) {
        this.selectLesson(catKeys[curCatIdx + 1], 0);
      }
    }
  }

  restartLesson() {
    this.lessonPhase = 0;
    this.hintRevealed = false;
    this.loadCurrentLesson();
  }

  notifyState(extra = {}) {
    if (this.onStateChange) {
      this.onStateChange({
        category: this.activeCategory,
        categories: this.categories,
        lesson: this.currentLesson,
        lessonIndex: this.activeLessonIndex,
        totalLessons: this.getLessons().length,
        isCompleted: this.currentLesson ? this.completedLessons.has(this.currentLesson.id) : false,
        ...extra
      });
    }
  }
}
