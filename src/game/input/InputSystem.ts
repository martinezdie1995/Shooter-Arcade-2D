import type { GameAction } from "../types/common";
import { GAME_WIDTH } from "../types/common";

/**
 * Sistema de input independiente del dispositivo.
 * Traduce eventos físicos de teclado y controles táctiles a GameActions.
 */
export class InputSystem {
  private pressed: Partial<Record<GameAction, boolean>> = {};
  private held = new Set<string>();
  private touchPointerId: number | null = null;
  private touchPositionX: number | null = null;
  /** Acciones de "un solo disparo" (pulse) consumidas por el juego cada frame. */
  private justPressed: GameAction[] = [];
  private anyKeyPressed = false;

  private keyToAction(code: string): GameAction | null {
    switch (code) {
      case "ArrowLeft":
      case "KeyA":
        return "moveLeft";
      case "ArrowRight":
      case "KeyD":
        return "moveRight";
      case "KeyP":
      case "Escape":
        return "pause";
      case "Enter":
        return "confirm";
      default:
        return null;
    }
  }

  private isActionHeld(action: GameAction): boolean {
    for (const code of this.held) {
      if (this.keyToAction(code) === action) return true;
    }
    return false;
  }

  attach(target: HTMLElement | Window = window): void {
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
  }

  detach(target: HTMLElement | Window = window): void {
    target.removeEventListener("keydown", this.onKeyDown);
    target.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
  }

  attachTouchTarget(target: HTMLCanvasElement): void {
    target.addEventListener("pointerdown", this.onTouchStart);
    target.addEventListener("pointermove", this.onTouchMove);
    target.addEventListener("pointerup", this.onTouchEnd);
    target.addEventListener("pointercancel", this.onTouchEnd);
  }

  detachTouchTarget(target: HTMLCanvasElement): void {
    target.removeEventListener("pointerdown", this.onTouchStart);
    target.removeEventListener("pointermove", this.onTouchMove);
    target.removeEventListener("pointerup", this.onTouchEnd);
    target.removeEventListener("pointercancel", this.onTouchEnd);
  }

  private updateTouchPosition(event: PointerEvent): void {
    const canvas = event.currentTarget;
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0) return;
    this.touchPositionX = Math.max(
      0,
      Math.min(1, (event.clientX - bounds.left) / bounds.width),
    ) * GAME_WIDTH;
  }

  private onTouchStart = (event: PointerEvent): void => {
    if (event.pointerType !== "touch" || this.touchPointerId !== null) return;
    event.preventDefault();
    this.touchPointerId = event.pointerId;
    this.updateTouchPosition(event);
    if (event.currentTarget instanceof HTMLCanvasElement) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  private onTouchMove = (event: PointerEvent): void => {
    if (event.pointerId === this.touchPointerId) this.updateTouchPosition(event);
  };

  private onTouchEnd = (event: PointerEvent): void => {
    if (event.pointerId !== this.touchPointerId) return;
    this.touchPointerId = null;
    this.touchPositionX = null;
  };

  private onKeyDown = (e: Event): void => {
    const evt = e as KeyboardEvent;
    if (!evt.repeat) this.anyKeyPressed = true;
    const action = this.keyToAction(evt.code);
    if (!action) return;
    evt.preventDefault();
    if (!this.held.has(evt.code)) {
      this.held.add(evt.code);
      this.justPressed.push(action);
    }
    this.pressed[action] = true;
  };

  private onKeyUp = (e: Event): void => {
    const evt = e as KeyboardEvent;
    const action = this.keyToAction(evt.code);
    if (!action) return;
    this.held.delete(evt.code);
    this.pressed[action] = this.isActionHeld(action);
  };

  private onBlur = (): void => {
    this.held.clear();
    this.pressed = {};
    this.justPressed.length = 0;
    this.anyKeyPressed = false;
    this.touchPointerId = null;
    this.touchPositionX = null;
  };

  /** ¿La acción está mantenida? (movimiento continuo) */
  isDown(action: GameAction): boolean {
    return this.pressed[action] === true;
  }

  getTouchPositionX(): number | null {
    return this.touchPositionX;
  }

  /** ¿La acción fue pulsada desde el último frame? (un solo disparo) */
  wasPressed(action: GameAction): boolean {
    return this.justPressed.includes(action);
  }

  wasAnyKeyPressed(): boolean {
    return this.anyKeyPressed;
  }

  /** Debe llamarse al final de cada frame para limpiar los "just pressed". */
  endFrame(): void {
    this.justPressed.length = 0;
    this.anyKeyPressed = false;
  }
}
