interface TouchControlsProps {
  onPause: () => void;
}

export function TouchControls({ onPause }: TouchControlsProps): JSX.Element {
  return (
    <div className="touch-controls" aria-label="Controles táctiles">
      <button className="touch-button touch-pause" type="button" onClick={onPause}>
        Pausa
      </button>
    </div>
  );
}
