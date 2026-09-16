import { BLACK, WHITE } from '../../core/Constants.js';

export const TACTICS_LESSONS = [
  {
    id: 'tactic-ladder',
    category: 'tactics',
    title: '1. The Ladder (Shicho • シチョウ)',
    subtitle: 'The zigzag chase to the edge',
    boardSize: 9,
    description: `The **Ladder** (*Shicho*) is one of the most famous shapes in Go. The attacker keeps chasing the defending stone in a relentless diagonal zigzag, keeping it in continuous Atari with every single move until it crashes into the edge or a friendly stone.`,
    initialStones: [
      { x: 3, y: 3, color: BLACK },
      { x: 4, y: 3, color: WHITE }, // Target stone
      { x: 4, y: 2, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 5, y: 3, label: 'Atari' }
    ],
    playerColor: BLACK,
    instruction: 'Drive the White stone in a ladder! Place Black at [5,3] to keep White in continuous atari.',
    expectedMove: { x: 5, y: 3 },
    aiResponse: { x: 4, y: 4 }, // White attempts to run
    followUpInstruction: 'White tried to escape downwards to [4,4]! Block and atari again at [3,4]!',
    followUpMove: { x: 3, y: 4 },
    explanation: 'Magnificent! White has no way out. Unless White has a friendly ladder-breaker stone waiting, the ladder always captures!'
  },
  {
    id: 'tactic-net',
    category: 'tactics',
    title: '2. The Net (Geta • 下駄)',
    subtitle: 'Capturing from a loose distance',
    boardSize: 9,
    description: `When a ladder is broken or impractical, masters use **The Net** (*Geta*). You do not touch the enemy stone directly; instead, you drop a "net" one point ahead of it diagonally. Whichever direction the stone tries to wiggle out, you block and catch it.`,
    initialStones: [
      { x: 4, y: 4, color: WHITE }, // Escaping stone
      { x: 3, y: 4, color: BLACK },
      { x: 4, y: 3, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 5, y: 5, label: 'Net' }
    ],
    playerColor: BLACK,
    instruction: 'Cast the Net! Place your stone diagonally ahead at [5,5] without direct contact.',
    expectedMove: { x: 5, y: 5 },
    explanation: 'Superb! White is securely enclosed in the Net. If White pushes toward [5,4] or [4,5], Black blocks and captures immediately.'
  },
  {
    id: 'tactic-snapback',
    category: 'tactics',
    title: '3. The Snapback (Uttegaeshi • 打って返し)',
    subtitle: 'The masterclass sacrificial trap',
    boardSize: 9,
    description: `A **Snapback** (*Uttegaeshi*) is a brilliant tactical sacrifice. You intentionally throw a stone into the jaws of the enemy group so they capture it—only to realize that capturing leaves their entire group with only 1 liberty, allowing you to instantly snap back and capture all of them!`,
    initialStones: [
      // 3 White stones surrounding an internal point [3,3]
      { x: 3, y: 2, color: WHITE },
      { x: 4, y: 3, color: WHITE },
      { x: 3, y: 4, color: WHITE },
      // Black encircles White outside
      { x: 2, y: 2, color: BLACK },
      { x: 2, y: 3, color: BLACK },
      { x: 2, y: 4, color: BLACK },
      { x: 4, y: 2, color: BLACK },
      { x: 5, y: 3, color: BLACK },
      { x: 4, y: 4, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 3, y: 3, label: 'Sacrifice' }
    ],
    playerColor: BLACK,
    instruction: 'Drop your Black stone right into the center of White\'s mouth at [3,3] as a sacrifice!',
    expectedMove: { x: 3, y: 3 },
    explanation: 'Flawless snapback! Even if White captures your single stone at [3,3], White remains in atari with 1 liberty and you recapture the whole group on the next move!'
  },
  {
    id: 'tactic-double-atari',
    category: 'tactics',
    title: '4. Double Atari (Ryō-atari • 両アタリ)',
    subtitle: 'Forking two targets at once',
    boardSize: 9,
    description: `Like the knight\'s fork in chess, **Double Atari** strikes two separate enemy stones or groups simultaneously. Since the opponent can only save one group on their turn, you are guaranteed to capture the other!`,
    initialStones: [
      { x: 3, y: 4, color: WHITE }, // Stone A
      { x: 5, y: 4, color: WHITE }, // Stone B
      { x: 3, y: 3, color: BLACK },
      { x: 3, y: 5, color: BLACK },
      { x: 5, y: 3, color: BLACK },
      { x: 5, y: 5, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 4, y: 4, label: 'Fork' }
    ],
    playerColor: BLACK,
    instruction: 'Find the sweet spot at [4,4] that puts BOTH White stones into atari at the same time!',
    expectedMove: { x: 4, y: 4 },
    explanation: 'Boom! Double Atari! White can only save one stone—the other is yours on the next turn!'
  },
  {
    id: 'tactic-cut-connect',
    category: 'tactics',
    title: '5. Cut & Connect (Kiri & Tsugi • 切りと継ぎ)',
    subtitle: 'Divide and conquer',
    boardSize: 9,
    description: `An ancient proverb states: "Upon the cut, think!" Cutting (*Kiri*) divides opponent stones so they cannot cooperate, creating two weak targets. Connecting (*Tsugi*) joins your own stones into an unbreakable shield.`,
    initialStones: [
      // White diagonal stones waiting to be cut
      { x: 3, y: 3, color: WHITE },
      { x: 4, y: 4, color: WHITE },
      { x: 3, y: 4, color: BLACK },
      { x: 2, y: 3, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 4, y: 3, label: 'Cut!' }
    ],
    playerColor: BLACK,
    instruction: 'Slice between the two diagonal White stones by playing the sharp cut at [4,3].',
    expectedMove: { x: 4, y: 3 },
    explanation: 'Decisive cut! White\'s formation is severed into two disjointed stones that must each struggle for survival.'
  },
  {
    id: 'tactic-cranes-nest',
    category: 'tactics',
    title: '6. The Crane\'s Nest (Tsuru no Sugomori • 鶴の巣篭もり)',
    subtitle: 'A legendary historical tesuji',
    boardSize: 9,
    description: `The **Crane\'s Nest** is one of the most celebrated named tesuji in Go history. When an enemy group overextends toward the edge, you enclose them like a crane protecting its nest. Any attempt to break through only strangles their liberties.`,
    initialStones: [
      { x: 2, y: 1, color: WHITE },
      { x: 3, y: 1, color: WHITE },
      { x: 4, y: 1, color: WHITE },
      { x: 1, y: 1, color: BLACK },
      { x: 5, y: 1, color: BLACK },
      { x: 2, y: 2, color: BLACK },
      { x: 4, y: 2, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 3, y: 2, label: 'The Nest' }
    ],
    playerColor: BLACK,
    instruction: 'Drop the stone into the pocket at [3,2] to complete the Crane\'s Nest trap!',
    expectedMove: { x: 3, y: 2 },
    explanation: 'Incredible! The Crane\'s Nest is complete. White has nowhere to flee along the first line.'
  }
];
