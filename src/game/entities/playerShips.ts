import player0Url from "../../assets/player0.png";
import player1Url from "../../assets/player1.png";
import player2Url from "../../assets/player2.png";
import shotUrl from "../../assets/shot.png";
import playerShotUrl from "../../assets/shot-player1.png";
import guardianShotUrl from "../../assets/shot-player2.png";
import type { PlayerShipId } from "../types/entities";

export interface PlayerShipDefinition {
  id: PlayerShipId;
  name: string;
  className: string;
  description: string;
  speed: number;
  fireRate: number;
  lives: number;
  spriteUrl: string;
  projectileUrl: string;
  rotated: boolean;
}

export const PLAYER_SHIPS: readonly PlayerShipDefinition[] = [
  {
    id: "fighter",
    name: "Centella",
    className: "Caza equilibrado",
    description: "Versátil y fiable para cualquier oleada.",
    speed: 260,
    fireRate: 0.24,
    lives: 3,
    spriteUrl: player0Url,
    projectileUrl: shotUrl,
    rotated: false,
  },
  {
    id: "interceptor",
    name: "Cometa",
    className: "Interceptor ligero",
    description: "Acelera y dispara rápido, pero tiene menos blindaje.",
    speed: 300,
    fireRate: 0.2,
    lives: 2,
    spriteUrl: player1Url,
    projectileUrl: playerShotUrl,
    rotated: true,
  },
  {
    id: "guardian",
    name: "Bastión",
    className: "Nave pesada",
    description: "Aguanta más impactos a cambio de maniobrar despacio.",
    speed: 220,
    fireRate: 0.3,
    lives: 4,
    spriteUrl: player2Url,
    projectileUrl: guardianShotUrl,
    rotated: true,
  },
];

export function getPlayerShip(shipId: PlayerShipId): PlayerShipDefinition {
  const ship = PLAYER_SHIPS.find((candidate) => candidate.id === shipId);
  if (!ship) throw new Error(`Configuración de nave desconocida: ${shipId}`);
  return ship;
}
