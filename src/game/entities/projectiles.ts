import type { Enemy, Player, Projectile } from "../types/entities";

export const PLAYER_PROJECTILE_SPEED = 480;
export const ENEMY_PROJECTILE_SPEED = 180;

export function createPlayerProjectiles(player: Player): Projectile[] {
  const speed = PLAYER_PROJECTILE_SPEED;
  const shots: Array<{ x: number; angle: number }> = [];

  if (player.evolution === 0) {
    shots.push({ x: 0, angle: 0 });
  } else if (player.evolution === 1) {
    shots.push({ x: -7, angle: 0 }, { x: 7, angle: 0 });
  } else if (player.evolution === 2) {
    shots.push({ x: -12, angle: 0 }, { x: 0, angle: 0 }, { x: 12, angle: 0 });
  } else if (player.evolution === 3) {
    shots.push(
      { x: -12, angle: 0 },
      { x: 0, angle: 0 },
      { x: 12, angle: 0 },
      { x: -8, angle: -0.28 },
      { x: 8, angle: 0.28 },
    );
  } else {
    shots.push(
      { x: -16, angle: 0 },
      { x: 0, angle: 0 },
      { x: 16, angle: 0 },
      { x: -10, angle: -0.32 },
      { x: 10, angle: 0.32 },
      { x: -6, angle: -0.58 },
      { x: 6, angle: 0.58 },
    );
  }

  return shots.map(({ x, angle }) => ({
    position: {
      x: player.position.x + x,
      y: player.position.y - player.size.height / 2 - 8,
    },
    size: { width: 4, height: 12 },
    velocity: {
      x: Math.sin(angle) * speed,
      y: -Math.cos(angle) * speed,
    },
    fromPlayer: true,
  }));
}

export function createEnemyProjectile(
  enemy: Enemy,
  angle = 0,
  speed = ENEMY_PROJECTILE_SPEED,
): Projectile {
  return {
    position: {
      x: enemy.position.x,
      y: enemy.position.y + enemy.size.height / 2 + 8,
    },
    size: { width: 4, height: 12 },
    velocity: {
      x: Math.sin(angle) * speed,
      y: Math.cos(angle) * speed,
    },
    fromPlayer: false,
  };
}

export function updateProjectile(projectile: Projectile, dt: number): void {
  projectile.position.x += projectile.velocity.x * dt;
  projectile.position.y += projectile.velocity.y * dt;
}
