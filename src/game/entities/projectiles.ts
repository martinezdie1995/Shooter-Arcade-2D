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
    size: { width: 6, height: 16 },
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
  trackingTarget = false,
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
    trackingTarget,
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
  let trackingTarget = false;

  if (enemy.kind === "boss") {
    switch (attackIndex % 4) {
      case 0:
        offsets = [0];
        projectileSpeed += 20;
        break;
      case 1:
        offsets = [-0.42, 0, 0.42];
        break;
      case 2:
        offsets = [-0.62, 0, 0.62];
        break;
      default:
        offsets = [-0.3, 0.3];
        break;
    }
    const sweep = attackIndex % 4 === 2 ? Math.sin(attackIndex * 0.8) * 0.3 : 0;
    return offsets.map((offset) =>
      createEnemyProjectile(enemy, aimedAngle + offset + sweep, projectileSpeed),
    );
  }

  if (enemy.kind === "armored") {
    offsets = attackIndex % 2 === 0 ? [-0.48, 0, 0.48] : [-0.7, 0, 0.7];
    projectileSpeed = Math.max(110, speed - 70);
  } else if (enemy.kind === "diver") {
    trackingTarget = attackIndex % 3 === 0;
    offsets = trackingTarget
      ? [0]
      : attackIndex % 2 === 0
        ? [-0.16, 0.16]
        : [0];
    projectileSpeed = trackingTarget ? Math.max(125, speed - 30) : speed + 35;
  } else {
    offsets = attackIndex % 3 === 2 ? [-0.24, 0, 0.24] : [0];
  }

  return offsets.map((offset) =>
    createEnemyProjectile(
      enemy,
      (enemy.kind === "basic" && offsets.length === 1 ? 0 : aimedAngle) + offset,
      projectileSpeed,
      trackingTarget,
    ),
  );
}

export function updateProjectile(
  projectile: Projectile,
  dt: number,
  target?: Vec2,
): void {
  if (projectile.trackingTarget && target) {
    const speed = Math.hypot(projectile.velocity.x, projectile.velocity.y);
    if (speed > 0) {
      const currentAngle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
      const targetAngle = Math.atan2(
        target.y - projectile.position.y,
        target.x - projectile.position.x,
      );
      const angleDifference = Math.atan2(
        Math.sin(targetAngle - currentAngle),
        Math.cos(targetAngle - currentAngle),
      );
      const turn = Math.max(-1.8 * dt, Math.min(1.8 * dt, angleDifference));
      const nextAngle = currentAngle + turn;
      projectile.velocity.x = Math.cos(nextAngle) * speed;
      projectile.velocity.y = Math.sin(nextAngle) * speed;
    }
  }

  projectile.position.x += projectile.velocity.x * dt;
  projectile.position.y += projectile.velocity.y * dt;
}
