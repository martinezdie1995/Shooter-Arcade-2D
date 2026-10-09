import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { UiSnapshot } from "../game/core/GameStore";
import { GameStore } from "../game/core/GameStore";
import { GameEngine } from "../game/core/GameEngine";
import { HUD } from "./HUD";
import { MainMenu } from "./MainMenu";
import { PauseMenu } from "./PauseMenu";
import { GameOverScreen } from "./GameOverScreen";
import { CreatorSplash } from "./CreatorSplash";
import { TouchControls } from "./TouchControls";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/types/common";
import menuMusicUrl from "../sounds/intro music.mp3";
import levelMusicUrl from "../sounds/musica fondo.mp3";
import bossMusicUrl from "../sounds/bossfight.mp3";

/**
 * Componente dueño del canvas y del ciclo de vida del GameEngine.
 * React aquí solo gestiona UI; el estado por frame vive en la clase GameEngine.
 */
export function Game(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const menuMusicRef = useRef<HTMLAudioElement | null>(null);
  const pauseMusicRef = useRef<HTMLAudioElement | null>(null);
  const levelMusicRef = useRef<HTMLAudioElement | null>(null);
  const bossMusicRef = useRef<HTMLAudioElement | null>(null);
  const activeMusicRef = useRef<HTMLAudioElement | null>(null);
  const musicFadeFrameRef = useRef<number | null>(null);
  const [showCreatorSplash, setShowCreatorSplash] = useState(true);
  const [menuMusicEnabled, setMenuMusicEnabled] = useState(true);
  const [ui, setUi] = useState<UiSnapshot>({
    gameState: "menu",
    score: 0,
    lives: 3,
    level: 1,
    evolution: 0,
  });
  const previousGameSnapshotRef = useRef({ gameState: ui.gameState, level: ui.level });

  const store = useMemo(() => new GameStore(ui), []); // eslint-disable-line react-hooks/exhaustive-deps

  const crossfadeMusic = useCallback((
    target: HTMLAudioElement | null,
    preserveInactivePosition = false,
  ): void => {
    const tracks = [
      menuMusicRef.current,
      pauseMusicRef.current,
      levelMusicRef.current,
      bossMusicRef.current,
    ].filter((track): track is HTMLAudioElement => track !== null);

    if (activeMusicRef.current === target && (target === null || !target.paused)) return;
    if (musicFadeFrameRef.current !== null) {
      cancelAnimationFrame(musicFadeFrameRef.current);
      musicFadeFrameRef.current = null;
    }

    if (target && target.paused) {
      if (target.currentTime >= target.duration) target.currentTime = 0;
      void target.play().catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "NotAllowedError")) {
          console.error("No se pudo reproducir la música.", error);
        }
      });
    }

    const initialVolumes = new Map(tracks.map((track) => [track, track.volume]));
    const startTime = performance.now();
    const duration = 1800;
    activeMusicRef.current = target;

    const fade = (now: number): void => {
      const progress = Math.min(1, (now - startTime) / duration);
      for (const track of tracks) {
        const initialVolume = initialVolumes.get(track) ?? 0;
        track.volume =
          track === target
            ? initialVolume + (1 - initialVolume) * progress
            : initialVolume * (1 - progress);
      }

      if (progress < 1) {
        musicFadeFrameRef.current = requestAnimationFrame(fade);
        return;
      }

      for (const track of tracks) {
        if (track === target) continue;
        track.pause();
        if (!preserveInactivePosition) track.currentTime = 0;
      }
      musicFadeFrameRef.current = null;
    };

    musicFadeFrameRef.current = requestAnimationFrame(fade);
  }, []);

  const switchMusicImmediately = useCallback((target: HTMLAudioElement | null): void => {
    if (musicFadeFrameRef.current !== null) {
      cancelAnimationFrame(musicFadeFrameRef.current);
      musicFadeFrameRef.current = null;
    }

    for (const track of [
      menuMusicRef.current,
      pauseMusicRef.current,
      levelMusicRef.current,
      bossMusicRef.current,
    ]) {
      if (!track || track === target) continue;
      track.pause();
      track.currentTime = 0;
      track.volume = 0;
    }

    if (!target) {
      activeMusicRef.current = null;
      return;
    }

    target.pause();
    target.currentTime = 0;
    target.volume = 1;
    activeMusicRef.current = target;
    void target.play().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "NotAllowedError")) {
        console.error("No se pudo iniciar la música de niveles.", error);
      }
    });
  }, []);

  const continueFromSplash = (): void => {
    crossfadeMusic(menuMusicEnabled ? menuMusicRef.current : null);
    setShowCreatorSplash(false);
  };

  const toggleMenuMusic = (): void => {
    const nextEnabled = !menuMusicEnabled;
    setMenuMusicEnabled(nextEnabled);
    if (!nextEnabled) {
      crossfadeMusic(null);
    } else if (ui.gameState === "menu") {
      crossfadeMusic(menuMusicRef.current);
    } else if (ui.gameState === "paused") {
      crossfadeMusic(pauseMusicRef.current, true);
    } else if (ui.gameState === "playing") {
      crossfadeMusic(
        ui.level % 5 === 0 ? bossMusicRef.current : levelMusicRef.current,
      );
    }
  };

  useLayoutEffect(() => {
    for (const track of [
      menuMusicRef.current,
      pauseMusicRef.current,
      levelMusicRef.current,
      bossMusicRef.current,
    ]) {
      if (track) track.volume = 0;
    }
  }, []);

  useEffect(() => {
    if (showCreatorSplash) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const engine = new GameEngine(canvas, store);
    const unsubscribe = store.subscribe(setUi);
    engine.start();

    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, [showCreatorSplash, store]);

  useEffect(() => {
    const previousSnapshot = previousGameSnapshotRef.current;
    previousGameSnapshotRef.current = { gameState: ui.gameState, level: ui.level };

    const bossWasDefeated =
      previousSnapshot.gameState === "playing" &&
      previousSnapshot.level % 5 === 0 &&
      ui.gameState === "playing" &&
      ui.level === previousSnapshot.level + 1;
    const runWasStarted =
      (previousSnapshot.gameState === "menu" ||
        previousSnapshot.gameState === "gameOver") &&
      ui.gameState === "playing";
    const levelMusic = levelMusicRef.current;
    if (bossWasDefeated && menuMusicEnabled && levelMusic) {
      switchMusicImmediately(levelMusic);
      return;
    }

    if (runWasStarted) {
      const gameMusic =
        ui.level % 5 === 0 ? bossMusicRef.current : levelMusic;
      switchMusicImmediately(menuMusicEnabled ? gameMusic : null);
      return;
    }

    if (showCreatorSplash || !menuMusicEnabled) {
      crossfadeMusic(null);
    } else if (ui.gameState === "menu") {
      crossfadeMusic(menuMusicRef.current);
    } else if (ui.gameState === "paused") {
      crossfadeMusic(pauseMusicRef.current, true);
    } else if (ui.gameState === "playing") {
      crossfadeMusic(
        ui.level % 5 === 0 ? bossMusicRef.current : levelMusicRef.current,
        previousSnapshot.gameState === "paused",
      );
    } else {
      crossfadeMusic(null);
    }
  }, [
    crossfadeMusic,
    menuMusicEnabled,
    showCreatorSplash,
    switchMusicImmediately,
    ui.gameState,
    ui.level,
  ]);

  useEffect(
    () => () => {
      if (musicFadeFrameRef.current !== null) {
        cancelAnimationFrame(musicFadeFrameRef.current);
      }
      for (const track of [
        menuMusicRef.current,
        pauseMusicRef.current,
        levelMusicRef.current,
        bossMusicRef.current,
      ]) {
        track?.pause();
      }
    },
    [],
  );

  return (
    <div className="game-shell">
      <div className="game-frame">
        <canvas ref={canvasRef} className="game-canvas" />
        <audio ref={menuMusicRef} src={menuMusicUrl} loop preload="auto" />
        <audio ref={pauseMusicRef} src={menuMusicUrl} loop preload="auto" />
        <audio ref={levelMusicRef} src={levelMusicUrl} loop preload="auto" />
        <audio ref={bossMusicRef} src={bossMusicUrl} loop preload="auto" />
        {showCreatorSplash ? (
          <CreatorSplash onContinue={continueFromSplash} />
        ) : (
          <>
            <HUD snapshot={ui} />
            {ui.gameState === "menu" && (
              <MainMenu
                menuMusicEnabled={menuMusicEnabled}
                onToggleMenuMusic={toggleMenuMusic}
                onStart={() => store.dispatch("confirm")}
              />
            )}
            {ui.gameState === "playing" && (
              <TouchControls onPause={() => store.dispatch("pause")} />
            )}
            {ui.gameState === "paused" && (
              <PauseMenu onResume={() => store.dispatch("pause")} />
            )}
            {ui.gameState === "gameOver" && (
              <GameOverScreen
                score={ui.score}
                onRestart={() => store.dispatch("confirm")}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
