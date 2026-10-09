interface MainMenuProps {
  menuMusicEnabled: boolean;
  onToggleMenuMusic: () => void;
  onStart: () => void;
}

/** Pantalla de menú inicial. */
export function MainMenu({
  menuMusicEnabled,
  onToggleMenuMusic,
  onStart,
}: MainMenuProps): JSX.Element {
  return (
    <div className="overlay main-menu">
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
        <p>Mover: ← →, A / D o desliza el dedo</p>
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
      <button className="start-hint menu-start" type="button" onClick={onStart}>
        Pulsa cualquier tecla o toca aquí para comenzar
      </button>
    </div>
  );
}
