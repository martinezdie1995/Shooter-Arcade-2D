import type { UiSnapshot } from "../game/core/GameStore";

/** HUD sobre el canvas: puntuación, vidas y nivel. */
export function HUD({ snapshot }: { snapshot: UiSnapshot }): JSX.Element {
  return (
    <div className="hud">
      <span className="hud-score">
        <span className="hud-label">PUNTOS</span>
        <strong>{snapshot.score.toString().padStart(6, "0")}</strong>
      </span>
      <span className="hud-lives">
        <span className="hud-label">VIDAS</span>
        <strong>{"♥".repeat(Math.max(0, snapshot.lives))}</strong>
      </span>
      <span className="hud-stat">
        <span className="hud-label">NIVEL</span>
        <strong>{snapshot.level}</strong>
      </span>
      <span className="hud-stat">
        <span className="hud-label">NAVE</span>
        <strong>{snapshot.evolution + 1}</strong>
      </span>
    </div>
  );
}
