import type { Vec2 } from "../types/common";
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

export function createEnemyVolley(
  enemy: Enemy,
  target: Vec2,
  speed: number,
  attackIndex: number,
): Projectile[] {
  const aimedAngle = Math.atan2(
    target.x - enemy.position.x,
    target.y - enemy.position.y,
  );
  let offsets: number[];
  let projectileSpeed = speed;

  if (enemy.kind === "boss") {
    switch (attackIndex % 5) {
      case 0:
        offsets = [0];
        projectileSpeed += 45;
        break;
      case 1:
        offsets = [-0.72, -0.36, 0, 0.36, 0.72];
        break;
      case 2:
        offsets = [-0.95, -0.62, -0.29, 0.04, 0.37, 0.7, 1.03];
        break;
      case 3:
        offsets = [-0.42, 0.42];
        projectileSpeed += 25;
        break;
      default:
        offsets = [-0.55, -0.28, 0, 0.28, 0.55];
        break;
    }
    const sweep = attackIndex % 5 === 2 ? Math.sin(attackIndex * 0.8) * 0.3 : 0;
    return offsets.map((offset) =>
      createEnemyProjectile(enemy, aimedAngle + offset + sweep, projectileSpeed),
    );
  }

  if (enemy.kind === "armored") {
    offsets = attackIndex % 2 === 0 ? [-0.34, 0, 0.34] : [-0.55, 0, 0.55];
  } else if (enemy.kind === "diver") {
    offsets = attackIndex % 3 === 2 ? [-0.16, 0, 0.16] : [0];
    projectileSpeed += 35;
  } else {
    offsets = attackIndex % 4 === 3 ? [-0.24, 0, 0.24] : [0];
  }

  return offsets.map((offset) =>
    createEnemyProjectile(
      enemy,
      (enemy.kind === "basic" && offsets.length === 1 ? 0 : aimedAngle) + offset,
      projectileSpeed,
    ),
  );
}

export function updateProjectile(projectile: Projectile, dt: number): void {
  projectile.position.x += projectile.velocity.x * dt;
  projectile.position.y += projectile.velocity.y * dt;
}
