import { GoGame } from '../src/core/GoGame.js';
import { GoRules } from '../src/core/GoRules.js';
import { GoAI } from '../src/ai/GoAI.js';
import { SgfParser } from '../src/core/SgfParser.js';
import { LearningEngine } from '../src/learning/LearningEngine.js';
import { BLACK, WHITE, EMPTY } from '../src/core/Constants.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- TEST SUITE 1: GoRules & Liberties ---');
{
  const board = Array(9).fill(0).map(() => Array(9).fill(0));
  board[4][4] = BLACK;
  const group = GoRules.findGroup(4, 4, board, 9);
  assert(group.liberties === 4, 'Single center stone has 4 liberties');

  board[4][5] = BLACK;
  const group2 = GoRules.findGroup(4, 4, board, 9);
  assert(group2.liberties === 6, 'Two connected stones share 6 liberties');
}

console.log('--- TEST SUITE 2: Captures & Suicide Rule ---');
{
  const game = new GoGame(9);
  // Surround point (1,1) with White
  game.board[0][1] = WHITE;
  game.board[2][1] = WHITE;
  game.board[1][0] = WHITE;
  game.board[1][2] = WHITE;
  game.currentPlayer = BLACK;

  // Black playing at (1,1) without capturing is suicide
  const res = game.place(1, 1);
  assert(!res.valid && res.reason === 'suicide', 'Suicide move is rejected');

  // Put White in Atari and test capture
  const game2 = new GoGame(9);
  game2.board[4][4] = WHITE;
  game2.board[3][4] = BLACK;
  game2.board[5][4] = BLACK;
  game2.board[4][3] = BLACK;
  game2.currentPlayer = BLACK;

  const capRes = game2.place(4, 5);
  assert(capRes.valid, 'Move closing final liberty is valid');
  assert(capRes.captured.length === 1, 'Opponent stone is captured');
  assert(game2.board[4][4] === EMPTY, 'Captured stone is cleared from board');
  assert(game2.captures[BLACK] === 1, 'Capture count incremented for Black');
}

console.log('--- TEST SUITE 3: Ko Rule Enforcement ---');
{
  const game = new GoGame(9);
  // Correct classic Ko formation:
  // Black surrounds (4,4) from 3 sides
  game.board[3][4] = BLACK;
  game.board[4][3] = BLACK;
  game.board[4][5] = BLACK;

  // White surrounds (5,4) from 3 sides
  game.board[5][3] = WHITE;
  game.board[5][5] = WHITE;
  game.board[6][4] = WHITE;

  // White single stone at (4,4) in atari
  game.board[4][4] = WHITE;
  // (5,4) is EMPTY
  game.currentPlayer = BLACK;

  // Black plays at (5,4), capturing the White stone at (4,4)
  const takeKo = game.place(5, 4);
  assert(takeKo.valid && takeKo.captured.length === 1, 'Black captures Ko stone');
  assert(game.koPoint !== null && game.koPoint[0] === 4 && game.koPoint[1] === 4, 'Ko point is recorded at (4,4)');

  // White attempts immediate recapture at (4,4)
  const illegalKoRecapture = game.canPlace(4, 4, WHITE);
  assert(!illegalKoRecapture, 'White is forbidden from immediate Ko recapture');
}

console.log('--- TEST SUITE 4: Undo & History ---');
{
  const game = new GoGame(9);
  game.place(2, 2); // Black
  game.place(6, 6); // White
  assert(game.history.length === 2, 'History has 2 moves');

  game.undo();
  assert(game.history.length === 1, 'History has 1 move after undo');
  assert(game.board[6][6] === EMPTY, 'Undone move stone removed');
  assert(game.currentPlayer === WHITE, 'Current player restored to White');
}

console.log('--- TEST SUITE 5: Multi-Board Dimensions & AI Performance ---');
{
  for (const size of [9, 13, 19]) {
    const game = new GoGame(size);
    const ai = new GoAI(game, 2);
    game.place(Math.floor(size / 2), Math.floor(size / 2)); // Black plays Tengen

    const startTime = Date.now();
    const decision = ai.selectMove();
    const elapsed = Date.now() - startTime;

    assert(decision.move !== undefined || decision.pass === true, `AI selects valid move on ${size}x${size}`);
    assert(elapsed < 2000, `AI move evaluated quickly (${elapsed}ms) on ${size}x${size}`);
  }
}

console.log('--- TEST SUITE 6: Learning Engine & Scenarios ---');
{
  const mockSound = { playStoneClick() {}, playCaptureSound() {}, playPassSound() {}, playSuccessChime() {} };
  let lastState = null;
  const game = new GoGame(9);
  const engine = new LearningEngine(game, mockSound, (state) => {
    lastState = state;
  });

  // Load Rules lesson 1
  engine.selectLesson('rules', 0);
  assert(lastState !== null, 'LearningEngine notifies state on lesson selection');
  assert(lastState.lesson.id === 'lesson-grid', 'Lesson 1 (The Grid) loaded');

  // Test incorrect move
  const badMove = engine.handleUserMove(0, 0);
  assert(badMove.handled && !badMove.correct, 'Incorrect move handled properly');
  assert(lastState.status === 'incorrect', 'Status updated to incorrect');

  // Test correct move
  const expected = lastState.lesson.expectedMove;
  const goodMove = engine.handleUserMove(expected.x, expected.y);
  assert(goodMove.handled && goodMove.correct, 'Correct move accepted');
  assert(lastState.status === 'completed', 'Lesson completed successfully');
  assert(engine.completedLessons.has(lastState.lesson.id), 'Lesson marked as completed in progress tracker');

  // Test Tactics category (Ladder)
  engine.selectLesson('tactics', 0);
  assert(lastState.lesson.id === 'tactic-ladder', 'Tactics Lesson (Ladder) loaded');

  // Test Codex category (Shapes)
  engine.selectLesson('shapes', 0);
  assert(lastState.lesson.id === 'shape-ponnuki', 'Codex Lesson (Pon-nuki) loaded');

  // Test Tsumego category (Puzzles)
  engine.selectLesson('puzzles', 0);
  assert(lastState.lesson.id === 'puzzle-corner-life', 'Tsumego Puzzle loaded');
}

console.log('--- TEST SUITE 7: SGF Export & Import ---');
{
  const game = new GoGame(9);
  game.place(2, 2); // Black
  game.place(6, 6); // White
  const sgf = SgfParser.exportToSgf(game);
  assert(sgf.includes(';B[cc]') && sgf.includes(';W[gg]'), 'SGF correctly serializes coordinates');

  const parsed = SgfParser.importFromSgf(sgf);
  assert(parsed.size === 9, 'Parsed size matches 9');
  assert(parsed.moves.length === 2, 'Parsed moves count matches 2');
}

console.log(`\n========================================`);
console.log(`ALL TESTS COMPLETED: ${passed} Passed, ${failed} Failed`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
