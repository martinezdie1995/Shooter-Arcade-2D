import type { GameState } from "../types/common";
import { GAME_HEIGHT, GAME_WIDTH } from "../types/common";
import { InputSystem } from "../input/InputSystem";
import { GameStore, type UiSnapshot } from "./GameStore";
import { createPlayer, PLAYER_MAX_EVOLUTION, updatePlayer } from "../entities/player";
import {
  drawBackground,
  drawBossHealthBar,
  drawBossWarning,
  drawEnemy,
  drawExplosion,
  drawPlayer,
  drawPowerUp,
  drawProjectile,
} from "../rendering/sprites";
import { aabbOverlap, toAabb } from "../collision/collision";
import { createEnemyWave, updateEnemy } from "../entities/enemies";
import { createLifePowerUp, createPowerUp, updatePowerUp } from "../entities/powerUps";
import { AudioSystem } from "../systems/audioSystem";
import {
  createEnemyVolley,
  createPlayerProjectiles,
  updateProjectile,
} from "../entities/projectiles";
import type { Enemy, PowerUp, Projectile } from "../types/entities";
import type { Vec2 } from "../types/common";

const BOSS_INTRO_DURATION = 2.8;

/**
 * Game: posee el game loop y todo el estado interno del juego.
 * No tiene dependencia de React; se comunica con la UI a través de GameStore.
 */
export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input = new InputSystem();
  private store: GameStore;

  private rafId: number | null = null;
  private running = false;
  private lastTime = 0;
  private elapsed = 0;

  private player = createPlayer();
  private playerProjectiles: Projectile[] = [];
  private enemyProjectiles: Projectile[] = [];
  private powerUps: PowerUp[] = [];
  private enemies: Enemy[] = [];
  private waveIndex = 0;
  private enemyShotTimer = 0;
  private playerInvulnerability = 0;
  private autoFireCooldown = 0;
  private killsSincePowerUp = 0;
  private waveElapsed = 0;
  private bossIntroTimer = 0;
  private bossAttackIndex = 0;
  private enemyAttackIndex = 0;
  private bossPowerUpTimer = 0;
  private lifeDropTimer = 0;
  private playerDeathTimer = 0;
  private playerDeathPosition: Vec2 | null = null;
  private pendingGameOver = false;
  private audio = new AudioSystem();

  constructor(canvas: HTMLCanvasElement, store: GameStore) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");
    this.ctx = ctx;
    this.store = store;
    this.input.attach(window);
    this.input.attachTouchTarget(canvas);
  }

  /** Inicia el loop. Idempotente: si ya corre, no hace nada. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.frame);
  }

  /** Detiene el loop y libera listeners. Llamar al desmontar el componente. */
  destroy(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.input.detach(window);
    this.input.detachTouchTarget(this.canvas);
    this.audio.destroy();
  }

  requestStateChange(state: GameState): void {
    this.store.set({ gameState: state });
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    // Clamp de dt para evitar saltos enormes al perder foco.
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.input.endFrame();
    this.rafId = requestAnimationFrame(this.frame);
  };

  private resetRun(): void {
    this.audio.stopGameOver();
    this.player = createPlayer();
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.powerUps = [];
    this.enemies = [];
    this.waveIndex = 0;
    this.enemyShotTimer = 0.5;
    this.playerInvulnerability = 0;
    this.autoFireCooldown = 0;
    this.killsSincePowerUp = 0;
    this.waveElapsed = 0;
    this.bossIntroTimer = 0;
    this.bossAttackIndex = 0;
    this.enemyAttackIndex = 0;
    this.bossPowerUpTimer = 0;
    this.lifeDropTimer = 35 + Math.random() * 20;
    this.playerDeathTimer = 0;
    this.playerDeathPosition = null;
    this.pendingGameOver = false;
    this.spawnWave();
    this.store.set({ gameState: "playing", score: 0, lives: 3, level: 1, evolution: 0 });
  }

  private spawnWave(): void {
    this.waveIndex += 1;
    this.enemies = createEnemyWave(this.waveIndex);
    this.waveElapsed = 0;
    this.bossIntroTimer = this.enemies.some((enemy) => enemy.kind === "boss")
      ? BOSS_INTRO_DURATION
      : 0;
    this.bossAttackIndex = 0;
    this.enemyAttackIndex = 0;
    this.bossPowerUpTimer =
      this.waveIndex % 5 === 0 ? 7 + Math.random() * 3 : 0;
    this.store.set({ level: this.waveIndex });
    this.enemyShotTimer = 0.75 + Math.random() * 0.85;
  }

  private damagePlayer(): void {
    if (this.playerInvulnerability > 0 || this.playerDeathTimer > 0) return;

    const nextLives = this.store.get().lives - 1;
    this.playerInvulnerability = 1.2;
    this.playerDeathTimer = 0.48;
    this.playerDeathPosition = { ...this.player.position };
    this.pendingGameOver = nextLives <= 0;
    this.audio.playExplosion();
    this.store.set({ lives: Math.max(0, nextLives), evolution: 0 });
  }

  private update(dt: number): void {
    const state = this.store.get().gameState;
    const requestedActions = this.store.consumeActions();

    if (this.input.wasPressed("pause") || requestedActions.includes("pause")) {
      if (state === "playing") {
        this.store.set({ gameState: "paused" });
      } else if (state === "paused") {
        this.store.set({ gameState: "playing" });
      }
    }

    if (
      (this.input.wasPressed("confirm") ||
        this.input.wasAnyKeyPressed() ||
        requestedActions.includes("confirm")) &&
      (state === "menu" || state === "gameOver")
    ) {
      this.resetRun();
    }

    this.elapsed += dt;
    this.playerInvulnerability = Math.max(0, this.playerInvulnerability - dt);

    if (this.store.get().gameState !== "playing") return;
    this.waveElapsed += dt;
    this.bossIntroTimer = Math.max(0, this.bossIntroTimer - dt);
    this.lifeDropTimer -= dt;
    if (this.lifeDropTimer <= 0) {
      const hasLifeDrop = this.powerUps.some((powerUp) => powerUp.kind === "life");
      if (this.store.get().lives < 5 && !hasLifeDrop) {
        this.powerUps.push(
          createLifePowerUp({
            x: 24 + Math.random() * (GAME_WIDTH - 48),
            y: -24,
          }),
        );
      }
      this.lifeDropTimer = 45 + Math.random() * 25;
    }

    const boss = this.enemies.find((enemy) => enemy.kind === "boss");
    if (boss) {
      this.bossPowerUpTimer -= dt;
      if (this.bossPowerUpTimer <= 0) {
        const hasEvolutionDrop = this.powerUps.some(
          (powerUp) => powerUp.kind === "evolution",
        );
        if (this.player.evolution < PLAYER_MAX_EVOLUTION && !hasEvolutionDrop) {
          this.powerUps.push(createPowerUp(boss.position));
        }
        this.bossPowerUpTimer = 8 + Math.random() * 3;
      }
    } else {
      this.bossPowerUpTimer = 0;
    }
    if (this.playerDeathTimer > 0) {
      this.playerDeathTimer = Math.max(0, this.playerDeathTimer - dt);
      if (this.playerDeathTimer === 0) {
        this.playerDeathPosition = null;
        if (this.pendingGameOver) {
          this.store.set({ gameState: "gameOver" });
          this.audio.playGameOver();
          return;
        }
        this.player = createPlayer();
      }
    }

    this.playerProjectiles = this.playerProjectiles.filter((projectile) => {
      updateProjectile(projectile, dt);
      return (
        projectile.position.x > -30 &&
        projectile.position.x < GAME_WIDTH + 30 &&
        projectile.position.y > -30 &&
        projectile.position.y < GAME_HEIGHT + 30
      );
    });

    this.enemyProjectiles = this.enemyProjectiles.filter((projectile) => {
      updateProjectile(projectile, dt);
      return projectile.position.y > -30 && projectile.position.y < GAME_HEIGHT + 30;
    });

    if (this.playerDeathTimer <= 0) {
      updatePlayer(
        this.player,
        {
          moveLeft: this.input.isDown("moveLeft"),
          moveRight: this.input.isDown("moveRight"),
        },
        dt,
        this.input.getTouchPositionX(),
      );
    }

    const playerBox = toAabb(this.player.position, this.player.size);
    this.powerUps = this.powerUps.filter((powerUp) => {
      updatePowerUp(powerUp, dt);
      if (powerUp.position.y > GAME_HEIGHT + powerUp.size.height) return false;
      if (aabbOverlap(playerBox, toAabb(powerUp.position, powerUp.size))) {
        if (powerUp.kind === "life") {
          const lives = this.store.get().lives;
          this.store.set({ lives: Math.min(5, lives + 1) });
        } else {
          this.player.evolution = Math.min(
            PLAYER_MAX_EVOLUTION,
            this.player.evolution + 1,
          );
          this.store.set({ evolution: this.player.evolution });
        }
        this.audio.playPowerUp();
        return false;
      }
      return true;
    });

    this.autoFireCooldown -= dt;
    if (this.playerDeathTimer <= 0 && this.autoFireCooldown <= 0) {
      this.playerProjectiles.push(...createPlayerProjectiles(this.player));
      this.autoFireCooldown = Math.max(0.14, 0.24 - this.player.evolution * 0.025);
      this.audio.playShot();
    }

    if (this.bossIntroTimer <= 0) this.enemyShotTimer -= dt;
    if (this.bossIntroTimer <= 0 && this.enemyShotTimer <= 0 && this.enemies.length > 0) {
      const boss = this.enemies.find((enemy) => enemy.kind === "boss");
      const shotSpeed = 230 + Math.min(this.waveIndex * 9, 155);
      if (boss) {
        const healthRatio = boss.hp / boss.maxHp;
        const attackIndex = this.bossAttackIndex % 6;
        if (attackIndex === 5) {
          this.bossAttackIndex += 1;
          this.enemyShotTimer = healthRatio < 0.5 ? 1.05 : 1.25;
        } else {
          this.enemyProjectiles.push(
            ...createEnemyVolley(
              boss,
              this.player.position,
              shotSpeed + 50,
              this.bossAttackIndex,
            ),
          );
          this.bossAttackIndex += 1;
          this.enemyShotTimer = healthRatio < 0.5 ? 0.42 : 0.62;
        }
      } else {
        const shooter = this.enemies[Math.floor(Math.random() * this.enemies.length)];
        this.enemyProjectiles.push(
          ...createEnemyVolley(
            shooter,
            this.player.position,
            shotSpeed,
            this.enemyAttackIndex,
          ),
        );
        this.enemyAttackIndex += 1;
        this.enemyShotTimer = Math.max(
          0.22,
          0.58 + Math.random() * 0.42 - this.waveIndex * 0.035,
        );
      }
    }

    const nextEnemies: Enemy[] = [];

    for (const enemy of this.enemies) {
      updateEnemy(enemy, dt, this.waveElapsed, this.waveIndex, this.player.position.x);

      if (
        this.playerDeathTimer <= 0 &&
        aabbOverlap(playerBox, toAabb(enemy.position, enemy.size))
      ) {
        this.damagePlayer();
        continue;
      }

      nextEnemies.push(enemy);
    }

    this.enemies = nextEnemies;

    const hitEnemyIndexes = new Set<number>();
    const remainingPlayerProjectiles: Projectile[] = [];

    for (const projectile of this.playerProjectiles) {
      let projectileHit = false;
      for (let enemyIndex = 0; enemyIndex < this.enemies.length; enemyIndex += 1) {
        const enemy = this.enemies[enemyIndex];
        if (hitEnemyIndexes.has(enemyIndex)) continue;

        if (aabbOverlap(toAabb(projectile.position, projectile.size), toAabb(enemy.position, enemy.size))) {
          if (enemy.hitCooldown <= 0) {
            enemy.hp -= 1;
            enemy.hitCooldown = enemy.kind === "boss" ? 0.1 : 0.12;
            if (enemy.hp <= 0) {
              hitEnemyIndexes.add(enemyIndex);
              this.store.set({ score: this.store.get().score + enemy.points });
              this.audio.playExplosion();
              if (this.player.evolution < PLAYER_MAX_EVOLUTION) {
                this.killsSincePowerUp += 1;
                if (this.killsSincePowerUp >= 8 || enemy.kind === "boss") {
                  this.powerUps.push(createPowerUp(enemy.position));
                  this.killsSincePowerUp = 0;
                }
              }
            }
          }
          projectileHit = true;
          break;
        }
      }

      if (!projectileHit) {
        remainingPlayerProjectiles.push(projectile);
      }
    }

    this.playerProjectiles = remainingPlayerProjectiles;
    this.enemies = this.enemies.filter((_, index) => !hitEnemyIndexes.has(index));

    const survivingEnemyProjectiles: Projectile[] = [];
    for (const projectile of this.enemyProjectiles) {
      if (
        this.playerDeathTimer <= 0 &&
        aabbOverlap(toAabb(projectile.position, projectile.size), playerBox)
      ) {
        this.damagePlayer();
        continue;
      }
      survivingEnemyProjectiles.push(projectile);
    }
    this.enemyProjectiles = survivingEnemyProjectiles;

    if (this.enemies.length === 0 && this.store.get().gameState === "playing") {
      this.spawnWave();
    }
  }

  private render(): void {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.save();
    if (this.bossIntroTimer > 0) {
      const introElapsed = BOSS_INTRO_DURATION - this.bossIntroTimer;
      const intensity = 1 - introElapsed / BOSS_INTRO_DURATION;
      ctx.translate(
        Math.sin(introElapsed * 49) * 8 * intensity,
        Math.cos(introElapsed * 43) * 5 * intensity,
      );
    }
    drawBackground(ctx, canvas.width, canvas.height, this.elapsed);

    const state = this.store.get().gameState;
    if (state === "playing" || state === "paused") {
      if (this.playerDeathPosition && this.playerDeathTimer > 0) {
        const elapsed = 0.48 - this.playerDeathTimer;
        const frame = Math.min(3, Math.floor(elapsed / 0.12));
        const { x, y } = this.playerDeathPosition;
        drawExplosion(ctx, { x: x - 30, y: y - 30, width: 60, height: 60 }, frame);
      } else {
        drawPlayer(ctx, toAabb(this.player.position, this.player.size), this.player.evolution);
      }

      for (const projectile of this.playerProjectiles) {
        drawProjectile(ctx, toAabb(projectile.position, projectile.size), "#67e8f9");
      }

      for (const projectile of this.enemyProjectiles) {
        drawProjectile(ctx, toAabb(projectile.position, projectile.size), "#fbbf24");
      }

      for (const enemy of this.enemies) {
        const box = toAabb(enemy.position, enemy.size);
        drawEnemy(
          ctx,
          box,
          enemy.kind,
          enemy.bossVariant,
        );
        if (enemy.kind === "boss") {
          drawBossHealthBar(ctx, box, enemy.hp, enemy.maxHp);
        }
      }

      for (const powerUp of this.powerUps) {
        drawPowerUp(ctx, toAabb(powerUp.position, powerUp.size), powerUp.kind);
      }

      if (this.bossIntroTimer > 0) {
        drawBossWarning(ctx, BOSS_INTRO_DURATION - this.bossIntroTimer);
      }
    }

    if (state === "menu") {
      // Overlay de menú se dibuja en React sobre el canvas.
    }
    ctx.restore();
  }
}

export type { UiSnapshot };
