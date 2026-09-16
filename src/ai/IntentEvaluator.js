import { BLACK, WHITE, coordToName } from '../core/Constants.js';

export class IntentEvaluator {
  static describeMove({
    move,
    color,
    capturedCount,
    savedCount,
    atariCount,
    moveNumber,
    size,
    isCorner,
    isSide,
    isCenter,
    territorySwing,
    isCut,
    isConnection
  }) {
    const colorName = color === BLACK ? 'Black' : 'White';
    const coord = coordToName(move.x, move.y, size);

    if (capturedCount > 0) {
      if (capturedCount >= 3) {
        return {
          title: `Decisive Capture`,
          text: `${colorName} struck a lethal tactical blow, capturing ${capturedCount} stones.`,
          type: 'capture',
          japanese: 'Toriko (虜)'
        };
      }
      return {
        title: `Tactical Capture`,
        text: `${colorName} removed an opposing stone, gaining local thickness and territory.`,
        type: 'capture',
        japanese: 'Torikata (取り方)'
      };
    }

    if (savedCount > 0) {
      return {
        title: `Life-Saving Escape`,
        text: `${colorName} rescued a vulnerable group of ${savedCount} stone${savedCount > 1 ? 's' : ''} from immediate capture.`,
        type: 'defense',
        japanese: 'Shinogi (凌ぎ)'
      };
    }

    if (atariCount > 0) {
      return {
        title: `Atari Pressure`,
        text: `${colorName} placed the opponent in Atari, demanding an immediate defensive response.`,
        type: 'attack',
        japanese: 'Atari (当たり)'
      };
    }

    if (isCut) {
      return {
        title: `Severing the Connection`,
        text: `${colorName} wedge-cut between opponent groups, creating two separate targets to attack.`,
        type: 'cut',
        japanese: 'Kiri (切り)'
      };
    }

    if (isConnection) {
      return {
        title: `Solidifying the Shape`,
        text: `${colorName} connected adjacent friendly stones into a unified and resilient wall.`,
        type: 'connect',
        japanese: 'Tsugi (継ぎ)'
      };
    }

    // Opening Moves
    if (moveNumber <= (size === 19 ? 20 : size === 13 ? 10 : 6)) {
      if (isCorner) {
        return {
          title: `Corner Enclosure`,
          text: `${colorName} secures the corner, following the ancient proverb: "Corners are gold, sides are silver, center is grass."`,
          type: 'opening',
          japanese: 'Fuseki (布石)'
        };
      }
      if (isSide) {
        return {
          title: `Side Extension`,
          text: `${colorName} extends along the fourth and third lines to balance influence and stable territory.`,
          type: 'extension',
          japanese: 'Hiraki (開き)'
        };
      }
    }

    // Territory swings
    if (Math.abs(territorySwing) > 2.5) {
      if (territorySwing > 0 && color === BLACK || territorySwing < 0 && color === WHITE) {
        return {
          title: `Territorial Infiltration`,
          text: `${colorName} invaded deeply, reducing the opponent's anticipated framework.`,
          type: 'invasion',
          japanese: 'Uchikomi (打ち込み)'
        };
      }
    }

    if (isCenter) {
      return {
        title: `Central Radiance`,
        text: `${colorName} projects power toward the center, aiming for broad strategic influence.`,
        type: 'influence',
        japanese: 'Moyo (模様)'
      };
    }

    return {
      title: `Measured Placement`,
      text: `${colorName} plays ${coord}, reinforcing local shape and probing the board balance.`,
      type: 'neutral',
      japanese: 'Te (手)'
    };
  }
}
