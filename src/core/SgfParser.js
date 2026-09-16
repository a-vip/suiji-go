import { BLACK, WHITE, toSgfCoord, fromSgfCoord } from './Constants.js';

export class SgfParser {
  /**
   * Export GoGame history and metadata to standard SGF format.
   */
  static exportToSgf(game, metadata = {}) {
    const {
      blackPlayer = 'Player',
      whitePlayer = 'Suiji AI',
      blackRank = '1D',
      whiteRank = '1D',
      event = 'Suiji Go Institute Match',
      ruleset = 'Area Scoring'
    } = metadata;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

    let sgf = `(;GM[1]FF[4]CA[UTF-8]AP[Suiji:1.0]SZ[${game.size}]KM[${game.komi}]RU[${ruleset}]`;
    sgf += `PW[${whitePlayer}]PB[${blackPlayer}]WR[${whiteRank}]BR[${blackRank}]`;
    sgf += `DT[${dateStr}]EV[${event}]`;

    if (game.gameOver) {
      if (game.resignedBy) {
        const winColor = game.winner === BLACK ? 'B' : 'W';
        sgf += `RE[${winColor}+R]`;
      } else if (game.winner) {
        const t = game.calculateTerritory();
        const diff = Math.abs(t.blackArea - t.whiteArea).toFixed(1);
        const winColor = game.winner === BLACK ? 'B' : 'W';
        sgf += `RE[${winColor}+${diff}]`;
      } else {
        sgf += `RE[0]`;
      }
    }

    for (const item of game.history) {
      const colorTag = item.color === BLACK ? 'B' : 'W';
      if (item.type === 'move') {
        const coord = toSgfCoord(item.x, item.y);
        sgf += `;${colorTag}[${coord}]`;
      } else if (item.type === 'pass') {
        sgf += `;${colorTag}[]`;
      }
    }

    sgf += ')';
    return sgf;
  }

  /**
   * Parses basic SGF string into moves array and metadata.
   */
  static importFromSgf(sgfStr) {
    if (!sgfStr) return null;
    const clean = sgfStr.trim();

    // Extract size
    const sizeMatch = clean.match(/SZ\[(\d+)\]/i);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 19;

    // Extract komi
    const kmMatch = clean.match(/KM\[([\d.]+)\]/i);
    const komi = kmMatch ? parseFloat(kmMatch[1]) : 6.5;

    // Extract moves
    const moveRegex = /;([BW])\[([a-z]{0,2})\]/gi;
    const moves = [];
    let match;

    while ((match = moveRegex.exec(clean)) !== null) {
      const color = match[1].toUpperCase() === 'B' ? BLACK : WHITE;
      const coordStr = match[2];
      if (!coordStr || coordStr.length === 0) {
        moves.push({ type: 'pass', color });
      } else {
        const coord = fromSgfCoord(coordStr);
        if (coord) {
          moves.push({ type: 'move', color, x: coord.x, y: coord.y });
        }
      }
    }

    return { size, komi, moves };
  }
}
