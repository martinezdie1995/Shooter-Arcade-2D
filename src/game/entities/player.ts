
import type { Player } from "../types/entities";
import { GAME_HEIGHT, GAME_WIDTH } from "../types/common";
export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 28;
export const PLAYER_MAX_EVOLUTION = 4;
export const PLAYER_SPEED = 260; // px/s
export const PLAYER_MARGIN = 18; // margen contra los bordes

export function createPlayer(): Player {
  return {
    position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 70 },
    size: { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
    speed: PLAYER_SPEED,
    evolution: 0,
  };
}

/** Actualiza el jugador: movimiento horizontal y clamp a los bordes. */
export function updatePlayer(
  player: Player,
  input: { moveLeft: boolean; moveRight: boolean },
  dt: number,
  touchPositionX: number | null = null,
): void {
  if (touchPositionX !== null) {
    player.position.x = touchPositionX;
  } else {
    const dir = (input.moveRight ? 1 : 0) - (input.moveLeft ? 1 : 0);
    if (dir !== 0) {
      player.position.x += dir * player.speed * dt;
    }
  }
  const half = player.size.width / 2 + PLAYER_MARGIN;
  player.position.x = Math.min(
    GAME_WIDTH - half,
    Math.max(half, player.position.x),
  );
}
