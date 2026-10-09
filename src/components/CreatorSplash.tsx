import { useEffect } from "react";
import devLogoUrl from "../assets/devLogo.jpg";

interface CreatorSplashProps {
  onContinue: () => void;
}

export function CreatorSplash({ onContinue }: CreatorSplashProps): JSX.Element {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.repeat || event.key === "Shift" || event.key === "Control" ||
        event.key === "Alt" || event.key === "Meta") {
        return;
      }
      event.preventDefault();
      onContinue();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onContinue]);

  return (
    <div
      className="creator-splash"
      aria-label="Creado por"
      onPointerDown={onContinue}
    >
      <div className="creator-card">
        <p className="creator-label">Creado Por:</p>
        <div className="creator-logo-frame">
          <img className="creator-logo" src={devLogoUrl} alt="Diego Martínez, Developer" />
        </div>
        <p className="creator-caption">LEVEL ONE <span>//</span> ARCADE SYSTEM</p>
        <p className="creator-prompt">
          Pulsa cualquier tecla o toca la pantalla para continuar
        </p>
      </div>
    </div>
  );
}
