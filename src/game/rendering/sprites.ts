import type { AABB } from "../collision/collision";
import { GAME_WIDTH } from "../types/common";
import type { EnemyKind, PowerUpKind } from "../types/entities";
import player0Url from "../../assets/player0.png";
import player1Url from "../../assets/player1.png";
import player2Url from "../../assets/player2.png";
import player3Url from "../../assets/player3.png";
import player4Url from "../../assets/player4.png";
import enemy0Url from "../../assets/enemy0.png";
import enemy1Url from "../../assets/enemy1.png";
import enemy2Url from "../../assets/enemy2.png";
import boss0Url from "../../assets/boss0.png";
import boss1Url from "../../assets/boss1.png";
import powerUpUrl from "../../assets/power up.png";
import explosion0Url from "../../assets/explosion0.png";
import explosion1Url from "../../assets/explosion1.png";
import explosion2Url from "../../assets/explosion2.png";
import explosion3Url from "../../assets/explosion3.png";

function loadSprite(source: string): HTMLImageElement {
  const image = new Image();
  image.src = source;
  return image;
}

const playerSprites = [
  player0Url,
  player1Url,
  player2Url,
  player3Url,
  player4Url,
].map(loadSprite);
const enemySprites: Record<Exclude<EnemyKind, "boss">, HTMLImageElement> = {
  basic: loadSprite(enemy0Url),
  diver: loadSprite(enemy1Url),
  armored: loadSprite(enemy2Url),
};
const bossSprites = [boss0Url, boss1Url].map(loadSprite);
const powerUpSprite = loadSprite(powerUpUrl);
const explosionSprites = [
  explosion0Url,
  explosion1Url,
  explosion2Url,
  explosion3Url,
].map(loadSprite);

export function drawPlayer(ctx: CanvasRenderingContext2D, box: AABB, evolution = 0): void {
  const sprite = playerSprites[Math.min(evolution, playerSprites.length - 1)];
  if (sprite.complete && sprite.naturalWidth > 0) {
    ctx.drawImage(sprite, box.x, box.y, box.width, box.height);
    return;
  }

  const cx = box.x + box.width / 2;
  const top = box.y;

  ctx.fillStyle = "#5eead4";
  ctx.beginPath();
  // Casco triangular
  ctx.moveTo(cx, top);
  ctx.lineTo(box.x + box.width, box.y + box.height);
  ctx.lineTo(box.x, box.y + box.height);
  ctx.closePath();
  ctx.fill();

  // Cabina
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(cx, top + box.height * 0.55, box.width * 0.14, 0, Math.PI * 2);
  ctx.fill();
}

export function drawProjectile(
  ctx: CanvasRenderingContext2D,
  box: AABB,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(box.x, box.y, box.width, box.height);
}

export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  box: AABB,
  kind: EnemyKind,
  bossVariant = 0,
): void {
  const sprite =
    kind === "boss"
      ? bossSprites[bossVariant % bossSprites.length]
      : enemySprites[kind];
  if (sprite.complete && sprite.naturalWidth > 0) {
    ctx.drawImage(sprite, box.x, box.y, box.width, box.height);
  } else {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    ctx.fillStyle = kind === "diver" ? "#f59e0b" : kind === "boss" ? "#ef4444" : "#f472b6";
    ctx.beginPath();
    ctx.moveTo(cx, box.y);
    ctx.lineTo(box.x + box.width, cy);
    ctx.lineTo(cx, box.y + box.height);
    ctx.lineTo(box.x, cy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff1f2";
    ctx.fillRect(cx - 2, cy - 3, 4, 6);

    if (kind === "diver" || kind === "armored") {
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(cx - 6, cy + 5, 12, 3);
    }
  }

}

export function drawBossHealthBar(
  ctx: CanvasRenderingContext2D,
  box: AABB,
  hp: number,
  maxHp: number,
): void {
  const width = box.width;
  const height = 9;
  const x = box.x;
  const y = box.y + box.height + 12;
  const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;

  ctx.save();
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = ratio > 0.5 ? "#34d399" : ratio > 0.25 ? "#fbbf24" : "#fb7185";
  ctx.fillRect(x + 1, y + 1, (width - 2) * ratio, height - 2);
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

export function drawBossWarning(ctx: CanvasRenderingContext2D, elapsed: number): void {
  const pulse = 0.82 + Math.sin(elapsed * 18) * 0.18;
  const x = 28;
  const y = 258;
  const width = 424;
  const height = 104;

  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.shadowColor = "#ef4444";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "rgba(69, 10, 10, 0.88)";
  ctx.fillRect(x, y, width, height);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#f87171";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff1f2";
  ctx.font = "900 27px Impact, Haettenschweiler, sans-serif";
  ctx.fillText("PELIGRO INMINENTE", GAME_WIDTH / 2, y + 39);
  ctx.fillStyle = "#fca5a5";
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillText("JEFE DETECTADO  //  PREPARATE", GAME_WIDTH / 2, y + 74);
  ctx.restore();
}

export function drawExplosion(ctx: CanvasRenderingContext2D, box: AABB, frame: number): void {
  const sprite = explosionSprites[Math.min(frame, explosionSprites.length - 1)];
  if (sprite.complete && sprite.naturalWidth > 0) {
    ctx.drawImage(sprite, box.x, box.y, box.width, box.height);
  }
}

export function drawPowerUp(
  ctx: CanvasRenderingContext2D,
  box: AABB,
  kind: PowerUpKind = "evolution",
): void {
  if (kind === "evolution" && powerUpSprite.complete && powerUpSprite.naturalWidth > 0) {
    ctx.drawImage(powerUpSprite, box.x, box.y, box.width, box.height);
    return;
  }

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  if (kind === "life") {
    ctx.fillStyle = "#fb7185";
    ctx.font = `bold ${Math.floor(box.height * 0.9)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#fb7185";
    ctx.shadowBlur = 10;
    ctx.fillText("+", cx, cy);
    ctx.shadowBlur = 0;
    return;
  }

  ctx.fillStyle = "#22d3ee";
  ctx.beginPath();
  ctx.arc(cx, cy, box.width / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#083344";
  ctx.fillRect(cx - 2, cy - 6, 4, 12);
  ctx.fillRect(cx - 6, cy - 2, 12, 4);
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
): void {
  ctx.fillStyle = "#05070f";
  ctx.fillRect(0, 0, width, height);

  // Estrellas: deterministas, se desplazan con el tiempo.
  ctx.fillStyle = "#94a3b8";
  for (let i = 0; i < 40; i++) {
    const seed = i * 97.31;
    const x = (seed * 7.13) % width;
    const y = ((seed * 13.7 + time * 60) % (height + 20)) - 10;
    ctx.fillRect(x, y, 2, 2);
  }
}
