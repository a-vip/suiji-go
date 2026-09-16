export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export const BOARD_SIZES = [9, 13, 19];

export const HOSHI_POINTS = {
  9: [
    [2, 2], [2, 6], [6, 2], [6, 6], [4, 4]
  ],
  13: [
    [3, 3], [3, 9], [9, 3], [9, 9], [6, 6]
  ],
  19: [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15]
  ]
};

// Standard Go coordinates omit 'I' to avoid confusion with 'J' or '1'
export const COORD_LETTERS = 'ABCDEFGHJKLMNOPQRST'.split('');

export function coordToName(x, y, size = 9) {
  if (x < 0 || x >= size || y < 0 || y >= size) return '?';
  const letter = COORD_LETTERS[x] || '?';
  const number = size - y;
  return `${letter}${number}`;
}

export function nameToCoord(name, size = 9) {
  if (!name || name.length < 2) return null;
  const letter = name[0].toUpperCase();
  const x = COORD_LETTERS.indexOf(letter);
  const yNum = parseInt(name.slice(1), 10);
  if (x === -1 || isNaN(yNum)) return null;
  const y = size - yNum;
  if (x < 0 || x >= size || y < 0 || y >= size) return null;
  return { x, y };
}

export function toSgfCoord(x, y) {
  return String.fromCharCode(97 + x) + String.fromCharCode(97 + y);
}

export function fromSgfCoord(str) {
  if (!str || str.length < 2) return null;
  return {
    x: str.charCodeAt(0) - 97,
    y: str.charCodeAt(1) - 97
  };
}
