import type { ScoreRecord } from "../game/systems/scoreHistory";

const scoreDateFormatter = new Intl.DateTimeFormat("es", {
  dateStyle: "short",
  timeStyle: "short",
});

export function ScoreTable({
  scores,
  compact = false,
}: {
  scores: ScoreRecord[];
  compact?: boolean;
}): JSX.Element {
  const orderedScores = [...scores].sort(
    (first, second) =>
      second.score - first.score ||
      Date.parse(first.achievedAt) - Date.parse(second.achievedAt),
  );

  return (
    <section
      className={`score-history${compact ? " score-history-compact" : ""}`}
      aria-label="Historial de puntuaciones"
    >
      <div className="score-table-scroll">
        <table className="score-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Puntos</th>
              <th scope="col">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orderedScores.length === 0 ? (
              <tr>
                <td className="score-table-empty" colSpan={3}>
                  Todavía no hay partidas finalizadas
                </td>
              </tr>
            ) : (
              orderedScores.map((record, index) => (
                <tr key={`${record.achievedAt}-${record.score}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{record.score.toLocaleString("es")}</td>
                  <td>{scoreDateFormatter.format(new Date(record.achievedAt))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
