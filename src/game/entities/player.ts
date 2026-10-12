
import type { Player } from "../types/entities";
import { GAME_HEIGHT, GAME_WIDTH, SHIP_HEIGHT, SHIP_WIDTH } from "../types/common";
export const PLAYER_WIDTH = SHIP_WIDTH;
export const PLAYER_HEIGHT = SHIP_HEIGHT;
export const PLAYER_MAX_EVOLUTION = 4;
export const PLAYER_SPEED = 260; // px/s
export const PLAYER_MARGIN = 18; // margen contra los bordes
const PLAYER_VERTICAL_MARGIN = 24;
const TOUCH_PLAYER_OFFSET_Y = 56;

export function createPlayer(): Player {
  return {
    position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 110 },
    size: { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
    speed: PLAYER_SPEED,
    evolution: 0,
  };
}

/** Actualiza el jugador con teclado o seguimiento táctil y limita el área de juego. */
export function updatePlayer(
  player: Player,
  input: { moveLeft: boolean; moveRight: boolean; moveUp: boolean; moveDown: boolean },
  dt: number,
  touchPosition: { x: number; y: number } | null = null,
): void {
  if (touchPosition !== null) {
    player.position.x = touchPosition.x;
    player.position.y = touchPosition.y - TOUCH_PLAYER_OFFSET_Y;
  } else {
    const directionX = (input.moveRight ? 1 : 0) - (input.moveLeft ? 1 : 0);
    const directionY = (input.moveDown ? 1 : 0) - (input.moveUp ? 1 : 0);
    const directionLength = Math.hypot(directionX, directionY);
    if (directionLength > 0) {
      player.position.x += (directionX / directionLength) * player.speed * dt;
      player.position.y += (directionY / directionLength) * player.speed * dt;
    }
  }
  const half = player.size.width / 2 + PLAYER_MARGIN;
  player.position.x = Math.min(
    GAME_WIDTH - half,
    Math.max(half, player.position.x),
  );
  const verticalLimit = player.size.height / 2 + PLAYER_VERTICAL_MARGIN;
  player.position.y = Math.min(
    GAME_HEIGHT - verticalLimit,
    Math.max(verticalLimit, player.position.y),
  );
}
