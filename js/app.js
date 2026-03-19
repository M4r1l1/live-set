// ============================================
// App — Entry point & initialization
// ============================================

(function () {
  let currentDJ = null;
  let currentDJIndex = 0;
  let albums = [];
  let currentAlbumIdx = 0;
  let isTransitioning = false;


  function positionDjInfoArrow() {
    const nameEl = document.getElementById('footer-dj-name');
    const arrow = document.querySelector('.dj-info__arrow');
    if (!nameEl || !arrow) return;
    const nameRect = nameEl.getBoundingClientRect();
    const parentRect = nameEl.closest('.dj-info').getBoundingClientRect();
    arrow.style.left = (nameRect.left - parentRect.left + nameRect.width) + 'px';
  }

  const splash = document.getElementById('splash');
  const enterBtn = document.getElementById('enter-btn');
  const mainEl = document.getElementById('main');
  const dateEl = document.getElementById('current-date');
  const listenBtn = document.getElementById('listen-btn');
  const popSfx = new Audio('assets/effects/instrument.mp3');

  function boot() {
    setDate();
    enterBtn.addEventListener('click', enterSet);
    if (listenBtn) listenBtn.addEventListener('click', changeDJ);
    window.addEventListener('resize', positionDjInfoArrow);
  }

  function setDate() {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    if (dateEl) dateEl.textContent = `${months[now.getMonth()]} ${day}/${year}`;
  }

  function playPop() {
    popSfx.currentTime = 0;
    popSfx.play();
  }

  function enterSet() {
    playPop();
    // Unlock audio on Safari/iOS — must happen during direct user gesture
    if (typeof Player !== 'undefined' && Player.unlockAudio) Player.unlockAudio();
    if (typeof Vinyl !== 'undefined' && Vinyl.unlockAudio) Vinyl.unlockAudio();
    // Pre-start audio muted during user gesture so Safari allows playback
    Player.init({
      onTrackEnd: advanceToNextAlbum,
      onResync: syncToRadio,
    });
    const earlyDJ = getCurrentDJ();
    const earlyAlbums = getDJAlbums(earlyDJ.id);
    const earlyPos = getRadioPosition(earlyDJ.id);
    Player.loadQueue(earlyAlbums);
    Player.setVolume(0);
    Player.playIndex(earlyPos.index, earlyPos.seekMs);
    gsap.to(splash, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        splash.classList.add('hidden');
        mainEl.classList.add('visible');
        startLiveSet();
      },
    });
  }

  function startLiveSet() {
    Vinyl.init();
    const initialDJ = getCurrentDJ();
    currentDJIndex = DJS.indexOf(initialDJ);
    loadDJ(initialDJ, true);
    Vinyl.animateCables();
    Vinyl.initVolumeFader();
  }

  function loadDJ(dj, isFirstLoad) {
    currentDJ = dj;
    albums = getDJAlbums(dj.id);
    const radioPos = getRadioPosition(dj.id);
    currentAlbumIdx = radioPos.index;
    const seekMs = radioPos.seekMs;

    // DJ name + dynamic position
    const nameEl = document.getElementById('dj-name');
    if (nameEl) nameEl.textContent = dj.name;
    // Genres
    const genresEl = document.getElementById('dj-genres');
    if (genresEl) {
      genresEl.innerHTML = dj.genres
        .map((g) => `<span class="genre-area__tag">${g}</span>`)
        .join('');
    }

    // Footer
    const footerName = document.getElementById('footer-dj-name');
    if (footerName) footerName.textContent = dj.name;
    const footerGenre = document.getElementById('footer-dj-genre');
    if (footerGenre) footerGenre.textContent = dj.genres[0] || '';
    positionDjInfoArrow();

    // Illustration + break state for current track (no crossfade — DJ transition handles fade)
    const illustration = document.getElementById('dj-illustration');
    const currentTrack = albums[currentAlbumIdx];
    if (currentTrack && currentTrack.artist === dj.name) {
      // Current track is a mix — show break UI immediately
      inBreak = true;
      const mixDjName = currentTrack.mixDj || currentTrack.title;
      if (illustration) illustration.src = animSrc('assets/animation/asian-dj.webm');
      if (nameEl) nameEl.textContent = mixDjName;
      if (footerName) footerName.textContent = mixDjName;
      // Replace genre tags with break info
      if (genresEl) {
        genresEl.innerHTML =
          '<span class="genre-area__tag">Break of dj</span>' +
          '<span class="genre-area__tag">' + dj.name + '</span>';
      }
    } else {
      inBreak = false;
      if (illustration) illustration.src = dj.illustration;
    }

    // Set initial covers based on synced position
    // Cover = current track, Behind = previous track (the one that already played)
    // Stack = next two upcoming tracks
    if (albums.length > 0) {
      const prevIdx = (currentAlbumIdx - 1 + albums.length) % albums.length;
      const nextIdx = (currentAlbumIdx + 1) % albums.length;
      const nextNextIdx = (currentAlbumIdx + 2) % albums.length;
      Vinyl.setCover(albums[currentAlbumIdx], albums[prevIdx]);
      Vinyl.renderStack(albums[nextIdx], albums.length > 2 ? albums[nextNextIdx] : null);
    }

    if (isFirstLoad) {
      // First load — audio already started muted in enterSet()
      // Wait for cables to connect, then unmute
      window.addEventListener('cablesConnected', function onCables() {
        window.removeEventListener('cablesConnected', onCables);
        Player.setVolume(100);
        Vinyl.startSpin();
        if (currentTrack) Vinyl.setBPM(currentTrack.bpm);
      });
    } else {
      // Load queue for audio (subsequent DJ switches)
      Player.loadQueue(albums);
      // Subsequent loads — fade in after loading
      Player.playIndex(currentAlbumIdx, seekMs);
      Player.fadeIn(600);
      Vinyl.startSpin();
      if (currentTrack) Vinyl.setBPM(currentTrack.bpm);
    }
  }

  let inBreak = false; // track current break state to avoid re-triggering crossfade

  function crossfadeIllustration(newSrc) {
    const current = document.getElementById('dj-illustration');
    const ghost = document.getElementById('dj-illustration-ghost');
    if (!current || !ghost) return;

    // Pre-load new source in ghost (invisible)
    ghost.src = newSrc;
    ghost.style.pointerEvents = 'none';
    gsap.set(ghost, { opacity: 0 });

    let started = false;
    function doCrossfade() {
      if (started) return;
      started = true;

      ghost.play().catch(() => {});
      const tl = gsap.timeline();
      tl.to(ghost, { opacity: 1, duration: 0.6, ease: 'power2.inOut' });
      tl.to(current, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, '<');
      tl.call(() => {
        // Load new source into current while ghost covers it
        current.src = newSrc;
        let swapped = false;
        function onReady() {
          if (swapped) return;
          swapped = true;
          current.removeEventListener('canplay', onReady);
          current.play().catch(() => {});
          gsap.set(current, { opacity: 1 });
          gsap.set(ghost, { opacity: 0 });
          ghost.src = '';
        }
        current.addEventListener('canplay', onReady);
        current.load();
        // Fallback if canplay already fired or never fires
        setTimeout(onReady, 400);
      });
    }

    // Wait for ghost to be ready before crossfading
    ghost.addEventListener('canplay', function onGhostReady() {
      ghost.removeEventListener('canplay', onGhostReady);
      doCrossfade();
    });
    ghost.load();
    // Fallback if already cached
    setTimeout(() => {
      if (ghost.readyState >= 3) doCrossfade();
    }, 150);
  }

  function updateBreakUI(album) {
    const isMix = album.artist === currentDJ.name;
    const nameEl = document.getElementById('dj-name');
    const footerName = document.getElementById('footer-dj-name');
    const djNameArea = document.getElementById('dj-name-area');
    const genresEl = document.getElementById('dj-genres');
    const djInfoEl = document.querySelector('.dj-info');

    // Only animate transitions when break state actually changes
    const stateChanging = isMix !== inBreak;

    if (stateChanging) {
      // Fade out text elements, swap content at opacity 0, fade back in
      const tl = gsap.timeline();

      tl.to(djNameArea, { opacity: 0, x: -10, duration: 0.3, ease: 'power2.in' });
      tl.to('.genre-area', { opacity: 0, x: 10, duration: 0.3, ease: 'power2.in' }, '<');
      tl.to(djInfoEl, { opacity: 0, duration: 0.25 }, '<');

      tl.call(() => {
        // Swap content while invisible
        if (isMix) {
          const djName = album.mixDj || album.title;
          if (nameEl) nameEl.textContent = djName;
          if (footerName) footerName.textContent = djName;
          if (genresEl) {
            genresEl.innerHTML =
              '<span class="genre-area__tag">Break of dj</span>' +
              '<span class="genre-area__tag">' + currentDJ.name + '</span>';
          }
        } else {
          if (nameEl) nameEl.textContent = currentDJ.name;
          if (footerName) footerName.textContent = currentDJ.name;
          if (genresEl) {
            genresEl.innerHTML = currentDJ.genres
              .map((g) => '<span class="genre-area__tag">' + g + '</span>')
              .join('');
          }
        }
        gsap.set(djNameArea, { x: 0 });
        gsap.set('.genre-area', { x: 0 });
        positionDjInfoArrow();
      });

      // Fade back in
      tl.fromTo(djNameArea, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
      tl.fromTo('.genre-area', { opacity: 0, x: 8 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, '<');
      tl.to(djInfoEl, { opacity: 1, duration: 0.3 }, '<');

      tl.call(() => {
        gsap.set(djNameArea, { clearProps: 'opacity,x' });
        gsap.set(djInfoEl, { clearProps: 'opacity' });
      });

      // Crossfade illustration
      if (isMix) {
        crossfadeIllustration(animSrc('assets/animation/asian-dj.webm'));
        inBreak = true;
      } else {
        crossfadeIllustration(currentDJ.illustration);
        inBreak = false;
      }
    } else if (isMix) {
      // Already in break — just update the name for the new mix DJ (no animation)
      const djName = album.mixDj || album.title;
      if (nameEl) nameEl.textContent = djName;
      if (footerName) footerName.textContent = djName;
    }
  }

  // Called by Player when the tab becomes visible and the track should have ended.
  // Recalculates the correct position using the same deterministic radio sync.
  function syncToRadio() {
    if (!currentDJ || albums.length === 0) return;

    const radioPos = getRadioPosition(currentDJ.id);
    const newIdx = radioPos.index;
    const seekMs = radioPos.seekMs;

    // Same track — just seek, no visual changes
    if (newIdx === currentAlbumIdx) {
      Player.playIndex(currentAlbumIdx, seekMs);
      return;
    }

    // Track changed — animate the drop like a normal advance
    const prevIdx = currentAlbumIdx;
    currentAlbumIdx = newIdx;

    const newAlbum = albums[currentAlbumIdx];
    const prevAlbum = albums[prevIdx];
    const nextIdx = (currentAlbumIdx + 1) % albums.length;
    const nextNextIdx = (currentAlbumIdx + 2) % albums.length;

    // Update break UI (mix vs individual track)
    updateBreakUI(newAlbum);

    // Update BPM
    Vinyl.setBPM(newAlbum.bpm);

    // Drop animation
    if (!Vinyl.isAnimating()) {
      Vinyl.dropAlbum(
        newAlbum,
        albums[nextIdx],
        prevAlbum,
        albums[nextNextIdx],
        () => {
          Vinyl.renderStack(albums[nextIdx], albums[nextNextIdx]);
        }
      );
    }

    // Play correct track at correct position
    Player.playIndex(currentAlbumIdx, seekMs);
  }

  // Called by Player when a track ends (or crossfades into the next).
  // Player already handles the audio — this only updates the UI.
  function advanceToNextAlbum() {
    if (albums.length === 0) return;

    const prevIdx = currentAlbumIdx;
    currentAlbumIdx = (currentAlbumIdx + 1) % albums.length;

    const newAlbum = albums[currentAlbumIdx];
    const prevAlbum = albums[prevIdx];
    const nextIdx = (currentAlbumIdx + 1) % albums.length;
    const nextNextIdx = (currentAlbumIdx + 2) % albums.length;

    // Update break UI (mix vs individual track)
    updateBreakUI(newAlbum);

    // Update bounce tempo
    Vinyl.setBPM(newAlbum.bpm);

    // Animate only if not already animating (skip animation in background)
    if (!Vinyl.isAnimating()) {
      Vinyl.dropAlbum(
        newAlbum,
        albums[nextIdx],
        prevAlbum,
        albums[nextNextIdx],
        () => {
          Vinyl.renderStack(albums[nextIdx], albums[nextNextIdx]);
        }
      );
    }
  }

  function changeDJ() {
    if (isTransitioning) return;
    if (Vinyl.isAnimating()) return;
    isTransitioning = true;
    playPop();

    // Fade out current audio before switching
    Player.fadeOut(400);

    // Cycle to next DJ
    currentDJIndex = (currentDJIndex + 1) % DJS.length;
    const nextDJ = DJS[currentDJIndex];

    Vinyl.transitionDJ(nextDJ, () => {
      loadDJ(nextDJ, false);
    }, () => {
      isTransitioning = false;
    });
  }

  // DEBUG: Temporary controls
  function initDebugControls() {
    const muteBtn = document.getElementById('debug-mute');
    const nextBtn = document.getElementById('debug-next');

    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const disc = Vinyl.isDisconnected();
        if (disc) {
          Vinyl.toggleCable(disc);
        } else {
          Vinyl.toggleCable('right');
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        advanceToNextAlbum();
      });
    }
  }

  // Effect button — vinyl brake on hold
  function initEffectButton() {
    const effectEl = document.getElementById('effect');
    if (!effectEl) return;

    effectEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      Vinyl.vinylBrake();
    });
    effectEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      Vinyl.vinylBrake();
    }, { passive: false });

    document.addEventListener('mouseup', () => {
      Vinyl.vinylRelease();
    });
    document.addEventListener('touchend', () => {
      Vinyl.vinylRelease();
    });
  }


  document.addEventListener('DOMContentLoaded', () => {
    boot();
    initDebugControls();
    initEffectButton();
  });
})();
