import { BLACK, WHITE } from '../../core/Constants.js';

export const SHAPES_LESSONS = [
  {
    id: 'shape-ponnuki',
    category: 'shapes',
    title: '1. Pon-nuki (ポン抜き)',
    subtitle: 'The 30-point diamond of central radiance',
    boardSize: 9,
    description: `A **Pon-nuki** is the diamond shape formed when four stones capture a single enemy stone in the center. An ancient proverb declares: *"A pon-nuki is worth thirty points."* It radiates tremendous thickness and influence across all four compass directions.`,
    initialStones: [
      { x: 4, y: 3, color: BLACK },
      { x: 3, y: 4, color: BLACK },
      { x: 5, y: 4, color: BLACK },
      { x: 4, y: 4, color: WHITE } // Stone in atari
    ],
    markers: [
      { type: 'target', x: 4, y: 5, label: 'Pon-nuki' }
    ],
    playerColor: BLACK,
    instruction: 'Complete the glorious Pon-nuki diamond by capturing White at [4,5]!',
    expectedMove: { x: 4, y: 5 },
    explanation: 'Splendid! You captured the stone and formed a majestic Pon-nuki. The empty center point now radiates solid power in every direction.'
  },
  {
    id: 'shape-bamboo-joint',
    category: 'shapes',
    title: '2. The Bamboo Joint (Takefu • 竹節)',
    subtitle: 'The unbreakable elastic connection',
    boardSize: 9,
    description: `The **Bamboo Joint** (*Takefu*) consists of two parallel pairs of stones separated by one line. It is famous because it is **impossible to cut**; if the opponent attempts to push into one side, you instantly connect on the opposite side!`,
    initialStones: [
      { x: 3, y: 3, color: BLACK },
      { x: 4, y: 3, color: BLACK },
      { x: 3, y: 5, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 4, y: 5, label: 'Takefu' }
    ],
    playerColor: BLACK,
    instruction: 'Complete the Bamboo Joint! Place Black at [4,5] directly across from [4,3].',
    expectedMove: { x: 4, y: 5 },
    explanation: 'Perfect Bamboo Joint! Even if White pushes between your stones at [3,4] or [4,4], you immediately connect on the other side. This connection can never be broken.'
  },
  {
    id: 'shape-tigers-mouth',
    category: 'shapes',
    title: '3. Tiger\'s Mouth (Kake-tsugi • 駆け継ぎ)',
    subtitle: 'A hanging connection that bites',
    boardSize: 9,
    description: `The **Tiger\'s Mouth** forms a triangular pocket. Unlike a direct solid connection, the Tiger\'s Mouth dares the opponent to enter: if they step inside, they are immediately in Atari and will be devoured!`,
    initialStones: [
      { x: 3, y: 3, color: BLACK },
      { x: 5, y: 3, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 4, y: 4, label: 'Tiger\'s Jaw' }
    ],
    playerColor: BLACK,
    instruction: 'Form the Tiger\'s Mouth by placing Black at [4,4] between the two open stones!',
    expectedMove: { x: 4, y: 4 },
    explanation: 'Roar! The Tiger\'s Mouth is formed! If White ever plays inside at [4,3], Black swallows the intruder in immediate atari.'
  },
  {
    id: 'shape-bulky-five',
    category: 'shapes',
    title: '4. The Bulky Five (Gomoku-nakade)',
    subtitle: 'The vital eye-killing point',
    boardSize: 9,
    description: `When an opponent encloses a 5-point eye space shaped like a cross or little car, there is a single magical vital point in the center. If the defender plays it, they live; if the attacker plays it, the entire group dies without two eyes!`,
    initialStones: [
      // White enclosed area of 5 points with center at [2,2]
      { x: 1, y: 1, color: WHITE },
      { x: 2, y: 1, color: WHITE },
      { x: 3, y: 1, color: WHITE },
      { x: 1, y: 2, color: WHITE },
      { x: 3, y: 2, color: WHITE },
      { x: 1, y: 3, color: WHITE },
      { x: 2, y: 3, color: WHITE },
      { x: 3, y: 3, color: WHITE },
      { x: 0, y: 0, color: BLACK },
      { x: 4, y: 4, color: BLACK }
    ],
    markers: [
      { type: 'target', x: 2, y: 2, label: 'Vital Point' }
    ],
    playerColor: BLACK,
    instruction: 'Strike the vital center point at [2,2] to prevent White from creating two eyes!',
    expectedMove: { x: 2, y: 2 },
    explanation: 'Deadly vital strike! By occupying [2,2], you ensure White can never divide their eye space into two living chambers. The group is doomed!'
  }
];
