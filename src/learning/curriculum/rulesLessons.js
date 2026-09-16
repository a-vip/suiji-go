import { BLACK, WHITE } from '../../core/Constants.js';

export const RULES_LESSONS = [
  {
    id: 'lesson-grid',
    category: 'rules',
    title: '1. The Grid & The Stone',
    subtitle: 'Where stones live',
    boardSize: 9,
    description: `Unlike Western chess or checkers, Go is **not** played inside the squares. Stones are placed on the **intersections** of the lines. Once placed, stones never move unless they are captured.`,
    initialStones: [
      { x: 4, y: 4, color: BLACK },
      { x: 2, y: 2, color: WHITE }
    ],
    markers: [
      { type: 'target', x: 6, y: 6, label: 'G3' }
    ],
    playerColor: BLACK,
    instruction: 'Click or tap on the targeted intersection (G3 at [6,6]) to place your first stone.',
    expectedMove: { x: 6, y: 6 },
    explanation: 'Perfect! Stones command the grid from intersections. Black plays first, followed by White.'
  },
  {
    id: 'lesson-liberties',
    category: 'rules',
    title: '2. Liberties (Breathing Space)',
    subtitle: 'Every stone needs air to survive',
    boardSize: 9,
    description: `A stone "breathes" through empty adjacent intersections connected along vertical and horizontal lines. These breathing points are called **Liberties** (*dame*). Diagonal points do not count!`,
    initialStones: [
      { x: 4, y: 4, color: BLACK } // Center stone: 4 liberties
    ],
    markers: [
      { type: 'liberty', x: 3, y: 4 },
      { type: 'liberty', x: 5, y: 4 },
      { type: 'liberty', x: 4, y: 3 },
      { type: 'liberty', x: 4, y: 5 },
      { type: 'target', x: 5, y: 4 }
    ],
    playerColor: BLACK,
    instruction: 'When you connect two stones along a line, they share liberties as a single united group! Place a stone at the green target point to connect.',
    expectedMove: { x: 5, y: 4 },
    explanation: 'Splendid! The two connected stones now share 6 liberties together, making the chain much stronger.'
  },
  {
    id: 'lesson-atari-capture',
    category: 'rules',
    title: '3. Atari & Capturing',
    subtitle: 'Removing breathless stones',
    boardSize: 9,
    description: `When a stone or group is down to its very last liberty, it is in **Atari** (danger of capture). If the opponent plays on that final liberty, the stones run out of air and are **removed from the board as prisoners**.`,
    initialStones: [
      { x: 4, y: 4, color: WHITE }, // Target stone
      { x: 3, y: 4, color: BLACK },
      { x: 5, y: 4, color: BLACK },
      { x: 4, y: 3, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 4, y: 5, label: 'Capture' }
    ],
    playerColor: BLACK,
    instruction: 'The White stone at [4,4] has only 1 liberty left at [4,5]. Play at the target point to capture it!',
    expectedMove: { x: 4, y: 5 },
    explanation: 'Capture executed! White stone removed from the board and kept in your capture bowl.'
  },
  {
    id: 'lesson-two-eyes',
    category: 'rules',
    title: '4. Unconditional Life (Two Eyes)',
    subtitle: 'The secret to immortality in Go',
    boardSize: 9,
    description: `A group with **two separate eyes** (internal empty points) is **unconditionally alive forever**. The opponent cannot capture it, because playing in one eye is illegal suicide unless both eyes can be taken simultaneously — which is impossible with a single move!`,
    initialStones: [
      // Black wall in corner with 1 eye at [0,0] and dividing point at [1,1]
      { x: 0, y: 1, color: BLACK },
      { x: 1, y: 0, color: BLACK },
      { x: 2, y: 0, color: BLACK },
      { x: 2, y: 1, color: BLACK },
      { x: 2, y: 2, color: BLACK },
      { x: 1, y: 2, color: BLACK },
      { x: 0, y: 2, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 1, y: 1, label: 'Divide' }
    ],
    playerColor: BLACK,
    instruction: 'Play the vital dividing stone at [1,1] to split the internal space into two separate, untouchable eyes!',
    expectedMove: { x: 1, y: 1 },
    explanation: 'Brilliant! Now Black has two distinct eyes at [0,0] and [0,1]/[1,0]. White can never capture this living shape!'
  },
  {
    id: 'lesson-ko',
    category: 'rules',
    title: '5. The Ko Rule (No Infinite Loops)',
    subtitle: 'The rule of eternal repetition',
    boardSize: 9,
    description: `**Ko** (劫, meaning eternity) occurs when one stone captures another, and the opponent could immediately recapture the first stone, causing an endless back-and-forth loop. The rules of Go forbid immediate recapture. You must play elsewhere first (*Ko threat*)!`,
    initialStones: [
      { x: 3, y: 4, color: BLACK },
      { x: 4, y: 3, color: BLACK },
      { x: 4, y: 5, color: BLACK },
      { x: 5, y: 4, color: WHITE },
      { x: 4, y: 4, color: WHITE }, // Stone in atari
      { x: 6, y: 3, color: WHITE },
      { x: 6, y: 5, color: WHITE },
      { x: 7, y: 4, color: WHITE }
    ],
    markers: [
      { type: 'target', x: 5, y: 4, label: 'Ko Take' }
    ],
    playerColor: BLACK,
    instruction: 'Take the White stone at [4,4] by playing at [5,4] to initiate the Ko fight!',
    expectedMove: { x: 5, y: 4 },
    explanation: 'You captured the stone! Under the Ko rule, White is now forbidden from recapturing at [4,4] on their next turn!'
  },
  {
    id: 'lesson-territory',
    category: 'rules',
    title: '6. Territory & Scoring',
    subtitle: 'The goal of the game is surrounding empty space',
    boardSize: 9,
    description: `Go is not about wiping out all opponent stones—it is a game of territory. You win by surrounding more empty board intersections than your opponent. White receives **Komi** (usually 6.5 or 7.5 points) to compensate for Black playing first.`,
    initialStones: [
      // Black controls top half, White controls bottom half
      { x: 1, y: 3, color: BLACK },
      { x: 3, y: 3, color: BLACK },
      { x: 5, y: 3, color: BLACK },
      { x: 7, y: 3, color: BLACK },
      { x: 1, y: 5, color: WHITE },
      { x: 3, y: 5, color: WHITE },
      { x: 5, y: 5, color: WHITE },
      { x: 7, y: 5, color: WHITE }
    ],
    markers: [
      { type: 'target', x: 4, y: 3, label: 'Seal' }
    ],
    playerColor: BLACK,
    instruction: 'Close the boundary of your northern territory by placing a stone at the central frontier point [4,3].',
    expectedMove: { x: 4, y: 3 },
    explanation: 'Outstanding! The northern territory is now firmly walled off as Black territory. The player who encloses the largest territory wins!'
  }
];
