import { GAME_HEIGHT, GAME_WIDTH } from "../types/common";
import type { Enemy, EnemyKind } from "../types/entities";

export const ENEMY_WIDTH = 24;
export const ENEMY_HEIGHT = 20;
const BASIC_ENEMY_WIDTH = 48;
const BASIC_ENEMY_HEIGHT = 32;
const ENEMY_MAX_CENTER_Y = GAME_HEIGHT * 0.7;
const ENEMY_MAX_DIVE = GAME_HEIGHT * 0.22;

function getDiveY(enemy: Enemy, waveTime: number): number {
  const maxDive = Math.min(
    ENEMY_MAX_DIVE,
    Math.max(0, ENEMY_MAX_CENTER_Y - enemy.formationPosition.y),
  );
  const phase = waveTime * (0.85 + enemy.speed / 100) + enemy.formationIndex * 0.45;
  const descent = (1 - Math.cos(phase)) / 2;
  return enemy.formationPosition.y + maxDive * descent;
}

export function createEnemy(
  x: number,
  y: number,
  level: number,
  kind: EnemyKind = "basic",
  row = 0,
  column = 0,
  formationIndex = 0,
): Enemy {
  const isBoss = kind === "boss";
  const isArmored = kind === "armored";
  const size = isBoss
    ? { width: 150, height: 138 }
    : kind === "basic"
      ? { width: BASIC_ENEMY_WIDTH, height: BASIC_ENEMY_HEIGHT }
      : { width: ENEMY_WIDTH, height: ENEMY_HEIGHT };
  const baseSpeed = isBoss ? 0 : kind === "diver" ? 24 + level * 3.5 : 15 + level * 3;
  const maxHp = isBoss
    ? 200
    : isArmored
      ? 4
      : kind === "diver"
        ? 3
        : 2;

  return {
    position: { x, y },
    size,
    speed: baseSpeed,
    kind,
    bossVariant: isBoss ? (Math.floor(level / 5) - 1) % 2 : 0,
    hp: maxHp,
    maxHp,
    points: isBoss ? 2000 : isArmored ? 220 : kind === "diver" ? 180 : 100,
    row,
    column,
    formationIndex,
    formationPosition: { x, y },
    hitCooldown: 0,
    age: 0,
  };
}

export function createEnemyWave(level: number): Enemy[] {
  if (level % 5 === 0) {
    return [createEnemy(GAME_WIDTH / 2, 110, level, "boss")];
  }

  if (level >= 4 && level % 4 === 0) {
    return Array.from({ length: 12 }, (_, formationIndex) => {
      const y = 45 + formationIndex * 26;
      const kind: EnemyKind = formationIndex % 4 === 0 ? "diver" : "basic";
      return createEnemy(
        GAME_WIDTH / 2,
        y,
        level,
        kind,
        formationIndex,
        0,
        formationIndex,
      );
    });
  }

  const columns = 5;
  const rows = Math.min(3 + level, 5);
  const spacingX = 54;
  const spacingY = 40;
  const totalWidth = (columns - 1) * spacingX;
  const startX = GAME_WIDTH / 2 - totalWidth / 2;
  const startY = 60;

  const enemies: Enemy[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = startX + column * spacingX;
      const y = startY + row * spacingY;
      let kind: EnemyKind = "basic";
      if (level >= 3 && (row + column) % 5 === 0) {
        kind = "armored";
      } else if (level > 1 && (row + column) % 3 === 0) {
        kind = "diver";
      }
      enemies.push(createEnemy(x, y, level, kind, row, column, enemies.length));
    }
  }

  return enemies;
}

export function updateEnemy(
  enemy: Enemy,
  dt: number,
  waveTime: number,
  level: number,
  playerX: number,
): void {
  enemy.age += dt;
  enemy.hitCooldown = Math.max(0, enemy.hitCooldown - dt);

  if (enemy.kind === "boss") {
    const horizontalMotion =
      Math.sin(waveTime * 2.1) * 155 + Math.sin(waveTime * 4.1) * 30;
    enemy.position.x = Math.max(
      enemy.size.width / 2,
      Math.min(GAME_WIDTH - enemy.size.width / 2, GAME_WIDTH / 2 + horizontalMotion),
    );
    enemy.position.y = 108 + Math.sin(waveTime * 3.2) * 21 + Math.sin(waveTime * 5.8) * 7;
    return;
  }

  if (level >= 4 && level % 4 === 0) {
    const phase = waveTime * 1.5 - enemy.formationIndex * 0.42;
    enemy.position.x = GAME_WIDTH / 2 + Math.sin(phase) * 155;
    enemy.position.y = getDiveY(enemy, waveTime);
    return;
  }

  const isAdvancing = level >= 2 && (enemy.row + enemy.column) % 5 === 0;
  const isSwapping = level >= 3 && enemy.column < 4;
  let x = enemy.formationPosition.x;

  if (isSwapping) {
    const pairCenter =
      enemy.formationPosition.x -
      (enemy.column % 2 === 0 ? 0 : 54) +
      27;
    const phase = waveTime * 1.1 + enemy.row * 0.35;
    x = pairCenter + (enemy.column % 2 === 0 ? -1 : 1) * Math.cos(phase) * 27;
  } else if (enemy.kind === "diver" || isAdvancing) {
    x += Math.max(-95, Math.min(95, playerX - x)) * 0.45;
    x += Math.sin(waveTime * 2.4 + enemy.formationIndex) * 14;
  } else {
    x += Math.sin(waveTime * 1.3 + enemy.row * 0.5) * 20;
  }

  const halfWidth = enemy.size.width / 2;
  enemy.position.x = Math.max(halfWidth, Math.min(GAME_WIDTH - halfWidth, x));
  enemy.position.y = getDiveY(enemy, waveTime);
}
