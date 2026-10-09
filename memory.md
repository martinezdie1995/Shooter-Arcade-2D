# Project Memory

## Current Architecture

- `GameEngine` (src/game/core/GameEngine.ts) es la única clase con el game loop
  (requestAnimationFrame + delta time con clamp de 0.05s). Fases por frame:
  input → update → estado → render → input.endFrame().
- `GameStore` (src/game/core/GameStore.ts) es un pub/sub mínimo que emite `UiSnapshot`
  a React solo cuando un valor visible cambia (nunca por frame).
- `InputSystem` traduce teclado a acciones lógicas (`isDown` mantenidas,
  `wasPressed` de una sola vez, limpiadas con `endFrame()`); también permite mover
  al jugador siguiendo el dedo en el canvas y detecta cualquier tecla para iniciar o reiniciar.
- `GameStore` conserva una cola breve de acciones de UI (`dispatch`/`consumeActions`)
  para que botones accesibles de inicio, pausa y reinicio soliciten acciones al engine.
- Colisiones: AABB en src/game/collision/collision.ts; `position` de entidades = centro.
- React (components/Game.tsx) solo monta canvas + engine en useEffect y renderiza
  overlays según `gameState`. El engine consulta el store; React no empuja estado al engine.

## Important Decisions

- Coordenadas lógicas fijas 480×640, definidas en `game/types/common.ts`.
- Entidades como interfaces + funciones puras (no clases de UI); permite extender
  con nuevos tipos sin tocar el engine.
- Renombrada la clase del motor a `GameEngine` para evitar colisión de nombre con el
  componente `Game`.
- Estado del juego: `menu | playing | paused | gameOver | victory` (union type).
- Sin librerías de juego (no Phaser/PixiJS): Canvas 2D puro para control total y cero
  dependencias innecesarias.

## Current State

- Fase 1 completa: proyecto Vite+React+TS configurado, canvas adaptable, game loop, input,
  jugador (movimiento horizontal con clamp), fondo con estrellas, HUD, menú, pausa (P/ESC),
  inicio y reinicio con cualquier tecla o botones; control táctil por seguimiento del dedo.
- Fase 2 completa: disparo del jugador, proyectiles, enemigos básicos, movimiento de oleada,
  disparos enemigos, colisiones con AABB, puntuación, vidas y fin de partida funcional.
- Fase 3 en progreso: enemigos tipo `basic` y `diver`; oleadas con variedad y patrones
  de descenso más dinámicos; sprites propios para cinco evoluciones del jugador y tres
  variantes de enemigo; power-ups de evolución que añaden carriles, disparos diagonales y
  cadencia; oleadas con enemigos que avanzan, intercambian posiciones y formaciones serpenteantes.
- Los enemigos `basic` usan el sprite nuevo a 48×32 px; las bajadas de enemigos normales
  y de oleadas especiales son cíclicas y están limitadas antes de la línea del jugador.
- Power-up usa el sprite `src/assets/power up.png` con hitbox cuadrada de 32×32 px.
- Las oleadas de jefe alternan los sprites `boss0.png` y `boss1.png`.
- El jefe tiene 200 puntos de vida y movimiento rápido con patrones de abanico/ráfaga más densos;
  alterna ciclos de ataque con una pausa para respirar y mantiene un ritmo algo más rápido
  cuando queda por debajo de la mitad de vida.
- Juego titulado `Level One`; sin barras de vida sobre enemigos. La cadencia y velocidad
  de disparo enemigo aumentan por oleada; el jefe alterna disparos dirigidos y abanicos,
  y tiene más resistencia. Incluye efectos de sonido y secuencia de muerte del jugador.
- Al iniciar, la presentación muestra "Creado Por:" con `devLogo.jpg` y espera una tecla
  para dar paso al menú; la interacción también habilita la música del menú.
- El menú usa el título arcade con relieve y reproduce `src/sounds/intro music.mp3`;
  la pista cambia suavemente al comenzar una partida. El menú muestra solo
  controles de movimiento/pausa y un botón para silenciar o activar la música.
- La música de `musica fondo.mp3` acompaña las oleadas normales y `bossfight.mp3` las
  oleadas de jefe; normalmente cambian con crossfade de 1.8 segundos. Al derrotar al jefe,
  la música normal reinicia inmediatamente, sin transición.
- Al comenzar o reiniciar una partida, la música anterior se corta antes de iniciar
  inmediatamente la pista del nivel correspondiente.
- Al pausar, la pista activa de juego se desvanece y se usa `intro music.mp3` como tema
  tranquilo de pausa; al reanudar vuelve la música del nivel o del jefe.
- Música al volumen máximo y efectos de sonido atenuados.
- La dificultad sube con enemigos más veloces y disparos algo más frecuentes; el jefe
  se mueve más rápido y acelera sus ráfagas en fase crítica.
- Solo los jefes muestran una barra de salud en canvas, debajo de su sprite.
- Los ataques alternan entre disparos dirigidos, abanicos y ráfagas según el tipo de enemigo;
  los jefes agregan barridos y pausas entre secuencias.
- La aparición del jefe anuncia peligro durante 2,8 segundos con alerta pulsante y temblor
  visual decreciente; la música de la pelea continúa durante la presentación.
- HUD, pausa y pantalla de fin de partida usan tipografía arcade condensada, contraste
  cian/rojo y profundidad para mantener coherencia visual con el menú.
- Los efectos usan los archivos de `src/sounds`: disparo, explosión, power-up y game over;
  al entrar a la pantalla final, `puntuacion final.mp3` se reproduce después del sonido
  de game over.
- Al reiniciar después de perder, se cancela la secuencia de audio game-over/puntuación.
- Durante cada pelea de jefe pueden caer power-ups de evolución cada 8–11 segundos;
  aparecen mejoras de vida ocasionales durante la partida, con un máximo de cinco vidas.
- Build verificado con `npm run build` sin errores.

## In Progress

- Refinar el balance del juego y el patrón de oleadas.

## Known Issues

- (ninguno conocido)

## Pending

- Fase 3: tipos de enemigos, patrones más ricos, ataques variados y power-ups.
- Fase 4: audio, efectos visuales, animaciones, refinado de dificultad.
- Fase 5: polish final y mejora de UX.

## Conventions

- Ver AGENTS.md (fuente de verdad de convenciones y reglas).

## Important Lessons

- `write` no sobrescribe archivos existentes: usar `edit` para modificar.

## Dependencies

- react / react-dom: UI alrededor del canvas.
- vite + @vitejs/plugin-react: dev server y build.
- typescript: build estricto (`npm run build` = `tsc -b && vite build`).
