# AGENTS.md — Guía para agentes de desarrollo

## Proyecto

**Shooter 2D**: videojuego arcade 2D inspirado en la jugabilidad de Galaga (con gráficos,
sonidos y código 100% propios, sin assets ni código de terceros protegidos).

- **Stack**: React 18 + TypeScript (strict) + HTML5 Canvas + Vite + CSS. Sin otras dependencias.
- **Meta**: arquitectura modular y escalable que permita agregar enemigos, armas, power-ups,
  niveles y comportamientos sin reescribir lo existente.

## Estructura de carpetas y responsabilidades

```
src/
├── components/          # UI de React (Game, HUD, MainMenu, PauseMenu, GameOverScreen)
├── game/
│   ├── core/            # GameEngine (game loop) y GameStore (puente React)
│   ├── entities/        # Datos y lógica de entidades (player.ts, futuro: enemies, projectiles)
│   ├── systems/         # Sistemas transversales (audio, oleadas, power-ups — futuros)
│   ├── rendering/       # Todo el dibujo en canvas (sprites.ts, fondo, efectos)
│   ├── input/           # InputSystem: traduce dispositivos a GameActions
│   ├── collision/       # Colisiones (AABB) independientes del resto
│   ├── levels/          # Definiciones de oleadas/niveles (futuro)
│   └── types/           # Tipos del dominio: common.ts, entities.ts
├── hooks/               # Hooks React reutilizables (futuro)
├── utils/               # Helpers genéricos (futuro)
├── styles/              # CSS global (global.css)
└── assets/              # Recursos propios (futuro)
```

## Arquitectura (dónde vive cada cosa)

- **Game loop**: `game/core/GameEngine.ts`. Único dueño de `requestAnimationFrame`.
  Fases por frame: input → update → colisiones (futuro) → estado → render → `input.endFrame()`.
- **Entidades**: `game/entities/`. Son datos planos (interfaces) + funciones puras de
  create/update. No son clases de React ni componentes.
- **Rendering**: `game/rendering/`. Funciones que reciben `ctx` y dibujan. Prohibido dibujar
  desde componentes React o mezclar JSX con el canvas.
- **Input**: `game/input/InputSystem.ts`. Traduce teclado (y en futuro táctil/gamepad) a
  `GameAction` lógicas. Expone `isDown` (mantenida) y `wasPressed` (un disparo por pulsación).
- **Colisiones**: `game/collision/collision.ts`. AABB con `position` = centro de la entidad.
- **Estado del juego**:
  - Interno (por frame, posiciones, cooldowns): campos de `GameEngine`.
  - Visible por UI (`gameState`, score, vidas, nivel): `GameStore`, que emite a React
    **solo cuando cambia** un valor.
- **Comunicación React ↔ juego**: `Game.tsx` crea el `GameStore` y el `GameEngine` en un
  `useEffect`, se suscribe con `store.subscribe(setUi)` y destruye el engine en cleanup.
  Para que React dispare acciones (botones), usar `GameStore`/callbacks; el engine consulta
  el store. No exponer el engine globalmente sin necesidad.

## Reglas de desarrollo

### TypeScript

- `strict` siempre. `any` prohibido salvo justificación explícita en comentario.
- Tipos de dominio centralizados en `src/game/types/`.
- Usar `interfaces` para entidades y `type unions` para estados/discretos.
- `noUnusedLocals` / `noUnusedParameters` activos: no dejar código muerto.

### React

- React gestiona UI y estados de alto nivel. **Nunca** React state para datos por frame.
- Re-renders de React solo desde cambios de `GameStore`.
- Un componente = una responsabilidad; nada de archivos gigantes.

### Canvas

- Coordenadas lógicas fijas: `GAME_WIDTH = 480`, `GAME_HEIGHT = 640` (definir tamaños en
  `types/common.ts`, no hardcodear números sueltos).
- `position` de entidades siempre es el **centro**.
- Delta time en segundos, con clamp (actualmente 0.05s) para evitar saltos tras perder foco.
- Toda lógica de movimiento debe ser proporcional a `dt` (velocidades en px/s).

### Naming

- Archivos de módulos de juego: `camelCase.ts` (player.ts, sprites.ts).
- Clases: `PascalCase`. Funciones: `camelCase`. Constantes de configuración: `UPPER_SNAKE_CASE`.
- Tipos/interfaces: `PascalCase`, sin prefijos (`I`, `T`).

### Errores y verificación

- Tras cualquier cambio: `npm run build` (tsc + vite) debe pasar sin errores.
- No silenciar errores de tipos con casts; corregir la causa.

## Reglas importantes (no romper)

1. No usar React state para datos que cambian cada frame.
2. No colocar lógica de juego dentro de componentes.
3. No usar `any` sin justificación.
4. No agregar dependencias sin necesidad real.
5. No modificar la arquitectura sin evaluar impacto y documentarlo en `memory.md`.
6. No duplicar lógica; un concepto vive en un solo lugar.
7. Solo un game loop: `GameEngine.start()` es idempotente; `destroy()` cancela el RAF.
8. No crear sistemas paralelos que hagan lo mismo.
9. Antes de codificar: leer `AGENTS.md` y `memory.md`, inspeccionar módulos afectados,
   explicar brevemente el cambio, implementarlo, verificar build, y actualizar `memory.md`
   solo si hay información que conservar.

## Flujo de trabajo del agente

1. Leer `AGENTS.md` y `memory.md`.
2. Inspeccionar la estructura existente (no asumir cómo funciona el código).
3. Identificar módulos afectados.
4. Explicar brevemente qué se va a modificar.
5. Implementar el cambio más pequeño correcto.
6. Verificar con `npm run build` (y manualmente con `npm run dev` si aplica).
7. Actualizar `memory.md` solo si corresponde.
