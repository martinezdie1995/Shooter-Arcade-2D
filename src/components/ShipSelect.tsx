import { PLAYER_SHIPS } from "../game/entities/playerShips";
import type { PlayerShipId } from "../game/types/entities";

interface ShipSelectProps {
  selectedShip: PlayerShipId;
  onSelect: (shipId: PlayerShipId) => void;
  onBack: () => void;
  onStart: () => void;
}

function ShipStat({
  label,
  value,
  fill,
}: {
  label: string;
  value: string;
  fill: number;
}): JSX.Element {
  return (
    <div className="ship-stat">
      <div className="ship-stat-heading">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="ship-stat-track" aria-hidden="true">
        <span style={{ width: `${fill}%` }} />
      </div>
    </div>
  );
}

export function ShipSelect({
  selectedShip,
  onSelect,
  onBack,
  onStart,
}: ShipSelectProps): JSX.Element {
  return (
    <section className="overlay ship-select" aria-labelledby="ship-select-title">
      <p className="menu-kicker">Hangar // selección de nave</p>
      <h2 className="ship-select-title" id="ship-select-title">Elige tu nave</h2>
      <p className="ship-select-subtitle">Cada configuración cambia tu forma de sobrevivir.</p>
      <div className="ship-grid">
        {PLAYER_SHIPS.map((ship) => {
          const isSelected = ship.id === selectedShip;
          const fireRateScore = Math.round(((0.34 - ship.fireRate) / 0.18) * 100);
          return (
            <button
              className={`ship-card${isSelected ? " ship-card-selected" : ""}`}
              type="button"
              key={ship.id}
              onClick={() => onSelect(ship.id)}
              aria-pressed={isSelected}
            >
              <span className="ship-card-image">
                <img
                  className={ship.rotated ? "ship-card-sprite-rotated" : undefined}
                  src={ship.spriteUrl}
                  alt=""
                />
              </span>
              <span className="ship-card-name">{ship.name}</span>
              <span className="ship-card-class">{ship.className}</span>
              <span className="ship-card-description">{ship.description}</span>
              <span className="ship-card-stats">
                <ShipStat
                  label="Velocidad"
                  value={`${ship.speed} PX/S`}
                  fill={Math.round(((ship.speed - 200) / 120) * 100)}
                />
                <ShipStat
                  label="Cadencia"
                  value={`${(1 / ship.fireRate).toFixed(1)}/S`}
                  fill={fireRateScore}
                />
                <ShipStat
                  label="Blindaje"
                  value={`${ship.lives} CASCOS`}
                  fill={ship.lives * 20}
                />
              </span>
            </button>
          );
        })}
      </div>
      <div className="ship-select-actions">
        <button className="ship-back" type="button" onClick={onBack}>Volver</button>
        <button className="ship-start" type="button" onClick={onStart}>
          Iniciar partida
        </button>
      </div>
    </section>
  );
}
