import type { GameAction, GameState } from "../types/common";

/**
 * Datos visibles por la UI (React). Se emiten solo cuando cambian,
 * nunca cada frame.
 */
export interface UiSnapshot {
  gameState: GameState;
  score: number;
  lives: number;
  level: number;
  evolution: number;
}

export type UiListener = (snapshot: UiSnapshot) => void;

/**
 * Store mínimo que sincroniza el estado interno del juego con React y recibe
 * acciones puntuales de la UI para que el engine las consuma en su siguiente frame.
 */
export class GameStore {
  private snapshot: UiSnapshot;
  private listeners = new Set<UiListener>();
  private queuedActions: GameAction[] = [];

  constructor(snapshot: UiSnapshot) {
    this.snapshot = { ...snapshot };
  }

  get(): UiSnapshot {
    return this.snapshot;
  }

  dispatch(action: GameAction): void {
    this.queuedActions.push(action);
  }

  consumeActions(): GameAction[] {
    const actions = this.queuedActions;
    this.queuedActions = [];
    return actions;
  }

  set(partial: Partial<UiSnapshot>): void {
    let changed = false;
    for (const key of Object.keys(partial) as (keyof UiSnapshot)[]) {
      if (this.snapshot[key] !== partial[key]) changed = true;
    }
    if (!changed) return;
    this.snapshot = { ...this.snapshot, ...partial };
    for (const listener of this.listeners) listener(this.snapshot);
  }

  subscribe(listener: UiListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
