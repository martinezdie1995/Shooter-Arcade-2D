interface MainMenuProps {
  menuMusicEnabled: boolean;
  onToggleMenuMusic: () => void;
  onShowScores: () => void;
  onStart: () => void;
}

/** Pantalla de menú inicial. */
export function MainMenu({
  menuMusicEnabled,
  onToggleMenuMusic,
  onShowScores,
  onStart,
}: MainMenuProps): JSX.Element {
  return (
    <div
      className="overlay main-menu"
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("button")) return;
        onStart();
      }}
    >
      <p className="menu-kicker">Arcade combat // survival</p>
      <h1 className="title title-hero" aria-label="Level One">
        <span>LEVEL</span>
        <span>ONE</span>
      </h1>
      <p className="menu-subtitle">
        <span>Sobrevive a las oleadas</span>
        <strong>Derrota al jefe</strong>
      </p>
      <div className="menu-hint">
        <p>Mover: flechas, W / A / S / D o desliza el dedo</p>
        <p>P / ESC: Pausa</p>
      </div>
      <button
        className="menu-music-toggle"
        type="button"
        onClick={onToggleMenuMusic}
        aria-pressed={!menuMusicEnabled}
      >
        {menuMusicEnabled ? "Silenciar música" : "Activar música"}
      </button>
      <button className="menu-scores" type="button" onClick={onShowScores}>
        Ver puntuaciones
      </button>
      <button className="start-hint menu-start" type="button" onClick={onStart}>
        Elegir nave y comenzar
      </button>
    </div>
  );
}
