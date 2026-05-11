# Daily DJ Rotation — Design

**Fecha:** 2026-05-11
**Estado:** Aprobado (brainstorming), pendiente plan de implementación
**Autora del producto:** Lina

---

## Contexto y problema

Hoy la radio Live-set tiene 8 DJs en el roster (`data/dj-roster.json`), pero la app sólo muestra 4 hardcoded (Mara, Kei, Zola, Paloma) porque `js/data.js` los lleva embebidos. Los 4 DJs nuevos (Aida, Naina, Mariana, Tati) viven en JSON aparte y nunca salen al aire.

El guide del proyecto (`_workspace/docs/DJ_PROFILE_GUIDE.md`) describe un modelo de **4 canales, rotación diaria**: cada día se eligen 4 DJs distintos del roster, uno por canal (focus/flow/move/intensity). Ese modelo nunca se implementó.

**Objetivo de esta spec:** desbloquear la rotación diaria. Que cada día la app muestre 4 DJs distintos seleccionados del roster, sincronizados globalmente.

**Fuera de alcance:** completar los pools cortos a 25 tracks (tarea siguiente), playlists con tags y cruces (spec posterior cuando haya más material), build step / servidor.

---

## Decisiones tomadas durante brainstorming

| Decisión | Valor | Razón |
|---|---|---|
| Política de selección | Aleatorio determinista por fecha (UTC) | Misma fecha → mismos 4 DJs globalmente. Sincronización global del guide. |
| DJs con pools cortos (<25) | Entran tal cual | Mantiene rotación viva desde día 1. La curación de tracks va aparte. |
| Fuente de datos | Separada: roster vs playlists, como JS-data | Roster y tracks cambian a ritmos distintos. Sigue vanilla, sin servidor. |
| Repetición entre días consecutivos | Permitida | Con 2 DJs/canal, forzar no-repetición vuelve la rotación predecible. Reevaluar con más DJs. |
| Timezone del "día" | UTC | Radio globalmente sincronizada, como dice el guide. |

---

## Arquitectura

### Archivos

```
data/
  dj-roster.js       ← NUEVO. window.DJ_ROSTER con los 8 DJs (perfil completo)
  dj-playlists.js    ← NUEVO. window.DJ_PLAYLISTS con pools por DJ
  dj-roster.json     ← BORRAR (migrado)
  dj-playlists.json  ← BORRAR (migrado)
js/
  data.js            ← REDUCIDO. Adapter: rotación + transformación al shape de app.js
  app.js             ← Sin cambios estructurales
  player.js          ← Sin cambios
  vinyl.js           ← Sin cambios
index.html           ← Añadir 2 <script> antes de js/data.js
```

### Orden de carga en `index.html`

```html
<script src="data/dj-roster.js"></script>      <!-- expone window.DJ_ROSTER -->
<script src="data/dj-playlists.js"></script>   <!-- expone window.DJ_PLAYLISTS -->
<script src="js/data.js"></script>             <!-- consume globals, expone DJS, ALBUMS -->
<script src="js/player.js"></script>
<script src="js/vinyl.js"></script>
<script src="js/app.js"></script>
```

### Flujo de datos

```
[dj-roster.js: 8 DJs]  ─┐
                        ├──→ js/data.js
[dj-playlists.js: pools]┘    │
                             ├─ pickDailyDJs(roster, date) → 4 DJs (uno por canal)
                             ├─ flattenTracks(4 DJs) → ALBUMS
                             └─ export DJS, ALBUMS
                                     ↓
                              app.js consume como hoy
```

### Principios

- Una sola operación de rotación, ejecutada al boot. La app no recalcula en runtime.
- El cliente decide la fecha: `new Date().toISOString().slice(0,10)` → seed → rotación.
- Boot síncrono. Sin `fetch`. Sin servidor. Doble click sobre `index.html` sigue funcionando.
- `app.js` sigue creyendo que hay 4 DJs fijos — la magia ocurre antes en `js/data.js`.

---

## Algoritmo de rotación

### Pseudo-código

```js
function pickDailyDJs(roster, date) {
  const seed = dateToSeed(date);                       // "2026-05-11" → 20260511
  const byChannel = groupBy(roster, 'channel');
  const channels = ['focus', 'flow', 'move', 'intensity'];

  return channels.map((channel, i) => {
    const candidates = byChannel[channel];
    if (!candidates || candidates.length === 0) {
      console.warn(`No DJs for channel ${channel}`);
      return null;
    }
    const idx = seededIndex(seed + i, candidates.length);
    return candidates[idx];
  });
}
```

### Garantías

- **Determinista por fecha**: misma fecha en UTC → misma selección, en cualquier dispositivo, en cualquier zona horaria.
- **Cobertura completa**: siempre 4 DJs, uno por canal. Nunca dos del mismo canal.
- **Distribución natural**: con 2 DJs por canal, cada DJ aparece ~50% de los días.

### Seed determinista

`dateToSeed("2026-05-11")` produce un entero estable. Implementación simple:

```js
function dateToSeed(date) {
  return parseInt(date.replace(/-/g, ''), 10); // 20260511
}

function seededIndex(seed, n) {
  // Multiplicador-añadidor simple, suficiente para 2-3 candidatos.
  const x = (seed * 9301 + 49297) % 233280;
  return Math.floor((x / 233280) * n);
}
```

No necesita PRNG sofisticado: el input set es pequeño (2 candidatos por canal hoy, máximo decenas a futuro).

---

## Migración de datos

### `data/dj-roster.js` (nuevo)

Wrap del contenido actual de `data/dj-roster.json`:

```js
window.DJ_ROSTER = {
  version: "...",
  description: "...",
  channels: { ... },
  roster: [
    { id: "dj-mara", name: "Mara Velour", channel: "move", /* ...perfil completo... */ },
    /* ... 7 más ... */
  ]
};
```

**Verificación pendiente:** los DJs viejos en JSON pueden no tener todos los campos visuales (`illustration` paths, `colorPalette`). Auditar al migrar y completar cruzando con `js/data.js`.

### `data/dj-playlists.js` (nuevo)

```js
window.DJ_PLAYLISTS = {
  "dj-mara":     { pool: [ /* tracks */ ] },
  "dj-kei":      { pool: [ /* tracks */ ] },
  /* ... 6 más ... */
};
```

Shape unificado por track:

```js
{
  id,             // requerido
  title,          // requerido
  artist,         // requerido
  soundcloudUrl,  // requerido
  artworkUrl,     // requerido
  coverColor,     // opcional — si falta, deriva del colorPalette del DJ
  bpm,            // opcional
  mixDj,          // opcional — presente si el track es un mix
  djVerdict       // opcional — narrativa del DJ sobre el track
}
```

**Pools que se llenan en esta migración:**

| DJ | Origen | Conteo |
|---|---|---|
| Mara, Kei, Zola, Paloma | Migrados desde `ALBUMS` en `js/data.js` | 12-17 c/u (quedan cortos, OK) |
| Aida, Naina, Mariana, Tati | Copiados de `dj-playlists.json` | 25 c/u |

### Reducción de `js/data.js`

Después de migrar queda sólo:

- Helper `animSrc()` (Safari/iOS detection) — ya existe, se preserva.
- `pickDailyDJs(roster, date)` + helpers (`dateToSeed`, `seededIndex`, `groupBy`).
- Lectura de globals → construcción de `DJS` (los 4 del día) y `ALBUMS` (sus tracks).
- Export al `window` o como variables globales como hoy.

Tamaño estimado: ~80 líneas (vs ~400 actuales).

### Riesgos al migrar

- Conservar `coverColor` por-track de los viejos (tiñe el vinyl).
- Conservar `mixDj` (distingue mixes de tracks normales en la UI).
- No romper rutas de `illustration` (asociadas al perfil del DJ).
- Backup: commit antes de borrar los JSON viejos.

---

## Manejo de errores

| Caso | Comportamiento |
|---|---|
| Canal sin DJs | Log warning. El slot queda `null`. `app.js` necesita micro-defensa (ver Riesgos abiertos). |
| Pool vacío de un DJ | Track engine ya tolera; no se toca. |
| Campo faltante en roster | Fallback silencioso a default sano, log a consola. |
| `DJ_ROSTER` o `DJ_PLAYLISTS` no cargados | Console error explícito al boot, app no arranca. Indica typo de path. |

---

## Validación (manual)

El proyecto es vanilla, sin tests automatizados. Esta spec no introduce infra de testing.

Checklist post-implementación:

- [ ] Smoke test: abrir `index.html`, ver qué 4 DJs salen. Cambiar fecha del sistema +1 día, recargar → idealmente cambian al menos 1-2.
- [ ] Determinismo: misma fecha en dos navegadores distintos → mismos 4 DJs.
- [ ] Cobertura de canales: cada uno de los 4 canales muestra un DJ; nunca dos del mismo canal.
- [ ] Sin regresiones de Mara/Kei/Zola/Paloma: cover, color, BPM, mix track, todos iguales que antes.
- [ ] iOS/Safari: audio sigue arrancando con el primer gesto.
- [ ] Splash: las animaciones de los 4 DJs activos se precargan (no las de los 4 que no salen hoy).

---

## Fuera de alcance

- Completar pools cortos a 25 (tarea siguiente, requiere curaduría según reglas en `memory/music-curation-rules.md`).
- Playlists/grupos/tags y operaciones de cruce (spec diferida).
- `djVerdict` retroactivo para tracks viejos (opcional, decisión de producto).
- Build step, transformación de assets, servidor.
- Cambios en `app.js`, `player.js`, `vinyl.js` salvo lo estrictamente necesario para mantener el shape de `DJS`/`ALBUMS`.

---

## Riesgos abiertos / a decidir en implementación

- Si algún canal queda con `null` (canal sin DJs), `app.js` puede asumir 4 DJs y romperse al iterar. Plan: el adapter garantiza siempre 4 entradas; si un canal queda vacío, se loguea y se sustituye por un placeholder mínimo (objeto con flag `unavailable: true`). `app.js` se ajusta para omitir ese slot del switcher si aparece.
- Carga de splash: hoy se precargan animaciones de los 4 DJs hardcoded. Tras la rotación, deben precargarse las animaciones de los **4 DJs del día** (no de los 8). Verificar que el código de splash lea de `DJS` (los activos) y no de una lista hardcoded.

---

## Tarea siguiente (otra spec)

Completar pools cortos a 25 tracks para Mara/Kei/Zola/Paloma, siguiendo reglas de `music-curation-rules.md` (geo-bloqueo, interleaving, mix en posición 13, artwork t500x500).
