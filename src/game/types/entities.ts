import type { Dimensions, Vec2 } from "./common";

/** Propiedades comunes a todas las naves (jugador y enemigos). */
export interface Ship {
  position: Vec2;
  size: Dimensions;
  speed: number;
}

export type PlayerShipId = "fighter" | "interceptor" | "guardian";

export interface Player extends Ship {
  shipId: PlayerShipId;
  evolution: number;
}

export type EnemyKind = "basic" | "diver" | "armored" | "boss";

export interface Enemy extends Ship {
  kind: EnemyKind;
  bossVariant: number;
  hp: number;
  maxHp: number;
  points: number;
  row: number;
  column: number;
  formationIndex: number;
  formationPosition: Vec2;
  hitCooldown: number;
  /** Momento de vida del enemigo, en segundos, para animaciones y patrones. */
  age: number;
}

/** Proyectil genérico (jugador o enemigo). */
export interface Projectile {
  position: Vec2;
  size: Dimensions;
  velocity: Vec2;
  trackingTarget?: boolean;
  /** De quién proviene: determina con qué colisiona. */
  fromPlayer: boolean;
}

export type PowerUpKind = "evolution" | "life";

export interface PowerUp {
  position: Vec2;
  size: Dimensions;
  speed: number;
  kind: PowerUpKind;
}
