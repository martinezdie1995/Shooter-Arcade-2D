/** Pantalla de fin de partida. */
export function GameOverScreen({
  score,
  onRestart,
}: {
  score: number;
  onRestart: () => void;
}): JSX.Element {
  return (
    <div className="overlay game-over-screen">
      <p className="game-over-kicker">Misión finalizada</p>
      <h2 className="game-over-title">FIN DE LA PARTIDA</h2>
      <div className="final-score-card">
        <p className="final-score-label">Puntuación final</p>
        <strong className="final-score-value">{score.toString().padStart(6, "0")}</strong>
      </div>
      <button className="game-over-hint" type="button" onClick={onRestart}>
        Pulsa cualquier tecla o toca aquí para volver a jugar
      </button>
    </div>
  );
}
