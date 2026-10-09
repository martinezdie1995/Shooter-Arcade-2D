import shotSoundUrl from "../../sounds/disparo.mp3";
import explosionSoundUrl from "../../sounds/explosion.mp3";
import gameOverSoundUrl from "../../sounds/game over.mp3";
import powerUpSoundUrl from "../../sounds/power up.mp3";
import finalScoreSoundUrl from "../../sounds/puntuacion final.mp3";

export class AudioSystem {
  private activeSounds = new Set<HTMLAudioElement>();
  private gameOverSound: HTMLAudioElement | null = null;
  private finalScoreSound: HTMLAudioElement | null = null;
  private gameOverSequenceId = 0;

  playShot(): void {
    this.play(shotSoundUrl, 0.12);
  }

  playExplosion(): void {
    this.play(explosionSoundUrl, 0.22);
  }

  playPowerUp(): void {
    this.play(powerUpSoundUrl, 0.27);
  }

  playGameOver(): void {
    this.stopGameOver();
    const sequenceId = this.gameOverSequenceId;
    this.gameOverSound = this.play(gameOverSoundUrl, 0.3, () => {
      if (sequenceId !== this.gameOverSequenceId) return;
      this.gameOverSound = null;
      this.finalScoreSound = this.play(finalScoreSoundUrl, 0.3, () => {
        this.finalScoreSound = null;
      });
    });
  }

  stopGameOver(): void {
    this.gameOverSequenceId += 1;
    for (const sound of [this.gameOverSound, this.finalScoreSound]) {
      if (!sound) continue;
      sound.pause();
      sound.currentTime = 0;
      this.activeSounds.delete(sound);
    }
    this.gameOverSound = null;
    this.finalScoreSound = null;
  }

  destroy(): void {
    for (const sound of this.activeSounds) {
      sound.pause();
      sound.currentTime = 0;
    }
    this.activeSounds.clear();
  }

  private play(
    source: string,
    volume: number,
    onEnded?: () => void,
  ): HTMLAudioElement {
    const sound = new Audio(source);
    sound.volume = volume;
    this.activeSounds.add(sound);
    sound.addEventListener(
      "ended",
      () => {
        this.activeSounds.delete(sound);
        onEnded?.();
      },
      { once: true },
    );
    void sound.play().catch((error: unknown) => {
      this.activeSounds.delete(sound);
      onEnded?.();
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        console.warn(`El navegador bloqueó el sonido "${source}" hasta una interacción.`);
        return;
      }
      console.error(`No se pudo reproducir el sonido "${source}".`, error);
    });
    return sound;
  }
}
