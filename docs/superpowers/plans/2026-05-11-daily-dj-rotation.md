# Daily DJ Rotation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pick 4 DJs per UTC day (one per channel) from a roster of 8, replacing the current 4 hardcoded DJs in `js/data.js`, so all DJs in the roster can surface on air.

**Architecture:** Split data into two new files (`data/dj-roster.js` for profiles, `data/dj-playlists.js` for tracks + radio sync tables), reduce `js/data.js` to a thin adapter that runs a date-seeded rotation and exposes the same `DJS`/`ALBUMS` globals that `app.js` already consumes. Vanilla JS, no build, no server.

**Tech Stack:** Vanilla JS loaded via `<script>` tags. No bundler. No `fetch`. SoundCloud Widget API + GSAP via CDN (unchanged).

**Spec:** `docs/superpowers/specs/2026-05-11-daily-dj-rotation-design.md`

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `data/dj-roster.js` | Create | `window.DJ_ROSTER` — 8 DJ profiles (identity, taste, sound, visual). |
| `data/dj-playlists.js` | Create | `window.DJ_PLAYLISTS` — pools per DJ + track durations + phase offsets. |
| `js/data.js` | Rewrite | Adapter: reads globals, runs rotation, exposes `DJS`/`ALBUMS` + radio sync helpers. |
| `index.html` | Modify | Add 2 `<script>` tags + replace hardcoded animation preload with dynamic roster-driven preload. |
| `data/dj-roster.json` | Delete | Migrated to `.js`. |
| `data/dj-playlists.json` | Delete | Migrated to `.js`. |

Files unchanged: `js/app.js`, `js/player.js`, `js/vinyl.js`.

---

## Task 1: Backfill illustration paths in `data/dj-roster.json`

**Why:** `data/dj-roster.json` has `visual.illustration: null` for Kei/Zola/Paloma. The real paths live in `js/data.js`. Need them before the migration so the new `dj-roster.js` is complete.

**Files:**
- Modify: `data/dj-roster.json`

**Reference (current values in `js/data.js:13-43`):**
- `dj-mara` → `assets/animation/stone-dj.webm` (already correct in JSON)
- `dj-kei` → `assets/animation/guy-dj.webm`
- `dj-zola` → `assets/animation/geisha-dj.webm`
- `dj-paloma` → `assets/animation/chicken-dj.webm`

- [ ] **Step 1: Read `data/dj-roster.json` to locate the three `null` entries**

Use Read on the file or `jq '.roster | map(select(.visual.illustration == null)) | map(.id)'` to confirm which DJs are affected.

- [ ] **Step 2: Edit `dj-kei` visual.illustration**

Change:
```json
"illustration": null,
```
To:
```json
"illustration": "assets/animation/guy-dj.webm",
```
in the `dj-kei` entry only.

- [ ] **Step 3: Edit `dj-zola` visual.illustration**

Change `null` → `"assets/animation/geisha-dj.webm"` in the `dj-zola` entry.

- [ ] **Step 4: Edit `dj-paloma` visual.illustration**

Change `null` → `"assets/animation/chicken-dj.webm"` in the `dj-paloma` entry.

- [ ] **Step 5: Verify all 8 DJs now have an illustration**

Run:
```bash
jq '.roster | map({id, illustration: .visual.illustration})' data/dj-roster.json
```
Expected: all 8 entries show a non-null path.

- [ ] **Step 6: Commit**

```bash
git add data/dj-roster.json
git commit -m "Backfill illustration paths for legacy DJs in roster"
```

---

## Task 2: Create `data/dj-roster.js`

**Why:** Migrate roster data from JSON to a JS file that exposes `window.DJ_ROSTER`, so it can be loaded by `<script>` tag without `fetch`.

**Files:**
- Create: `data/dj-roster.js`
- Read: `data/dj-roster.json` (source)

- [ ] **Step 1: Read the full content of `data/dj-roster.json`**

We will wrap it verbatim, so we need the whole object.

- [ ] **Step 2: Create `data/dj-roster.js` with this content**

```js
// DJ Roster — 8 DJs with full profiles (identity, taste, sound, visual).
// Source of truth for daily rotation.
// Migrated from data/dj-roster.json on 2026-05-11.

window.DJ_ROSTER = /* PASTE the entire JSON object content here, verbatim */;
```

The `/* PASTE ... */` placeholder must be replaced with the actual JSON content (the top-level object: `{ "version": ..., "description": ..., "channels": ..., "roster": [...] }`). Result is valid JS — JSON is a subset of JS object literal syntax.

- [ ] **Step 3: Verify the file is valid JS**

Open `index.html` in a browser temporarily (don't worry, the file isn't wired in yet — this is a syntax check via console). Or, more simply, load the file standalone in DevTools:

```bash
node -e "require('./data/dj-roster.js')" 2>&1 || echo "(expected: 'window is not defined' — that's fine, means syntax parses)"
```

Expected: error mentioning `window is not defined`, NOT a syntax error. If you see "Unexpected token" or similar parse error, fix the file before continuing.

- [ ] **Step 4: Don't wire into index.html yet. Don't commit yet. Continue to Task 3.**

(We'll commit the two new data files together in one commit at the end of Task 3.)

---

## Task 3: Create `data/dj-playlists.js`

**Why:** Move all tracks + radio-sync tables out of `js/data.js`. Combine pools from both sources (4 old DJs from `ALBUMS` in `js/data.js`, 4 new from `data/dj-playlists.json`). Include `trackDurations` and `djPhaseOffset` so radio sync keeps working.

**Files:**
- Create: `data/dj-playlists.js`
- Read: `js/data.js:50-204` (ALBUMS for old DJs), `js/data.js:234-358` (TRACK_DURATIONS), `js/data.js:372-377` (DJ_PHASE_OFFSET), `data/dj-playlists.json` (new DJs)

- [ ] **Step 1: Inspect the `ALBUMS` array shape in `js/data.js`**

Confirm shape per track: `{ id, title, artist, djId, soundcloudUrl, artworkUrl, coverColor, bpm, mixDj? }`.

- [ ] **Step 2: Inspect the new DJ track shape in `data/dj-playlists.json`**

Confirm shape per track: `{ id, title, artist, soundcloudUrl, artworkUrl, djVerdict? }`. Note: no `djId`, `coverColor`, or `bpm` on new tracks.

- [ ] **Step 3: Create `data/dj-playlists.js` with this structure**

```js
// DJ Playlists — pools per DJ + radio sync tables (track durations + phase offsets).
// Tracks are interleaved by artist, mixes distributed across the set (see music-curation-rules.md).
// Migrated from data/dj-playlists.json (new DJs) and js/data.js (old DJs) on 2026-05-11.

window.DJ_PLAYLISTS = {
  pools: {
    'dj-mara': {
      pool: [
        // PASTE here, in order, all tracks from ALBUMS in js/data.js where djId === 'dj-mara'.
        // Keep the same fields: { id, title, artist, djId, soundcloudUrl, artworkUrl, coverColor, bpm, mixDj? }.
        // Preserve the existing ordering (it's interleaved — don't reorder).
      ],
    },
    'dj-kei': {
      pool: [
        // PASTE here all tracks where djId === 'dj-kei'.
      ],
    },
    'dj-zola': {
      pool: [
        // PASTE here all tracks where djId === 'dj-zola'.
      ],
    },
    'dj-paloma': {
      pool: [
        // PASTE here all tracks where djId === 'dj-paloma'.
      ],
    },
    'dj-aida': {
      pool: [
        // PASTE here the 25 tracks from data/dj-playlists.json's playlists['dj-aida'].pool.
        // Add djId: 'dj-aida' to each track entry (the JSON omitted this — add it now).
      ],
    },
    'dj-naina': {
      pool: [
        // Same: 25 tracks, add djId: 'dj-naina'.
      ],
    },
    'dj-mariana': {
      pool: [
        // Same: 25 tracks, add djId: 'dj-mariana'.
      ],
    },
    'dj-tati': {
      pool: [
        // Same: 25 tracks, add djId: 'dj-tati'.
      ],
    },
  },

  // Real durations in ms — fetched via _workspace/tests/verify-tracks.html.
  // Only the 4 legacy DJs have populated entries; new DJs use the fallback in getTrackDuration.
  trackDurations: {
    // PASTE here the entire TRACK_DURATIONS object body from js/data.js (lines 234-358),
    // as a flat object: { 'mara-01': 460371, 'mara-02': 416549, ... }.
  },

  // Phase offset per DJ so the single mix per DJ doesn't coincide across DJs.
  // Only legacy DJs have offsets; new DJs default to 0 (see getRadioPosition).
  djPhaseOffset: {
    'dj-mara':   108 * 60000,
    'dj-kei':    132 * 60000,
    'dj-zola':    44 * 60000,
    'dj-paloma': 211 * 60000,
  },
};
```

When pasting the old-DJ pools, preserve every field (including `coverColor`, `bpm`, `mixDj`). When pasting the new-DJ pools from JSON, also add a `djId` field on each track (the JSON doesn't have one — `app.js` needs it to filter).

- [ ] **Step 4: Sanity-check track counts**

Run in DevTools console after loading the file (or use `node -e`):
```js
Object.entries(window.DJ_PLAYLISTS.pools).map(([id, p]) => [id, p.pool.length])
```
Expected:
```
[ ['dj-mara', 17], ['dj-kei', 14], ['dj-zola', 13], ['dj-paloma', 12],
  ['dj-aida', 25], ['dj-naina', 25], ['dj-mariana', 25], ['dj-tati', 25] ]
```

If any count is off, the migration missed or duplicated tracks. Fix before continuing.

- [ ] **Step 5: Sanity-check every track has `djId` matching its bucket**

```js
Object.entries(window.DJ_PLAYLISTS.pools).every(
  ([id, p]) => p.pool.every(t => t.djId === id)
)
```
Expected: `true`.

- [ ] **Step 6: Commit both new data files together**

```bash
git add data/dj-roster.js data/dj-playlists.js
git commit -m "Migrate roster and playlists to JS-data modules

Wraps the JSON content as window.DJ_ROSTER and window.DJ_PLAYLISTS so
they can be loaded via <script> tags without fetch. Adds djId to new
DJs' tracks. Track durations and phase offsets move alongside the
pools they describe. The app does not consume these files yet —
that switch happens in the next commit."
```

---

## Task 4: Rewrite `js/data.js` as an adapter

**Why:** Replace the embedded `DJS`/`ALBUMS` with: a date-seeded rotation that picks 4 DJs from `window.DJ_ROSTER`, plus the same downstream API (`DJS`, `ALBUMS`, helpers, radio sync) that `app.js`/`player.js` already consume.

**Files:**
- Rewrite: `js/data.js`
- Reference: `js/app.js:80`, `js/app.js:376-377` (consumers of `DJS`)

- [ ] **Step 1: Replace the entire contents of `js/data.js` with this code**

```js
// ============================================
// Data Adapter — Daily DJ Rotation + Radio Sync
// Consumes window.DJ_ROSTER and window.DJ_PLAYLISTS (loaded before this file)
// Exposes: DJS (4 DJs of the day), ALBUMS (their tracks), and helpers.
// ============================================

// ---- Rotation ----

function _dateToSeed(dateStr) {
  // "2026-05-11" → 20260511
  return parseInt(dateStr.replace(/-/g, ''), 10);
}

function _seededIndex(seed, n) {
  // Linear congruential generator. Good enough for n in 2..few-dozen.
  const x = (seed * 9301 + 49297) % 233280;
  return Math.floor((x / 233280) * n);
}

function _groupByChannel(roster) {
  const byChannel = { focus: [], flow: [], move: [], intensity: [] };
  for (const dj of roster) {
    if (byChannel[dj.channel]) byChannel[dj.channel].push(dj);
  }
  return byChannel;
}

function pickDailyDJs(roster, dateStr) {
  const seed = _dateToSeed(dateStr);
  const byChannel = _groupByChannel(roster);
  const channels = ['focus', 'flow', 'move', 'intensity'];

  return channels.map((channel, i) => {
    const candidates = byChannel[channel];
    if (!candidates || candidates.length === 0) {
      console.warn('[rotation] no DJs for channel', channel);
      return null;
    }
    const idx = _seededIndex(seed + i, candidates.length);
    return candidates[idx];
  });
}

// ---- Adapt roster entry → DJ shape that app.js expects ----
// app.js uses: id, name, channel, genres, illustration, bio, philosophy, energy.

function _toAppDJ(rosterEntry) {
  return {
    id: rosterEntry.id,
    name: rosterEntry.name,
    channel: rosterEntry.channel,
    genres: (rosterEntry.sound && rosterEntry.sound.genres) || rosterEntry.genres || [],
    illustration: animSrc(
      (rosterEntry.visual && rosterEntry.visual.illustration) ||
      rosterEntry.illustration ||
      'assets/animation/general-dj.webm'
    ),
    bio: (rosterEntry.personality && rosterEntry.personality.bio) || rosterEntry.bio || '',
    philosophy: (rosterEntry.personality && rosterEntry.personality.philosophy) || rosterEntry.philosophy || '',
    energy: (rosterEntry.personality && rosterEntry.personality.energy) || rosterEntry.energy || '',
  };
}

// ---- Build DJS + ALBUMS for today ----

const _today = new Date().toISOString().slice(0, 10); // UTC date
const _activeRosterEntries = pickDailyDJs(window.DJ_ROSTER.roster, _today)
  .filter(Boolean);

const DJS = _activeRosterEntries.map(_toAppDJ);

const ALBUMS = _activeRosterEntries.flatMap(
  (dj) => (window.DJ_PLAYLISTS.pools[dj.id] && window.DJ_PLAYLISTS.pools[dj.id].pool) || []
);

console.log('[rotation] today =', _today, '→', DJS.map((d) => d.id).join(', '));

// ---- Public API (unchanged from previous data.js) ----

function getCurrentDJ() {
  return DJS[0];
}

function getDJByChannel(channel) {
  return DJS.find((dj) => dj.channel === channel) || null;
}

function getDJAlbums(djId) {
  return ALBUMS.filter((a) => a.djId === djId);
}

function buildQueue(djId) {
  return getDJAlbums(djId);
}

// ---- Radio Sync ----
// Uses real track durations to calculate what should be playing right now.
// All listeners hear the same track at the same point in time.

const RADIO_EPOCH = Date.UTC(2025, 0, 1); // Jan 1 2025 00:00 UTC
const TRACK_SLOT = 300000;   // 5 min fallback for individual tracks
const MIX_SLOT   = 2100000;  // 35 min fallback for mixes

function getTrackDuration(track) {
  const d = window.DJ_PLAYLISTS.trackDurations[track.id];
  if (d) return d;
  return track.mixDj ? MIX_SLOT : TRACK_SLOT;
}

function getRadioPosition(djId) {
  const tracks = getDJAlbums(djId);
  if (tracks.length === 0) return { index: 0, seekMs: 0 };

  let totalDuration = 0;
  for (const t of tracks) {
    totalDuration += getTrackDuration(t);
  }

  const offset = (window.DJ_PLAYLISTS.djPhaseOffset && window.DJ_PLAYLISTS.djPhaseOffset[djId]) || 0;
  const elapsed = ((Date.now() - RADIO_EPOCH - offset) % totalDuration + totalDuration) % totalDuration;

  let cumulative = 0;
  for (let i = 0; i < tracks.length; i++) {
    const slot = getTrackDuration(tracks[i]);
    if (cumulative + slot > elapsed) {
      return { index: i, seekMs: elapsed - cumulative };
    }
    cumulative += slot;
  }

  return { index: 0, seekMs: 0 };
}
```

Notes:
- `animSrc` is defined inline in `index.html` and is in scope by the time `js/data.js` runs — no need to redefine it.
- `_toAppDJ` adapts the *richer* roster shape (with nested `personality`, `sound`, `visual` from `dj-roster.json`) to the *flatter* shape that `app.js` expects. Fallback chain handles both shapes in case the migration left some entries in the old flat shape.
- `DJ_PHASE_OFFSET` falls back to `0` for new DJs (no offset spreading until added).

- [ ] **Step 2: Don't wire `index.html` yet. Continue to Task 5.**

---

## Task 5: Update `index.html` (script order + dynamic preload)

**Why:** Wire the two new data files BEFORE `js/data.js`, and replace the hardcoded animation preload (`stone-dj`, `guy-dj`, ...) with one that reads from `window.DJ_ROSTER`, so new DJ animations get preloaded automatically.

**Files:**
- Modify: `index.html` (around lines 247-275, the `<script>` block at the end of `<body>`)

- [ ] **Step 1: Read `index.html` lines 247-280 to confirm current structure**

The block goes: GSAP CDN → SoundCloud CDN → inline `<script>` (animSrc + preload) → `js/data.js` → `js/player.js` → `js/vinyl.js` → `js/app.js`.

- [ ] **Step 2: Replace the inline preload block + script tags**

Find this section (currently around lines 252-275):

```html
  <!-- App scripts -->
  <script>
    // Safari supports VP9 WebM but NOT with alpha channel — use HEVC .mov there
    var _v = document.createElement('video');
    var useHEVC = _v.canPlayType('video/quicktime; codecs="hvc1"') !== '' ||
                  (_v.canPlayType('video/mp4; codecs="hvc1"') !== '' &&
                   !(/Chrome|Firefox|OPR/i.test(navigator.userAgent)));
    function animSrc(basePath) {
      return basePath.replace(/\.webm$/, useHEVC ? '.mov' : '.webm');
    }
    console.log('[anim] format:', useHEVC ? '.mov (HEVC)' : '.webm (VP9)');

    // Preload all DJ animations during splash so they're cached when needed
    ['stone-dj', 'guy-dj', 'geisha-dj', 'chicken-dj', 'general-dj'].forEach(function (name) {
      var v = document.createElement('video');
      v.preload = 'auto';
      v.muted = true;
      v.src = animSrc('assets/animation/' + name + '.webm');
      v.load();
    });
  </script>
  <script src="js/data.js"></script>
  <script src="js/player.js"></script>
  <script src="js/vinyl.js"></script>
  <script src="js/app.js"></script>
```

Replace with:

```html
  <!-- App scripts -->
  <script>
    // Safari supports VP9 WebM but NOT with alpha channel — use HEVC .mov there
    var _v = document.createElement('video');
    var useHEVC = _v.canPlayType('video/quicktime; codecs="hvc1"') !== '' ||
                  (_v.canPlayType('video/mp4; codecs="hvc1"') !== '' &&
                   !(/Chrome|Firefox|OPR/i.test(navigator.userAgent)));
    function animSrc(basePath) {
      return basePath.replace(/\.webm$/, useHEVC ? '.mov' : '.webm');
    }
    console.log('[anim] format:', useHEVC ? '.mov (HEVC)' : '.webm (VP9)');
  </script>
  <script src="data/dj-roster.js"></script>
  <script src="data/dj-playlists.js"></script>
  <script>
    // Preload all unique DJ animations from the roster + the general fallback.
    (function preloadAnimations() {
      var paths = new Set();
      (window.DJ_ROSTER.roster || []).forEach(function (dj) {
        var p = (dj.visual && dj.visual.illustration) || dj.illustration;
        if (p) paths.add(p);
      });
      paths.add('assets/animation/general-dj.webm'); // fallback used by crossfadeIllustration
      paths.forEach(function (path) {
        var v = document.createElement('video');
        v.preload = 'auto';
        v.muted = true;
        v.src = animSrc(path);
        v.load();
      });
    })();
  </script>
  <script src="js/data.js"></script>
  <script src="js/player.js"></script>
  <script src="js/vinyl.js"></script>
  <script src="js/app.js"></script>
```

Key changes:
1. Roster + playlists `<script>` tags load BEFORE the preload (which needs `window.DJ_ROSTER`).
2. Preload loop reads paths from the roster instead of a hardcoded list.
3. `js/data.js` still loads last among data-related scripts (it needs both globals).

- [ ] **Step 3: Sanity check the file**

Run:
```bash
grep -nE "dj-roster\.js|dj-playlists\.js|preloadAnimations|js/data\.js" index.html
```
Expected: 4 matches in this order: `data/dj-roster.js` → `data/dj-playlists.js` → `preloadAnimations` → `js/data.js`.

- [ ] **Step 4: Commit the switch (Task 4 + Task 5 together)**

```bash
git add js/data.js index.html
git commit -m "Switch to daily DJ rotation from unified data sources

js/data.js becomes an adapter: reads window.DJ_ROSTER and
window.DJ_PLAYLISTS, picks 4 DJs per UTC day (one per channel) with a
date-seeded LCG, exposes the same DJS/ALBUMS/helpers app.js already
consumes. Track durations and phase offsets relocate to the playlists
module. index.html preloads animations dynamically from the roster
instead of a hardcoded name list."
```

---

## Task 6: Smoke test in the browser

**Why:** No automated tests exist; manual validation is the spec's contract.

**Files:** None to modify.

- [ ] **Step 1: Open `index.html` with a double click**

Expected: splash → app loads. No console errors in red. A `[rotation] today = 2026-05-11 → dj-X, dj-Y, dj-Z, dj-W` log appears.

- [ ] **Step 2: Verify 4 DJs, one per channel**

In DevTools console:
```js
DJS.map(d => ({ id: d.id, channel: d.channel }))
```
Expected: 4 entries, with `channel` values exactly `['focus', 'flow', 'move', 'intensity']` in that order.

- [ ] **Step 3: Verify determinism across reloads**

Reload the page. The same 4 DJs should appear (since the UTC date hasn't changed). If they differ, the rotation isn't deterministic — review `_seededIndex` and `_dateToSeed`.

- [ ] **Step 4: Verify date-driven change (optional)**

In console, force a different date:
```js
pickDailyDJs(window.DJ_ROSTER.roster, '2026-05-12').map(d => d.id)
```
Compare to today's selection. At least one DJ should differ on most adjacent dates (won't always — with 2 candidates per channel, ~50% chance per channel of staying). If ALL four are identical for many adjacent dates, the LCG might be too coarse — log it and continue, fix in a follow-up if needed.

- [ ] **Step 5: Play test for each active DJ**

For each of the 4 visible DJ buttons (one per channel):
1. Click to switch to that DJ.
2. Click play.
3. Confirm audio starts, the vinyl spins, the artwork shows with the right `coverColor`.
4. Click next a couple of times to confirm track advance works.

This catches regressions in track shape (missing `djId`, missing `coverColor`, missing `mixDj` on the mix entry).

- [ ] **Step 6: iOS/Safari sanity (if available)**

Open the page on iPhone/iPad Safari. Tap play — audio must start on first gesture (this is the fix from commits `23afe96`, `ee5ab70`). If it doesn't start, the gesture path is broken.

- [ ] **Step 7: No commit needed.** Move to Task 7 only after all steps pass.

---

## Task 7: Delete the obsolete JSON files

**Why:** They're migrated. Keeping them invites future confusion about which file is canonical.

**Files:**
- Delete: `data/dj-roster.json`, `data/dj-playlists.json`

- [ ] **Step 1: Confirm no code path reads the JSON files**

```bash
grep -rn "dj-roster\.json\|dj-playlists\.json" --include="*.html" --include="*.js" .
```
Expected: zero matches (the spec/plan docs may match — ignore those).

- [ ] **Step 2: Delete the files**

```bash
git rm data/dj-roster.json data/dj-playlists.json
```

- [ ] **Step 3: Final smoke test**

Reload the page in browser. App must still work identically. The deletion shouldn't change runtime behavior — these files were already unreferenced after Task 5.

- [ ] **Step 4: Commit cleanup**

```bash
git commit -m "Remove migrated JSON data files

data/dj-roster.js and data/dj-playlists.js are now the canonical sources.
The .json originals are no longer read by any code path."
```

---

## Self-Review Notes

- Spec covers all 7 sections of the design doc: arquitectura ✓ (Tasks 2-5), algoritmo de rotación ✓ (Task 4), migración ✓ (Tasks 1-3), errores ✓ (Task 4: fallbacks logged), validación ✓ (Task 6), riesgos abiertos ✓ (Task 5 covers splash; Task 4 covers null channel via filter+log).
- Types consistent: `_toAppDJ` produces the shape that `app.js:80` (`DJS.indexOf`) and `app.js:376-377` (`DJS[currentDJIndex].id`) need.
- No placeholders: every step has concrete content or a precise reference.
- Track durations and phase offsets keep working unchanged for legacy DJs; new DJs get fallback durations until a follow-up task populates them.

---

## Follow-ups (NOT in this plan)

- Curate Mara/Kei/Zola/Paloma pools up to 25 tracks each (separate plan; uses `_workspace/tests/check-availability.html` for geo-block verification).
- Populate `trackDurations` for Aida/Naina/Mariana/Tati via `_workspace/tests/verify-tracks.html`.
- Add per-DJ phase offsets for the 4 new DJs once their mix positions are decided.
- Playlist/tags algebra spec (deferred until DJ pools have meaningful sub-groupings).
