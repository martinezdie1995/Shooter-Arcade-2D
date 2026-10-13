export interface ScoreRecord {
  score: number;
  achievedAt: string;
}

const SCORE_HISTORY_KEY = "level-one-score-history";

function isScoreRecord(value: unknown): value is ScoreRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.score === "number" &&
    Number.isFinite(record.score) &&
    typeof record.achievedAt === "string" &&
    Number.isFinite(Date.parse(record.achievedAt))
  );
}

export function loadScoreHistory(): ScoreRecord[] {
  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(SCORE_HISTORY_KEY);
  } catch (error: unknown) {
    console.error("No se pudo leer el historial de puntuaciones.", error);
    return [];
  }
  if (serialized === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error: unknown) {
    console.error("El historial de puntuaciones guardado no es válido.", error);
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.error("El historial de puntuaciones guardado no tiene el formato esperado.");
    return [];
  }
  const records = parsed.filter(isScoreRecord);
  if (records.length !== parsed.length) {
    console.warn("Se omitieron entradas inválidas del historial de puntuaciones.");
  }
  return records;
}

export function recordFinalScore(score: number): ScoreRecord[] {
  const history = loadScoreHistory();
  const updated = [...history, { score, achievedAt: new Date().toISOString() }];
  try {
    window.localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(updated));
  } catch (error: unknown) {
    console.error("No se pudo guardar la puntuación en el almacenamiento local.", error);
  }
  return updated;
}
