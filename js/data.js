// ============================================
// Data Adapter — Daily DJ Rotation + Radio Sync
// Consumes window.DJ_ROSTER and window.DJ_PLAYLISTS (loaded before this file).
// Exposes: DJS (4 DJs of the day), TRACKS (their flattened pools), helpers, radio sync.
// ============================================

// ---- Rotation ----
// Daily DJ rotation: seed a PRNG from the UTC date and draw one DJ per channel.
// djb2(date) → mulberry32 stream → 4 independent picks. This gives uniform
// distribution over the 2^4 = 16 possible day-tuples and ensures adjacent
// dates produce different rotations (a simpler LCG seed had a 12-day "stickiness").

function _djb2(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

function _mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function _groupByChannel(roster) {
  const byChannel = { focus: [], flow: [], move: [], intensity: [] };
  for (const dj of roster) {
    if (byChannel[dj.channel]) byChannel[dj.channel].push(dj);
  }
  return byChannel;
}

function pickDailyDJs(roster, dateStr) {
  const rng = _mulberry32(_djb2(dateStr));
  const byChannel = _groupByChannel(roster);
  const channels = ['focus', 'flow', 'move', 'intensity'];

  return channels.map((channel) => {
    const candidates = byChannel[channel];
    if (!candidates || candidates.length === 0) {
      console.warn('[rotation] no DJs for channel', channel);
      rng(); // advance regardless so later channels keep their stream position
      return null;
    }
    return candidates[Math.floor(rng() * candidates.length)];
  });
}

// ---- Adapt roster entry -> DJ shape that app.js expects ----
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

// ---- Build DJS + TRACKS for today ----

const _today = new Date().toISOString().slice(0, 10); // UTC date
const _activeRosterEntries = pickDailyDJs(window.DJ_ROSTER.roster, _today)
  .filter(Boolean);

const DJS = _activeRosterEntries.map(_toAppDJ);

const TRACKS = _activeRosterEntries.flatMap(
  (dj) => (window.DJ_PLAYLISTS.pools[dj.id] && window.DJ_PLAYLISTS.pools[dj.id].pool) || []
);

// Backward-compat alias. Older code paths referenced ALBUMS; new code should use TRACKS.
const ALBUMS = TRACKS;

console.log('[rotation] today =', _today, '->', DJS.map((d) => d.id).join(', '));

// ---- Public API (unchanged shape from previous js/data.js) ----

function getCurrentDJ() {
  return DJS[0];
}

function getDJByChannel(channel) {
  return DJS.find((dj) => dj.channel === channel) || null;
}

function getDJAlbums(djId) {
  return TRACKS.filter((a) => a.djId === djId);
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
