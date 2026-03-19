// ============================================
// Audio Engine — Dual-iframe with overlap crossfade
// + AudioContext keepalive to prevent background tab throttling
// ============================================

const Player = (() => {
  let widgetA = null;
  let widgetB = null;
  let activeSlot = 'A';

  let queue = [];
  let currentIndex = -1;
  let onTrackEnd = null;
  let muted = false;
  let volume = 100;
  let errorCount = 0;
  let advancing = false;

  // Timers
  let bgWorker = null;
  let trackStartTime = 0;
  let trackDuration = 0;

  // Fade
  let fadeTimer = null;

  // Pre-load state
  let preloadedIndex = -1;
  let crossfading = false;

  // Overlap: how many ms before track end to start the next one
  const OVERLAP_MS = 5000;

  // --- AudioContext keepalive ---
  // Plays a near-silent tone so the browser considers the tab "audible"
  // and does NOT throttle timers or block play() in background.
  let keepaliveCtx = null;
  function startKeepalive() {
    try {
      keepaliveCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = keepaliveCtx.createOscillator();
      const gain = keepaliveCtx.createGain();
      // Near-inaudible volume (0.01 ≈ −40 dB) — enough for Chrome to detect as "audible"
      gain.gain.value = 0.01;
      osc.frequency.value = 1; // 1 Hz — below human hearing
      osc.connect(gain);
      gain.connect(keepaliveCtx.destination);
      osc.start();
    } catch (e) {
      keepaliveCtx = null;
    }
  }

  function getActive() { return activeSlot === 'A' ? widgetA : widgetB; }
  function getPreload() { return activeSlot === 'A' ? widgetB : widgetA; }
  function swapSlots() { activeSlot = activeSlot === 'A' ? 'B' : 'A'; }

  function advance() {
    if (advancing) return;
    advancing = true;
    errorCount = 0;
    if (onTrackEnd) onTrackEnd();
    setTimeout(() => { advancing = false; }, 500);
  }

  // --- Worker (background-safe timer) ---
  function initWorker() {
    try {
      // Worker with both one-shot and recurring timer support
      const code = 'var t=null,r=null;self.onmessage=function(e){var d=e.data;if(d.cmd==="start"){if(t)clearTimeout(t);if(r)clearInterval(r);r=null;t=setTimeout(function(){t=null;self.postMessage("tick");r=setInterval(function(){self.postMessage("retry")},2000)},d.ms)}else if(d.cmd==="stop"){if(t)clearTimeout(t);t=null;if(r)clearInterval(r);r=null}};';
      bgWorker = new Worker(URL.createObjectURL(new Blob([code], { type: 'application/javascript' })));
      bgWorker.onmessage = function (e) {
        // Timer fired: either crossfade or advance
        // "retry" messages keep coming every 2s until we cancel (handles blocked play())
        startCrossfadeOrAdvance();
      };
    } catch (e) {
      bgWorker = null;
    }
  }

  function scheduleTimer() {
    if (!bgWorker || trackDuration <= 0) return;
    const elapsed = Date.now() - trackStartTime;
    // Schedule OVERLAP_MS before the track ends
    const remaining = trackDuration - elapsed - OVERLAP_MS;
    const delay = Math.max(remaining, 500);
    console.log('[Player] Timer scheduled — track dur:', Math.round(trackDuration/1000)+'s, crossfade in:', Math.round(delay/1000)+'s');
    bgWorker.postMessage({ cmd: 'start', ms: delay });
  }

  function cancelTimer() {
    if (bgWorker) bgWorker.postMessage({ cmd: 'stop' });
  }

  // Fade duration for track transitions (ms)
  const TRANSITION_FADE_MS = 2000;

  // Fade a specific widget from startVol → targetVol
  function fadeWidgetVol(w, startVol, targetVol, durationMs, cb) {
    const steps = 20;
    const stepMs = durationMs / steps;
    const delta = (targetVol - startVol) / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        clearInterval(timer);
        w.setVolume(targetVol);
        if (cb) cb();
      } else {
        w.setVolume(Math.round(startVol + delta * step));
      }
    }, stepMs);
  }

  // --- Track advance with fade out → load → fade in ---
  // Same widget, same logic — just wraps it with volume fades.
  function startCrossfadeOrAdvance() {
    if (crossfading) return;
    cancelTimer();

    const nextIdx = (currentIndex + 1) % queue.length;
    const nextAlbum = queue[nextIdx];
    if (!nextAlbum) { advance(); return; }

    crossfading = true;
    const w = getActive();
    const curVol = muted ? 0 : volume;

    console.log('[Player] Fading out → loading next track, bg:', document.hidden);

    // Step 1: Fade out current track
    fadeWidgetVol(w, curVol, 0, TRANSITION_FADE_MS, function () {
      // Step 2: Load next track on same widget
      w.load(nextAlbum.soundcloudUrl, {
        auto_play: true,
        show_artwork: false,
        show_comments: false,
        show_playcount: false,
        show_user: false,
        hide_related: true,
        visual: false,
        callback: function () {
          console.log('[Player] Next track loaded — fading in');
          w.setVolume(0);

          currentIndex = nextIdx;
          preloadedIndex = -1;

          // Step 3: Fade in new track
          fadeWidgetVol(w, 0, curVol, TRANSITION_FADE_MS, function () {
            crossfading = false;
          });

          // Get duration and schedule next timer
          w.getDuration(function (dur) {
            if (dur > 0) {
              trackDuration = dur;
              trackStartTime = Date.now();
              scheduleTimer();
            }
          });

          // Notify app.js to update UI
          advancing = true;
          if (onTrackEnd) onTrackEnd();
          setTimeout(() => { advancing = false; }, 500);
        },
      });

      // Fallback: if load never fires (blocked in background)
      setTimeout(() => {
        if (crossfading) {
          console.log('[Player] Load timeout — waiting for tab focus');
          crossfading = false;
          w.setVolume(curVol);
        }
      }, 8000);
    });
  }

  // --- Init ---
  let onResync = null;

  function init({ onTrackEnd: cb, onResync: resyncCb }) {
    onTrackEnd = cb || null;
    onResync = resyncCb || null;

    const iframeA = document.getElementById('sc-widget-a');
    const iframeB = document.getElementById('sc-widget-b');
    if (!iframeA || !iframeB) return;

    widgetA = SC.Widget(iframeA);
    widgetB = SC.Widget(iframeB);
    initWorker();
    startKeepalive();

    // FINISH event as fallback (in case crossfade didn't fire)
    [widgetA, widgetB].forEach(w => {
      w.bind(SC.Widget.Events.FINISH, () => {
        cancelTimer();
        if (!crossfading) advance();
      });
      w.bind(SC.Widget.Events.ERROR, () => {
        cancelTimer();
        errorCount++;
        if (errorCount > queue.length) return;
        advance();
      });
    });

    // When tab becomes visible again, ask app.js to resync using getRadioPosition.
    // This is the reliable fallback for background tab playback limitations.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;

      // Resume AudioContext if suspended
      if (keepaliveCtx && keepaliveCtx.state === 'suspended') {
        keepaliveCtx.resume().catch(() => {});
      }

      // Check if current track should have ended while tab was in background
      if (trackStartTime > 0 && trackDuration > 0) {
        const elapsed = Date.now() - trackStartTime;
        if (elapsed >= trackDuration) {
          // Track ended in background — let app.js resync everything
          if (onResync) onResync();
        }
      }
    });
  }

  function loadQueue(newQueue) {
    queue = newQueue;
    currentIndex = -1;
    errorCount = 0;
    preloadedIndex = -1;
  }

  function playIndex(idx, seekMs) {
    if (idx < 0 || idx >= queue.length) return;
    currentIndex = idx;
    errorCount = 0;
    cancelTimer();
    crossfading = false;
    preloadedIndex = -1;

    // Always do a full load for explicit playIndex calls (DJ switch, first load)
    loadOnActive(queue[idx], seekMs || 0);
  }

  function loadOnActive(album, seekMs) {
    if (!album) return;
    const w = getActive();
    trackStartTime = Date.now() - (seekMs || 0);
    trackDuration = 0;

    w.load(album.soundcloudUrl, {
      auto_play: true,
      show_artwork: false,
      show_comments: false,
      show_playcount: false,
      show_user: false,
      hide_related: true,
      visual: false,
      callback: function () {
        // Force play on mobile Safari/iOS where auto_play may be blocked
        if (window.innerWidth <= 912) w.play();
        w.setVolume(muted ? 0 : volume);

        if (seekMs > 0) {
          // SoundCloud Widget ignores seekTo if called before playback starts.
          // Wait for PLAY_PROGRESS to confirm audio is flowing, then seek.
          let seeked = false;
          function doSeek() {
            if (seeked) return;
            seeked = true;
            w.unbind(SC.Widget.Events.PLAY_PROGRESS, doSeek);
            w.seekTo(seekMs);
          }
          w.bind(SC.Widget.Events.PLAY_PROGRESS, doSeek);
          // Fallback if PLAY_PROGRESS never fires
          setTimeout(doSeek, 500);
        }

        w.getDuration(function (dur) {
          if (dur > 0) {
            trackDuration = dur;
            trackStartTime = Date.now() - (seekMs || 0);
            scheduleTimer();
          }
        });
      },
    });
  }

  function preloadNext() {
    if (queue.length < 2 || currentIndex < 0) return;
    const nextIdx = (currentIndex + 1) % queue.length;
    if (preloadedIndex === nextIdx) return;

    preloadedIndex = nextIdx;
    const w = getPreload();
    const album = queue[nextIdx];

    w.load(album.soundcloudUrl, {
      auto_play: false,
      show_artwork: false,
      show_comments: false,
      show_playcount: false,
      show_user: false,
      hide_related: true,
      visual: false,
      callback: function () {
        // Loaded — pause and mute so it's ready to play
        w.pause();
        w.setVolume(0);
      },
    });
  }

  // --- Volume / Fade ---
  function fadeVolume(targetVol, durationMs, cb) {
    if (fadeTimer) clearInterval(fadeTimer);
    const w = getActive();
    if (!w || muted) { if (cb) cb(); return; }
    const startVol = volume;
    const steps = 20;
    const stepMs = durationMs / steps;
    const delta = (targetVol - startVol) / steps;
    let step = 0;
    fadeTimer = setInterval(() => {
      step++;
      if (step >= steps) {
        clearInterval(fadeTimer);
        fadeTimer = null;
        w.setVolume(targetVol);
        if (cb) cb();
      } else {
        w.setVolume(Math.round(startVol + delta * step));
      }
    }, stepMs);
  }

  function fadeOut(durationMs, cb) { fadeVolume(0, durationMs || 400, cb); }
  function fadeIn(durationMs) {
    if (muted) return;
    const w = getActive();
    if (w) w.setVolume(0);
    fadeVolume(volume, durationMs || 600);
  }

  function toggleMute() {
    muted = !muted;
    const w = getActive();
    if (w) w.setVolume(muted ? 0 : volume);
    return muted;
  }

  function setVolume(val) {
    volume = Math.max(0, Math.min(100, val));
    const w = getActive();
    if (!w || muted) return;
    w.setVolume(volume);
  }

  function getVolume() { return volume; }
  function getCurrentItem() { return queue[currentIndex] || null; }

  function getPosition(cb) {
    const w = getActive();
    if (!w) return cb(0);
    w.getPosition(cb);
  }

  function seekTo(ms) {
    const w = getActive();
    if (!w) return;
    w.seekTo(ms);
    if (trackDuration > 0) {
      trackStartTime = Date.now() - ms;
      scheduleTimer();
    }
  }

  // Unlock audio on Safari/iOS — call during a direct user gesture (click/tap)
  function unlockAudio() {
    // Resume AudioContext if suspended
    if (keepaliveCtx && keepaliveCtx.state === 'suspended') {
      keepaliveCtx.resume().catch(() => {});
    }
    // Create and resume a temporary AudioContext to unlock Web Audio
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    } catch (e) {}
  }

  return { init, loadQueue, playIndex, toggleMute, setVolume, getVolume, getCurrentItem, getPosition, seekTo, fadeOut, fadeIn, unlockAudio };
})();
