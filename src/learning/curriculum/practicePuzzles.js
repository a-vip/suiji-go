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
  },
  {
    id: 'puzzle-ladder-finish',
    category: 'puzzles',
    title: 'Puzzle 4: The Ladder Corner Trap',
    subtitle: 'Black to prevent escape',
    boardSize: 9,
    difficulty: 'Novice (18k-12k)',
    description: `White\'s cutting stone is trying to break into the open board. Steer it diagonally into the corner where it will run out of liberties!`,
    initialStones: [
      { x: 5, y: 4, color: WHITE },
      { x: 5, y: 3, color: BLACK },
      { x: 4, y: 4, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 6, y: 4, label: 'Atari' }
    ],
    playerColor: BLACK,
    instruction: 'Keep White trapped in the zigzag! Play at [6,4] to deliver the next atari.',
    expectedMove: { x: 6, y: 4 },
    aiResponse: { x: 5, y: 5 },
    followUpInstruction: 'White wriggles down to [5,5]! Block and atari at [4,5] to seal their fate!',
    followUpMove: { x: 4, y: 5 },
    explanation: 'Flawless execution! White has nowhere left to turn and is captured against your boundary.'
  },
  {
    id: 'puzzle-snapback-gold',
    category: 'puzzles',
    title: 'Puzzle 5: The Golden Snapback',
    subtitle: 'Black to sacrifice and feast',
    boardSize: 9,
    difficulty: 'Intermediate (12k-8k)',
    description: `Three White stones are clumped together with tight liberties. A brave sacrifice directly into their mouth will trigger a devastating snapback recapture!`,
    initialStones: [
      { x: 2, y: 1, color: WHITE },
      { x: 3, y: 2, color: WHITE },
      { x: 2, y: 3, color: WHITE },
      { x: 1, y: 1, color: BLACK },
      { x: 1, y: 2, color: BLACK },
      { x: 1, y: 3, color: BLACK },
      { x: 3, y: 1, color: BLACK },
      { x: 3, y: 3, color: BLACK },
      { x: 4, y: 2, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 2, y: 2, label: 'Sacrifice' }
    ],
    playerColor: BLACK,
    instruction: 'Feed Black [2,2] directly into White\'s mouth!',
    expectedMove: { x: 2, y: 2 },
    explanation: 'Boom! Masterful snapback! White takes the bait, but their entire group stays at 1 liberty, ready for Black\'s instant recapture!'
  }
];
