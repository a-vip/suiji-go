import { BLACK, WHITE } from '../../core/Constants.js';

export const PRACTICE_PUZZLES = [
  {
    id: 'puzzle-corner-life',
    category: 'puzzles',
    title: 'Puzzle 1: Corner Life or Death',
    subtitle: 'Black to live unconditionally',
    boardSize: 9,
    difficulty: 'Beginner (25k-20k)',
    description: `White has surrounded Black\'s corner. Black must find the single vital point to form two independent living eyes. One wrong move and the whole corner dies!`,
    initialStones: [
      { x: 0, y: 1, color: BLACK },
      { x: 1, y: 1, color: BLACK },
      { x: 2, y: 0, color: BLACK },
      { x: 2, y: 1, color: BLACK },
      { x: 0, y: 2, color: WHITE },
      { x: 1, y: 2, color: WHITE },
      { x: 2, y: 2, color: WHITE },
      { x: 3, y: 0, color: WHITE },
      { x: 3, y: 1, color: WHITE }
    ],
    markers: [
      { type: 'target', x: 0, y: 0, label: 'Vital Eye' }
    ],
    playerColor: BLACK,
    instruction: 'Black to play: Find the vital point to secure two eyes!',
    expectedMove: { x: 0, y: 0 },
    explanation: 'Correct! Playing [0,0] creates two separate living eyes at [1,0] and [0,0]. Black is completely safe.'
  },
  {
    id: 'puzzle-vital-atari',
    category: 'puzzles',
    title: 'Puzzle 2: Cutting Point Atari',
    subtitle: 'Black to capture the two cutting stones',
    boardSize: 9,
    difficulty: 'Novice (20k-15k)',
    description: `Two White stones are wedged between your forces. Attack their remaining weakness before they can connect!`,
    initialStones: [
      { x: 3, y: 4, color: WHITE },
      { x: 4, y: 4, color: WHITE },
      { x: 2, y: 4, color: BLACK },
      { x: 5, y: 4, color: BLACK },
      { x: 3, y: 3, color: BLACK },
      { x: 4, y: 3, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 3, y: 5, label: 'Atari' }
    ],
    playerColor: BLACK,
    instruction: 'Strike the final liberty of the White pair at [3,5]!',
    expectedMove: { x: 3, y: 5 },
    explanation: 'Atari! White cannot connect because [4,5] would also be captured immediately. The cutting stones are doomed.'
  },
  {
    id: 'puzzle-false-eye',
    category: 'puzzles',
    title: 'Puzzle 3: Exposing the False Eye',
    subtitle: 'Black to kill White\'s group',
    boardSize: 9,
    difficulty: 'Intermediate (15k-10k)',
    description: `White believes they have two eyes, but one of them is an illusion—a **false eye**! Play on the diagonal vital point to prevent White from making a real eye.`,
    initialStones: [
      { x: 1, y: 0, color: WHITE },
      { x: 0, y: 1, color: WHITE },
      { x: 2, y: 1, color: WHITE },
      { x: 1, y: 2, color: WHITE },
      { x: 0, y: 2, color: BLACK },
      { x: 2, y: 2, color: BLACK },
      { x: 1, y: 3, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 1, y: 1, label: 'Strike' }
    ],
    playerColor: BLACK,
    instruction: 'Plunge your stone into [1,1] to falsify White\'s eye and crush their defense!',
    expectedMove: { x: 1, y: 1 },
    explanation: 'Bullseye! [1,1] ruins the false eye. White cannot form two real eyes and collapses.'
  }
];
