import type { Dimensions, Vec2 } from "../types/common";

/** Rectángulo alineado a ejes (bounding box) para colisiones simples. */
export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function toAabb(position: Vec2, size: Dimensions): AABB {
  // position se considera el centro de la entidad.
  return {
    x: position.x - size.width / 2,
    y: position.y - size.height / 2,
    width: size.width,
    height: size.height,
  };
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Punto dentro de rectángulo (útil para proyectiles pequeños). */
export function pointInRect(px: number, py: number, r: AABB): boolean {
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}

export function rectContains(r: AABB, p: Vec2): boolean {
  return pointInRect(p.x, p.y, r);
}
