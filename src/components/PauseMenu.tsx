/** Overlay de pausa. */
export function PauseMenu({ onResume }: { onResume: () => void }): JSX.Element {
  return (
    <div className="overlay pause-screen">
      <h2 className="pause-title">PAUSA</h2>
      <p className="pause-hint">Pulsa P o ESC para continuar</p>
      <button className="touch-button pause-resume" type="button" onClick={onResume}>
        Reanudar
      </button>
    </div>
  );
}
