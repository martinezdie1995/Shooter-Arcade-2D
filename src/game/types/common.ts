/** Ancho lógico del área de juego en píxeles (coordenadas internas del canvas). */
export const GAME_WIDTH = 480;
/** Alto lógico del área de juego en píxeles. */
export const GAME_HEIGHT = 640;

export type GameState = "menu" | "playing" | "paused" | "gameOver" | "victory";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

/** Interfaz base que cumplen todas las entidades del juego. */
export interface Entity {
  id: number;
  position: Vec2;
  size: Dimensions;
  /** Si es false la entidad se ignora en update/render/colisiones. */
  active: boolean;
}

/** Teclas lógicas del juego, independientes del dispositivo físico. */
export type GameAction =
  | "moveLeft"
  | "moveRight"
  | "pause"
  | "confirm";
