import { useEffect, useRef } from "react";
import type { ScoreRecord } from "../game/systems/scoreHistory";
import { ScoreTable } from "./ScoreTable";

export function Scoreboard({
  scores,
  onBack,
}: {
  scores: ScoreRecord[];
  onBack: () => void;
}): JSX.Element {
  const scoreboardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scoreboardRef.current?.focus();
  }, []);

  return (
    <div
      ref={scoreboardRef}
      className="overlay scoreboard-screen"
      tabIndex={-1}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") onBack();
      }}
    >
      <p className="menu-kicker">Registro de combate</p>
      <h2 className="scoreboard-title">PUNTUACIONES</h2>
      <ScoreTable scores={scores} />
      <button className="scoreboard-back" type="button" onClick={onBack}>
        Volver al menú
      </button>
    </div>
  );
}
