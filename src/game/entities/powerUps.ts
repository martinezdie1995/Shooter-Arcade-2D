import type { PowerUp } from "../types/entities";
import type { Vec2 } from "../types/common";

export function createPowerUp(position: Vec2): PowerUp {
  return {
    position: { ...position },
    size: { width: 32, height: 32 },
    speed: 105,
    kind: "evolution",
  };
}

export function createLifePowerUp(position: Vec2): PowerUp {
  return {
    position: { ...position },
    size: { width: 32, height: 32 },
    speed: 90,
    kind: "life",
  };
}

export function updatePowerUp(powerUp: PowerUp, dt: number): void {
  powerUp.position.y += powerUp.speed * dt;
}
