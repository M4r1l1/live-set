// ============================================
// Vinyl Animation System — Spin + Drop (GSAP)
// ============================================

const Vinyl = (() => {
  let vinylEl = null;
  let coverEl = null;
  let behindEl = null;
  let stackEl = null;
  let djZoneEl = null;
  let livesetEl = null;
  let bounceTween = null;
  let currentBPM = 0;
  let stoppedRotation = 0; // angle where LP stopped after deceleration
  let spinTween = null;    // continuous GSAP spin (replaces CSS animation)
  let isDropping = false;  // guard against concurrent drops
  let isBraking = false;   // needle skip effect active

  function init() {
    vinylEl = document.getElementById('vinyl');
    coverEl = document.getElementById('album-cover');
    behindEl = document.getElementById('album-behind');
    stackEl = document.getElementById('album-stack');
    djZoneEl = document.getElementById('dj-zone');
    livesetEl = document.querySelector('.logo__liveset');
  }

  function setBPM(bpm) {
    if (bpm === currentBPM) return;
    currentBPM = bpm;

    if (bounceTween) {
      bounceTween.kill();
      if (livesetEl) gsap.set(livesetEl, { y: 0 });
    }

    if (bpm <= 0) return;

    const beatDur = 60 / bpm;

    // live_set bounce
    bounceTween = gsap.timeline({ repeat: -1 });
    bounceTween.to(livesetEl, {
      y: 6,
      duration: beatDur * 0.15,
      ease: 'power2.in',
    });
    bounceTween.to(livesetEl, {
      y: 0,
      duration: beatDur * 0.35,
      ease: 'power2.out',
    });
    bounceTween.to(livesetEl, {
      y: 0,
      duration: beatDur * 0.5,
    });

  }

  function stopBounce() {
    if (bounceTween) {
      bounceTween.kill();
      bounceTween = null;
    }
    currentBPM = 0;
    if (livesetEl) gsap.set(livesetEl, { y: 0 });
  }

  function startSpin() {
    if (!vinylEl) return;
    const img = vinylEl.querySelector('.playback-zone__vinyl-img');
    if (!img) return;

    // Spin speed: 360° in 2s = 180°/s
    // Accelerate gently over 1.2s covering 108° (avg speed 90°/s → ends at ~180°/s)
    const startAngle = stoppedRotation;
    const accelDeg = 108;
    const accelDur = 1.2;

    gsap.fromTo(img,
      { rotation: startAngle },
      {
        rotation: startAngle + accelDeg,
        duration: accelDur,
        ease: 'power2.in',
        onComplete: () => {
          const current = startAngle + accelDeg;
          spinTween = gsap.to(img, {
            rotation: current + 360,
            duration: 2,
            ease: 'none',
            repeat: -1,
          });
        },
      }
    );
  }

  function stopSpin() {
    if (spinTween) {
      spinTween.kill();
      spinTween = null;
    }
  }

  // Needle skip / stutter — seeks back every ~300ms creating a stuck record effect
  var stutterInterval = null;
  var stutterSeekPos = 0;

  function vinylBrake() {
    if (isBraking) return;
    isBraking = true;

    var img = vinylEl ? vinylEl.querySelector('.playback-zone__vinyl-img') : null;

    // Capture the position where the needle "stuck"
    Player.getPosition(function (pos) {
      stutterSeekPos = Math.max(0, pos);

      // Start the stutter loop — jump back to the stuck point every 300ms
      stutterInterval = setInterval(function () {
        Player.seekTo(stutterSeekPos);

        // Visual jolt — quick rotation shake on the LP
        if (img) {
          var cur = gsap.getProperty(img, 'rotation') || 0;
          gsap.to(img, {
            rotation: cur - 3,
            duration: 0.05,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
          });
        }
      }, 300);
    });

    // Visual feedback on the knob
    var effectEl = document.getElementById('effect');
    if (effectEl) effectEl.classList.add('effect--active');
  }

  // Release — stop stuttering, resume normal playback
  function vinylRelease() {
    if (!isBraking) return;
    isBraking = false;

    if (stutterInterval) {
      clearInterval(stutterInterval);
      stutterInterval = null;
    }

    // Remove visual feedback
    var effectEl = document.getElementById('effect');
    if (effectEl) effectEl.classList.remove('effect--active');
  }

  function toggleBrake() {
    if (isBraking) {
      vinylRelease();
    } else {
      vinylBrake();
    }
  }

  // Apply cover image + color to an element
  function applyCover(el, album) {
    if (!el || !album) return;
    el.style.backgroundColor = album.coverColor;
    var imgUrl = album.artworkUrl || album.coverImage;
    if (imgUrl) {
      el.style.backgroundImage = 'url(' + imgUrl + ')';
      el.style.backgroundSize = 'cover';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
    } else {
      el.style.backgroundImage = '';
    }
    if (el.href !== undefined) el.href = album.soundcloudUrl || '#';
  }

  // Render album stack — card2 (front, closer to cover) = next up, card1 (back) = after that
  function renderStack(nextAlbum, nextNextAlbum) {
    if (!stackEl) return;
    const card1 = document.getElementById('stack-card-1');
    const card2 = document.getElementById('stack-card-2');

    if (nextAlbum) {
      applyCover(card2, nextAlbum);
      card2.style.display = '';
    } else {
      card2.style.display = 'none';
    }

    if (nextNextAlbum) {
      applyCover(card1, nextNextAlbum);
      card1.style.display = '';
    } else {
      card1.style.display = 'none';
    }
  }

  // Set current + behind cover
  function setCover(album, nextAlbum) {
    applyCover(coverEl, album);
    applyCover(behindEl, nextAlbum);
  }

  // Drop animation — cover slides to behind, stack card falls to cover position
  function dropAlbum(album, nextAlbum, prevAlbum, nextNextAlbum, onComplete) {
    // Block concurrent drops — let current animation finish first
    if (isDropping) return;

    isDropping = true;

    const vinylImg = vinylEl ? vinylEl.querySelector('.playback-zone__vinyl-img') : null;
    const stackCard1 = document.getElementById('stack-card-1');
    const stackCard2 = document.getElementById('stack-card-2');
    const mainEl = document.getElementById('main');

    // Capture current GSAP rotation before stopping spin
    let currentRotation = 0;
    if (vinylImg) {
      currentRotation = gsap.getProperty(vinylImg, 'rotation') || 0;
    }

    // Get screen positions before moving anything
    const mainRect = mainEl.getBoundingClientRect();
    const card2Rect = stackCard2.getBoundingClientRect();
    const card1Rect = stackCard1.getBoundingClientRect();
    const coverRect = coverEl.getBoundingClientRect();

    // Start position of card2 (the one that falls)
    const startX = card2Rect.left - mainRect.left;
    const startY = card2Rect.top - mainRect.top;

    // End position (cover)
    const endX = coverRect.left - mainRect.left;
    const endY = coverRect.top - mainRect.top;

    // Card1 needs to slide to where card2 was
    const card1DeltaX = card2Rect.left - card1Rect.left;
    const card1DeltaY = card2Rect.top - card1Rect.top;

    // Reparent card2 to .main so it can fall without clipping
    const origParent = stackCard2.parentElement;
    mainEl.appendChild(stackCard2);
    gsap.set(stackCard2, {
      position: 'absolute',
      left: startX,
      top: startY,
      right: 'auto',
      width: card2Rect.width,
      height: card2Rect.height,
      rotation: 90,
      zIndex: 15,
    });

    // Stop spin tween, take over with GSAP from current angle
    stopSpin();
    gsap.killTweensOf(vinylImg);
    if (vinylImg) {
      gsap.set(vinylImg, { rotation: currentRotation });
    }

    // Disable CSS transitions on cover so GSAP controls everything
    coverEl.style.transition = 'none';

    const tl = gsap.timeline({
      onComplete: () => {
        // 1. Transfer appearance to the real cover
        applyCover(coverEl, album);
        gsap.set(coverEl, { clearProps: 'transform,opacity,zIndex' });
        coverEl.style.transition = '';
        gsap.set(coverEl, { opacity: 1 });

        // 2. Update behind with the previous album
        applyCover(behindEl, prevAlbum);
        gsap.set(behindEl, { clearProps: 'transform,opacity' });

        // 3. Return card2 to stack
        origParent.appendChild(stackCard2);

        // 4. Apply new stack images FIRST (before resetting positions)
        if (onComplete) onComplete();

        // 5. Reset card2 position props (keep background from renderStack)
        stackCard2.style.position = '';
        stackCard2.style.left = '';
        stackCard2.style.top = '';
        stackCard2.style.right = '';
        stackCard2.style.width = '';
        stackCard2.style.height = '';
        stackCard2.style.zIndex = '';
        gsap.set(stackCard2, { clearProps: 'transform' });

        // 6. Reset card1 slide offset (keep background from renderStack)
        gsap.set(stackCard1, { clearProps: 'transform' });

        if (vinylImg) gsap.set(vinylImg, { clearProps: 'all' });

        isDropping = false;
        startSpin();
      },
    });

    // 1. LP decelerates to stop — save final angle
    const finalRotation = currentRotation + 90;
    if (vinylImg) {
      tl.to(vinylImg, {
        rotation: finalRotation,
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => { stoppedRotation = finalRotation; },
      });
    }

    // 2. Current cover slides UP to behind position (top:90 → top:0, adds rotation)
    //    and behind fades out to make room
    tl.to(behindEl, {
      opacity: 0,
      duration: 0.2,
      ease: 'power1.in',
    }, vinylImg ? '-=0.4' : '+=0');

    tl.to(coverEl, {
      y: -90,
      rotation: 3.12,
      zIndex: 0,
      duration: 0.35,
      ease: 'power2.inOut',
    }, '<');

    // 3. Once cover reached behind position, swap: put image on behind, hide cover
    tl.call(() => {
      applyCover(behindEl, prevAlbum);
      gsap.set(behindEl, { opacity: 1 });
      gsap.set(coverEl, { opacity: 0 });
    });

    // 4. Card2 falls from stack to cover position (gravity)
    const fallLabel = 'fall';
    tl.addLabel(fallLabel);

    tl.to(stackCard2, {
      left: endX,
      top: endY,
      width: coverRect.width,
      height: coverRect.height,
      duration: 0.7,
      ease: 'power3.in',
    }, fallLabel);

    // 5. Rotation from 90° to 0° — faster than the fall
    tl.to(stackCard2, {
      rotation: 0,
      duration: 0.45,
      ease: 'power2.in',
    }, fallLabel);

    // 6. Card1 slides forward to card2's old position
    tl.to(stackCard1, {
      x: card1DeltaX,
      y: card1DeltaY,
      duration: 0.5,
      ease: 'power2.out',
    }, fallLabel);

    // 7. Bounce settle — disc lands and wobbles into place
    tl.to(stackCard2, {
      rotation: 4,
      y: '-=5',
      duration: 0.12,
      ease: 'power1.out',
    });
    tl.to(stackCard2, {
      rotation: -2,
      y: '+=7',
      duration: 0.1,
      ease: 'power1.in',
    });
    tl.to(stackCard2, {
      rotation: 0,
      y: '-=2',
      duration: 0.1,
      ease: 'power1.out',
    });
  }

  // DJ transition — full crossfade (LP, illustration-set & change btn stay fixed)
  // onSwap runs at opacity 0 (to swap data), onComplete runs when fade-in finishes
  function transitionDJ(newDJ, onSwap, onComplete) {
    const djNameArea = document.querySelector('.dj-name-area');
    const djInfoEl = document.querySelector('.dj-info');

    const tl = gsap.timeline({ onComplete });

    // Fade out (LP, illustration-set and change button stay visible)
    tl.to(djZoneEl, { opacity: 0, duration: 0.4, ease: 'power2.in' });
    tl.to(djNameArea, { opacity: 0, x: -20, duration: 0.35 }, '<');
    tl.to('.genre-area', { opacity: 0, x: 20, duration: 0.35 }, '<');
    tl.to(behindEl, { opacity: 0, scale: 0.85, duration: 0.35 }, '<');
    tl.to(coverEl, { opacity: 0, scale: 0.85, duration: 0.35 }, '<0.05');
    tl.to(stackEl, { opacity: 0, y: -15, duration: 0.3 }, '<');
    tl.to(djInfoEl, { opacity: 0, duration: 0.3 }, '<');

    // Swap data while everything is invisible
    tl.call(() => {
      if (onSwap) onSwap();
      gsap.set(djNameArea, { x: 0 });
      gsap.set('.genre-area', { x: 0 });
      gsap.set(stackEl, { y: 0 });
    });

    // Fade in with subtle entrance
    tl.to(djZoneEl, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    tl.fromTo(djNameArea, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, '<0.1');
    tl.fromTo('.genre-area', { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, '<');
    tl.fromTo(behindEl, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.1)' }, '<');
    tl.fromTo(coverEl, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' }, '<0.05');
    tl.fromTo(stackEl, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '<');
    tl.to(djInfoEl, { opacity: 1, duration: 0.4 }, '<');

    // Clear inline styles so CSS :hover transitions work again
    tl.call(() => {
      gsap.set(coverEl, { clearProps: 'transform,opacity,scale' });
      gsap.set(behindEl, { clearProps: 'transform,opacity,scale' });
      gsap.set(djZoneEl, { clearProps: 'opacity' });
      gsap.set(djNameArea, { clearProps: 'opacity,x' });
      gsap.set(djInfoEl, { clearProps: 'opacity' });
      gsap.set(stackEl, { clearProps: 'opacity,y' });
      coverEl.style.transition = '';
      behindEl.style.transition = '';
    });
  }

  // ---- Cable system — positions computed from DOM ----

  var cableState = { connected: false };
  var connectedPoints = null; // frozen plug positions after connection
  var plugSfx1 = new Audio('assets/effects/plug-sfx-1.mp3');
  var plugSfx2 = new Audio('assets/effects/plug-sfx-2.mp3');

  // Disconnected tip offset for right cable (mobile / tablet / desktop)
  function rightTipOffset() {
    if (window.innerWidth <= 430) return { dx: 20, dy: -50 };
    if (window.innerWidth <= 768) return { dx: 20, dy: -50 };
    return { dx: -70, dy: 40 };
  }

  // Get element center/edge position relative to .main
  function elPos(el, anchorX, anchorY) {
    var mainRect = document.getElementById('main').getBoundingClientRect();
    var r = el.getBoundingClientRect();
    return {
      x: r.left - mainRect.left + r.width * anchorX,
      y: r.top - mainRect.top + r.height * anchorY,
    };
  }

  function getCablePoints() {
    // Once connected, return frozen positions (cover moves during drop animation)
    if (cableState.connected && connectedPoints) {
      return connectedPoints;
    }

    var providerEl = document.querySelector('.provider-logo');
    var djEl = document.getElementById('dj-zone');
    var albumEl = document.getElementById('album-cover');

    // Provider: below-center of logo
    var provider = elPos(providerEl, 0.5, 1.3);
    // DJ left
    var djL = elPos(djEl, 0.3, 0.73);
    // DJ right
    var djR = elPos(djEl, 0.75, 0.76);
    // Album
    var isMobile = window.innerWidth <= 576;
    var isTablet = window.innerWidth <= 768;
    var alb = isMobile ? elPos(albumEl, 0.75, 0.07) : isTablet ? elPos(albumEl, 0.20, 0.07) : elPos(albumEl, 0.07, 0.25);

    return { provider: provider, djL: djL, djR: djR, alb: alb };
  }

  // Original SVG path data from Figma exports
  // Left cable: viewBox 0 0 365 514, start (18.25, 0.2), end (363.75, 420.7)
  // Right cable: viewBox 0 0 177 31, start (0.61, 13), end (176.61, 3.5)

  // Parse: transform original SVG coordinates to screen positions
  function buildLeftPath(startX, startY, endX, endY, connSx, connSy, connEx, connEy) {
    // Original SVG bounds
    var osx = 18.25, osy = 0.2, oex = 363.75, oey = 420.7;
    // Scale from original to connected positions
    var scaleX = (connEx - connSx) / (oex - osx);
    var scaleY = (connEy - connSy) / (oey - osy);
    var offX = connSx - osx * scaleX;
    var offY = connSy - osy * scaleY;

    function tx(x) { return offX + x * scaleX; }
    function ty(y) { return offY + y * scaleY; }

    // Original path control points (from SVG)
    // M 18.25,0.2
    // C 9.58,65.2  -0.05,225.2  34.75,277.2
    // C 78.25,342.2  171.25,228.7  94.25,200.7
    // C 17.25,172.7  -22.75,298.2  17.25,382.2
    // C 57.25,466.2  106.25,471.7  116.75,448.7
    // C 127.25,425.7  104.25,407.4  78.25,417.2
    // C 46.44,429.2  60.75,532.7  181.25,508.2
    // C 277.65,488.6  346.25,437.7  363.75,420.7

    return 'M ' + startX + ',' + startY +
      ' C ' + tx(9.58) + ',' + ty(65.2) +
        ' ' + tx(-0.05) + ',' + ty(225.2) +
        ' ' + tx(34.75) + ',' + ty(277.2) +
      ' C ' + tx(78.25) + ',' + ty(342.2) +
        ' ' + tx(171.25) + ',' + ty(228.7) +
        ' ' + tx(94.25) + ',' + ty(200.7) +
      ' C ' + tx(17.25) + ',' + ty(172.7) +
        ' ' + tx(-22.75) + ',' + ty(298.2) +
        ' ' + tx(17.25) + ',' + ty(382.2) +
      ' C ' + tx(57.25) + ',' + ty(466.2) +
        ' ' + tx(106.25) + ',' + ty(471.7) +
        ' ' + tx(116.75) + ',' + ty(448.7) +
      ' C ' + tx(127.25) + ',' + ty(425.7) +
        ' ' + tx(104.25) + ',' + ty(407.4) +
        ' ' + tx(78.25) + ',' + ty(417.2) +
      ' C ' + tx(46.44) + ',' + ty(429.2) +
        ' ' + tx(60.75) + ',' + ty(532.7) +
        ' ' + tx(181.25) + ',' + ty(508.2) +
      ' C ' + tx(277.65) + ',' + ty(488.6) +
        ' ' + tx(346.25) + ',' + ty(437.7) +
        ' ' + endX + ',' + endY;
  }

  function buildRightPath(startX, startY, endX, endY, connSx, connSy, connEx, connEy) {
    // Original SVG: viewBox 0 0 177 31, start (0.61, 13), end (176.61, 3.5)
    // Use uniform scale based on horizontal distance to keep proportions
    var osx = 0.61, osy = 13, oex = 176.61, oey = 3.5;
    var scale = (connEx - connSx) / (oex - osx);
    var offX = connSx - osx * scale;
    // Center vertically between start and end
    var midConnY = (connSy + connEy) / 2;
    var midOrigY = (osy + oey) / 2;
    var offY = midConnY - midOrigY * scale;

    function tx(x) { return offX + x * scale; }
    function ty(y) { return offY + y * scale; }

    // Original path: M 0.61,13 C 105.11,59.5  51.11,-11  176.61,3.5
    return 'M ' + startX + ',' + startY +
      ' C ' + tx(105.11) + ',' + ty(59.5) +
        ' ' + tx(51.11) + ',' + ty(-11) +
        ' ' + endX + ',' + endY;
  }

  function updateCables() {
    var cableLeft = document.getElementById('cable-left');
    var cableRight = document.getElementById('cable-right');
    var plugProvider = document.getElementById('plug-provider');
    var plugDJL = document.getElementById('plug-dj-left');
    var plugDJR = document.getElementById('plug-dj-right');
    var plugAlb = document.getElementById('plug-album');

    if (!cableLeft || !cableRight) return;

    var pts = getCablePoints();

    // Update plug positions
    plugProvider.setAttribute('cx', pts.provider.x);
    plugProvider.setAttribute('cy', pts.provider.y);
    plugDJL.setAttribute('cx', pts.djL.x);
    plugDJL.setAttribute('cy', pts.djL.y);
    plugDJR.setAttribute('cx', pts.djR.x);
    plugDJR.setAttribute('cy', pts.djR.y);
    plugAlb.setAttribute('cx', pts.alb.x);
    plugAlb.setAttribute('cy', pts.alb.y);

    // Update cable paths
    if (cableState.connected) {
      var ld = buildLeftPath(pts.provider.x, pts.provider.y, pts.djL.x, pts.djL.y, pts.provider.x, pts.provider.y, pts.djL.x, pts.djL.y);
      var rd = buildRightPath(pts.djR.x, pts.djR.y, pts.alb.x, pts.alb.y, pts.djR.x, pts.djR.y, pts.alb.x, pts.alb.y);
      cableLeft.setAttribute('d', ld);
      cableRight.setAttribute('d', rd);
      var hitL = document.getElementById('cable-left-hit');
      var hitR = document.getElementById('cable-right-hit');
      if (hitL) hitL.setAttribute('d', ld);
      if (hitR) hitR.setAttribute('d', rd);
    }
  }

  function animateCables() {
    var cableLeft = document.getElementById('cable-left');
    var cableRight = document.getElementById('cable-right');

    if (!cableLeft || !cableRight) return;

    cableState.connected = false;

    var pts = getCablePoints();

    // Position plugs only (not cables — we set those to disconnected below)
    var plugProvider = document.getElementById('plug-provider');
    var plugDJL = document.getElementById('plug-dj-left');
    var plugDJR = document.getElementById('plug-dj-right');
    var plugAlb = document.getElementById('plug-album');
    plugProvider.setAttribute('cx', pts.provider.x);
    plugProvider.setAttribute('cy', pts.provider.y);
    plugDJL.setAttribute('cx', pts.djL.x);
    plugDJL.setAttribute('cy', pts.djL.y);
    plugDJR.setAttribute('cx', pts.djR.x);
    plugDJR.setAttribute('cy', pts.djR.y);
    plugAlb.setAttribute('cx', pts.alb.x);
    plugAlb.setAttribute('cy', pts.alb.y);

    // Disconnected: some endpoints start already connected (0,0 offset)
    var lp = {
      sx: pts.provider.x, sy: pts.provider.y,           // already connected
      ex: pts.djL.x - 40, ey: pts.djL.y + 120,
    };
    var rOff = rightTipOffset();
    var rp = {
      sx: pts.djR.x, sy: pts.djR.y,            // already connected
      ex: pts.alb.x + rOff.dx, ey: pts.alb.y + rOff.dy,
    };

    // Connected positions (shape reference)
    var csx = pts.provider.x, csy = pts.provider.y, cex = pts.djL.x, cey = pts.djL.y;
    var crsx = pts.djR.x, crsy = pts.djR.y, crex = pts.alb.x, crey = pts.alb.y;

    // Set initial disconnected state
    cableLeft.setAttribute('d', buildLeftPath(lp.sx, lp.sy, lp.ex, lp.ey, csx, csy, cex, cey));
    cableRight.setAttribute('d', buildRightPath(rp.sx, rp.sy, rp.ex, rp.ey, crsx, crsy, crex, crey));

    var tl = gsap.timeline({ delay: 0.5 });

    // 1. Left cable — DJ tip connects (SSM already connected)
    tl.to(lp, {
      ex: pts.djL.x, ey: pts.djL.y,
      duration: 0.8,
      ease: 'power2.in',
      onUpdate: function () {
        cableLeft.setAttribute('d', buildLeftPath(lp.sx, lp.sy, lp.ex, lp.ey, csx, csy, cex, cey));
      },
      onComplete: function () {
        plugSfx1.currentTime = 0;
        plugSfx1.play();
      },
    });

    // 2. Right cable — Album tip connects (DJ already connected)
    tl.to(rp, {
      ex: pts.alb.x, ey: pts.alb.y,
      duration: 0.8,
      ease: 'power2.in',
      onUpdate: function () {
        cableRight.setAttribute('d', buildRightPath(rp.sx, rp.sy, rp.ex, rp.ey, crsx, crsy, crex, crey));
      },
      onComplete: function () {
        plugSfx2.currentTime = 0;
        plugSfx2.play();
      },
    });

    // 5. Cables connected — freeze positions and start music/LP
    tl.call(function () {
      cableState.connected = true;
      connectedPoints = getCablePoints();
      updateCables(); // redraw with correct positions so physics loop doesn't cause a jump
      window.addEventListener('resize', function () {
        // Recalculate frozen positions on resize (cover is static then)
        connectedPoints = null;
        cableState.connected = false;
        var fresh = getCablePoints();
        cableState.connected = true;
        connectedPoints = fresh;
        updateCables();
      });
      initCableInteraction();
      // Dispatch event so app.js knows cables are connected
      window.dispatchEvent(new CustomEvent('cablesConnected'));
    });
  }

  // ---- Interactive cable physics (per-vertex spring) ----

  var mouse = { x: -9999, y: -9999, active: false };
  var influenceRadius = 130;
  var maxForce = 28;
  var damping = 0.1;
  var returnSpeed = 0.05;

  // Per-vertex smooth offsets: left cable has 22 control points, right has 4
  var leftOffsets = []; // [{x, y, tx, ty}, ...] for each control point
  var rightOffsets = [];

  function initOffsets() {
    leftOffsets = [];
    for (var i = 0; i < 22; i++) leftOffsets.push({ x: 0, y: 0, tx: 0, ty: 0 });
    rightOffsets = [];
    for (var i = 0; i < 4; i++) rightOffsets.push({ x: 0, y: 0, tx: 0, ty: 0 });
  }

  // Get the actual screen positions of all control points for a cable
  function getLeftControlPoints(pts) {
    var osx = 18.25, osy = 0.2, oex = 363.75, oey = 420.7;
    var scaleX = (pts.djL.x - pts.provider.x) / (oex - osx);
    var scaleY = (pts.djL.y - pts.provider.y) / (oey - osy);
    var offX = pts.provider.x - osx * scaleX;
    var offY = pts.provider.y - osy * scaleY;
    function tx(x) { return offX + x * scaleX; }
    function ty(y) { return offY + y * scaleY; }

    return [
      // M start
      { x: pts.provider.x, y: pts.provider.y, fixed: true },
      // C1
      { x: tx(9.58), y: ty(65.2) },
      { x: tx(-0.05), y: ty(225.2) },
      { x: tx(34.75), y: ty(277.2) },
      // C2
      { x: tx(78.25), y: ty(342.2) },
      { x: tx(171.25), y: ty(228.7) },
      { x: tx(94.25), y: ty(200.7) },
      // C3
      { x: tx(17.25), y: ty(172.7) },
      { x: tx(-22.75), y: ty(298.2) },
      { x: tx(17.25), y: ty(382.2) },
      // C4
      { x: tx(57.25), y: ty(466.2) },
      { x: tx(106.25), y: ty(471.7) },
      { x: tx(116.75), y: ty(448.7) },
      // C5
      { x: tx(127.25), y: ty(425.7) },
      { x: tx(104.25), y: ty(407.4) },
      { x: tx(78.25), y: ty(417.2) },
      // C6
      { x: tx(46.44), y: ty(429.2) },
      { x: tx(60.75), y: ty(532.7) },
      { x: tx(181.25), y: ty(508.2) },
      // C7
      { x: tx(277.65), y: ty(488.6) },
      { x: tx(346.25), y: ty(437.7) },
      // end
      { x: pts.djL.x, y: pts.djL.y, fixed: true },
    ];
  }

  function getRightControlPoints(pts) {
    var osx = 0.61, osy = 13, oex = 176.61, oey = 3.5;
    var scale = (pts.alb.x - pts.djR.x) / (oex - osx);
    var offX = pts.djR.x - osx * scale;
    var midConnY = (pts.djR.y + pts.alb.y) / 2;
    var midOrigY = (osy + oey) / 2;
    var offY = midConnY - midOrigY * scale;
    function tx(x) { return offX + x * scale; }
    function ty(y) { return offY + y * scale; }

    return [
      { x: pts.djR.x, y: pts.djR.y, fixed: true },
      { x: tx(105.11), y: ty(59.5) },
      { x: tx(51.11), y: ty(-11) },
      { x: pts.alb.x, y: pts.alb.y, fixed: true },
    ];
  }

  var disconnectedCable = null; // null | 'left' | 'right'
  var disconnectTween = null;

  function initCableInteraction() {
    var mainEl = document.getElementById('main');
    if (!mainEl) return;

    initOffsets();

    mainEl.addEventListener('mousemove', function (e) {
      var mainRect = mainEl.getBoundingClientRect();
      mouse.x = e.clientX - mainRect.left;
      mouse.y = e.clientY - mainRect.top;
      mouse.active = true;
    });

    mainEl.addEventListener('mouseleave', function () {
      mouse.active = false;
    });

    // Cable click → disconnect/reconnect with animation
    var hitL = document.getElementById('cable-left-hit');
    var hitR = document.getElementById('cable-right-hit');

    if (hitL) hitL.addEventListener('click', function () { toggleCable('left'); });
    if (hitR) hitR.addEventListener('click', function () { toggleCable('right'); });

    requestAnimationFrame(cablePhysicsLoop);
  }

  function updateCableHitCursors() {
    var hitL = document.getElementById('cable-left-hit');
    var hitR = document.getElementById('cable-right-hit');
    if (disconnectedCable === 'left') {
      // Left disconnected: left is clickable, right is disabled
      if (hitL) hitL.classList.remove('disabled');
      if (hitR) hitR.classList.add('disabled');
    } else if (disconnectedCable === 'right') {
      if (hitL) hitL.classList.add('disabled');
      if (hitR) hitR.classList.remove('disabled');
    } else {
      // Both connected: both clickable
      if (hitL) hitL.classList.remove('disabled');
      if (hitR) hitR.classList.remove('disabled');
    }
  }

  function toggleCable(which) {
    if (disconnectTween) return; // animation in progress
    // Block clicking the other cable while one is disconnected
    if (disconnectedCable !== null && disconnectedCable !== which) return;

    var pts = connectedPoints || getCablePoints();
    var cableLeft = document.getElementById('cable-left');
    var cableRight = document.getElementById('cable-right');
    var hitL = document.getElementById('cable-left-hit');
    var hitR = document.getElementById('cable-right-hit');

    if (disconnectedCable === null) {
      // Disconnect
      disconnectedCable = which;
      var sfx = which === 'left' ? plugSfx1 : plugSfx2;
      sfx.currentTime = 0;
      sfx.play();

      // Mark cable as disconnected (orange color via CSS)
      var cableEl = which === 'left' ? cableLeft : cableRight;
      if (cableEl) cableEl.classList.add('disconnected');

      // Mute audio + lift needle
      Player.toggleMute();
      liftNeedle();
      var muteBtn = document.getElementById('debug-mute');
      if (muteBtn) muteBtn.classList.add('muted');

      updateCableHitCursors();

      if (which === 'left') {
        var tip = { ex: pts.djL.x, ey: pts.djL.y };
        var csx = pts.provider.x, csy = pts.provider.y, cex = pts.djL.x, cey = pts.djL.y;
        disconnectTween = gsap.to(tip, {
          ex: pts.djL.x - 40, ey: pts.djL.y + 120,
          duration: 0.4,
          ease: 'power2.out',
          onUpdate: function () {
            var d = buildLeftPath(pts.provider.x, pts.provider.y, tip.ex, tip.ey, csx, csy, cex, cey);
            cableLeft.setAttribute('d', d);
            if (hitL) hitL.setAttribute('d', d);
          },
          onComplete: function () { disconnectTween = null; },
        });
      } else {
        var rOff = rightTipOffset();
        var tip = { ex: pts.alb.x, ey: pts.alb.y };
        var crsx = pts.djR.x, crsy = pts.djR.y, crex = pts.alb.x, crey = pts.alb.y;
        disconnectTween = gsap.to(tip, {
          ex: pts.alb.x + rOff.dx, ey: pts.alb.y + rOff.dy,
          duration: 0.4,
          ease: 'power2.out',
          onUpdate: function () {
            var d = buildRightPath(pts.djR.x, pts.djR.y, tip.ex, tip.ey, crsx, crsy, crex, crey);
            cableRight.setAttribute('d', d);
            if (hitR) hitR.setAttribute('d', d);
          },
          onComplete: function () { disconnectTween = null; },
        });
      }
    } else if (disconnectedCable === which) {
      // Reconnect the same cable — update button immediately (no flicker)
      var sfx = which === 'left' ? plugSfx1 : plugSfx2;
      var muteBtn = document.getElementById('debug-mute');
      if (muteBtn) muteBtn.classList.remove('muted');
      dropNeedle();

      // Remove disconnected color
      var cableEl = which === 'left' ? cableLeft : cableRight;
      if (cableEl) cableEl.classList.remove('disconnected');

      if (which === 'left') {
        var tip = { ex: pts.djL.x - 40, ey: pts.djL.y + 120 };
        var csx = pts.provider.x, csy = pts.provider.y, cex = pts.djL.x, cey = pts.djL.y;
        disconnectTween = gsap.to(tip, {
          ex: pts.djL.x, ey: pts.djL.y,
          duration: 0.5,
          ease: 'power2.in',
          onUpdate: function () {
            var d = buildLeftPath(pts.provider.x, pts.provider.y, tip.ex, tip.ey, csx, csy, cex, cey);
            cableLeft.setAttribute('d', d);
            if (hitL) hitL.setAttribute('d', d);
          },
          onComplete: function () {
            sfx.currentTime = 0;
            sfx.play();
            disconnectedCable = null;
            disconnectTween = null;
            Player.toggleMute();
            updateCableHitCursors();
          },
        });
      } else {
        var rOff = rightTipOffset();
        var tip = { ex: pts.alb.x + rOff.dx, ey: pts.alb.y + rOff.dy };
        var crsx = pts.djR.x, crsy = pts.djR.y, crex = pts.alb.x, crey = pts.alb.y;
        disconnectTween = gsap.to(tip, {
          ex: pts.alb.x, ey: pts.alb.y,
          duration: 0.5,
          ease: 'power2.in',
          onUpdate: function () {
            var d = buildRightPath(pts.djR.x, pts.djR.y, tip.ex, tip.ey, crsx, crsy, crex, crey);
            cableRight.setAttribute('d', d);
            if (hitR) hitR.setAttribute('d', d);
          },
          onComplete: function () {
            sfx.currentTime = 0;
            sfx.play();
            disconnectedCable = null;
            disconnectTween = null;
            Player.toggleMute();
            updateCableHitCursors();
          },
        });
      }
    }
  }

  function cablePhysicsLoop() {
    requestAnimationFrame(cablePhysicsLoop);
    if (!cableState.connected) return;
    // Skip during reconnect/disconnect tween (GSAP is driving the path)
    if (disconnectTween) return;

    var pts = getCablePoints();
    var updateLeft = disconnectedCable !== 'left';
    var updateRight = disconnectedCable !== 'right';

    // Update physics for connected cables only
    if (updateLeft) {
      var leftCPs = getLeftControlPoints(pts);
      updateVertexTargets(leftCPs, leftOffsets);
    }
    if (updateRight) {
      var rightCPs = getRightControlPoints(pts);
      updateVertexTargets(rightCPs, rightOffsets);
    }

    // Smooth interpolation
    var speed = mouse.active ? damping : returnSpeed;
    var totalMovement = 0;

    if (updateLeft) {
      for (var i = 0; i < leftOffsets.length; i++) {
        leftOffsets[i].x += (leftOffsets[i].tx - leftOffsets[i].x) * speed;
        leftOffsets[i].y += (leftOffsets[i].ty - leftOffsets[i].y) * speed;
        totalMovement += Math.abs(leftOffsets[i].x) + Math.abs(leftOffsets[i].y);
      }
    }
    if (updateRight) {
      for (var i = 0; i < rightOffsets.length; i++) {
        rightOffsets[i].x += (rightOffsets[i].tx - rightOffsets[i].x) * speed;
        rightOffsets[i].y += (rightOffsets[i].ty - rightOffsets[i].y) * speed;
        totalMovement += Math.abs(rightOffsets[i].x) + Math.abs(rightOffsets[i].y);
      }
    }

    if (totalMovement < 0.05) return;

    var cableLeft = document.getElementById('cable-left');
    var cableRight = document.getElementById('cable-right');
    var hitL = document.getElementById('cable-left-hit');
    var hitR = document.getElementById('cable-right-hit');
    if (!cableLeft || !cableRight) return;

    // Only update the connected cable's path (disconnected one stays where GSAP left it)
    if (updateLeft) {
      var ld = buildLeftPathWithOffsets(pts, leftOffsets);
      cableLeft.setAttribute('d', ld);
      if (hitL) hitL.setAttribute('d', ld);
    }
    if (updateRight) {
      var rd = buildRightPathWithOffsets(pts, rightOffsets);
      cableRight.setAttribute('d', rd);
      if (hitR) hitR.setAttribute('d', rd);
    }
  }

  function updateVertexTargets(controlPoints, offsets) {
    for (var i = 0; i < controlPoints.length; i++) {
      var cp = controlPoints[i];
      if (cp.fixed) {
        offsets[i].tx = 0;
        offsets[i].ty = 0;
        continue;
      }

      if (mouse.active) {
        var dist = Math.hypot(mouse.x - cp.x, mouse.y - cp.y);
        if (dist < influenceRadius) {
          var force = (1 - dist / influenceRadius) * maxForce;
          var angle = Math.atan2(mouse.y - cp.y, mouse.x - cp.x);
          offsets[i].tx = Math.cos(angle) * force;
          offsets[i].ty = Math.sin(angle) * force;
        } else {
          offsets[i].tx = 0;
          offsets[i].ty = 0;
        }
      } else {
        offsets[i].tx = 0;
        offsets[i].ty = 0;
      }
    }
  }

  function buildLeftPathWithOffsets(pts, off) {
    var osx = 18.25, osy = 0.2, oex = 363.75, oey = 420.7;
    var scaleX = (pts.djL.x - pts.provider.x) / (oex - osx);
    var scaleY = (pts.djL.y - pts.provider.y) / (oey - osy);
    var offX = pts.provider.x - osx * scaleX;
    var offY = pts.provider.y - osy * scaleY;
    function tx(x) { return offX + x * scaleX; }
    function ty(y) { return offY + y * scaleY; }

    function p(i, baseX, baseY) {
      return (baseX + off[i].x) + ',' + (baseY + off[i].y);
    }

    return 'M ' + p(0, pts.provider.x, pts.provider.y) +
      ' C ' + p(1, tx(9.58), ty(65.2)) + ' ' + p(2, tx(-0.05), ty(225.2)) + ' ' + p(3, tx(34.75), ty(277.2)) +
      ' C ' + p(4, tx(78.25), ty(342.2)) + ' ' + p(5, tx(171.25), ty(228.7)) + ' ' + p(6, tx(94.25), ty(200.7)) +
      ' C ' + p(7, tx(17.25), ty(172.7)) + ' ' + p(8, tx(-22.75), ty(298.2)) + ' ' + p(9, tx(17.25), ty(382.2)) +
      ' C ' + p(10, tx(57.25), ty(466.2)) + ' ' + p(11, tx(106.25), ty(471.7)) + ' ' + p(12, tx(116.75), ty(448.7)) +
      ' C ' + p(13, tx(127.25), ty(425.7)) + ' ' + p(14, tx(104.25), ty(407.4)) + ' ' + p(15, tx(78.25), ty(417.2)) +
      ' C ' + p(16, tx(46.44), ty(429.2)) + ' ' + p(17, tx(60.75), ty(532.7)) + ' ' + p(18, tx(181.25), ty(508.2)) +
      ' C ' + p(19, tx(277.65), ty(488.6)) + ' ' + p(20, tx(346.25), ty(437.7)) + ' ' + p(21, pts.djL.x, pts.djL.y);
  }

  function buildRightPathWithOffsets(pts, off) {
    var osx = 0.61, osy = 13, oex = 176.61, oey = 3.5;
    var scale = (pts.alb.x - pts.djR.x) / (oex - osx);
    var offX2 = pts.djR.x - osx * scale;
    var midConnY = (pts.djR.y + pts.alb.y) / 2;
    var midOrigY = (osy + oey) / 2;
    var offY2 = midConnY - midOrigY * scale;
    function tx(x) { return offX2 + x * scale; }
    function ty(y) { return offY2 + y * scale; }

    function p(i, baseX, baseY) {
      return (baseX + off[i].x) + ',' + (baseY + off[i].y);
    }

    return 'M ' + p(0, pts.djR.x, pts.djR.y) +
      ' C ' + p(1, tx(105.11), ty(59.5)) + ' ' + p(2, tx(51.11), ty(-11)) + ' ' + p(3, pts.alb.x, pts.alb.y);
  }

  function isAnimating() { return isDropping; }

  // ---- Needle (perilla) lift/drop on mute ----

  var needleTween = null;
  var NEEDLE_PIVOT = '287 5'; // SVG coords: top-right hinge of the tonearm
  var NEEDLE_LIFT_ANGLE = -18; // degrees counter-clockwise when lifted

  function liftNeedle() {
    var perilla = document.getElementById('perilla');
    if (!perilla) return;
    if (needleTween) needleTween.kill();
    needleTween = gsap.to(perilla, {
      rotation: NEEDLE_LIFT_ANGLE,
      svgOrigin: NEEDLE_PIVOT,
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  function dropNeedle() {
    var perilla = document.getElementById('perilla');
    if (!perilla) return;
    if (needleTween) needleTween.kill();
    needleTween = gsap.to(perilla, {
      rotation: 0,
      svgOrigin: NEEDLE_PIVOT,
      duration: 0.6,
      ease: 'bounce.out',
    });
  }

  // ---- Volume fader (control_volume drag) ----

  var faderDragging = false;
  var faderStartMouseY = 0;
  var faderStartOffset = 0;
  var faderOffset = 0; // current translateY in SVG units

  // Bounds in SVG coordinate space
  var FADER_MIN_Y = -7;   // move up from default (top of box)
  var FADER_MAX_Y = 55;   // move down from default (bottom of box)

  function initVolumeFader() {
    var controlEl = document.getElementById('control_volume');
    var svgEl = document.getElementById('illustration-set');
    var boxHit = document.getElementById('box_hit');
    if (!controlEl || !svgEl) return;

    // Start at top = max volume
    faderOffset = FADER_MIN_Y;
    controlEl.setAttribute('transform', 'translate(0,' + faderOffset + ')');

    controlEl.addEventListener('mousedown', onFaderDown);
    controlEl.addEventListener('touchstart', onFaderDown, { passive: false });

    // Click on the box track to jump fader to that position
    if (boxHit) {
      boxHit.addEventListener('mousedown', onBoxClick);
      boxHit.addEventListener('touchstart', onBoxClick, { passive: false });
    }

    document.addEventListener('mousemove', onFaderMove);
    document.addEventListener('touchmove', onFaderMove, { passive: false });

    document.addEventListener('mouseup', onFaderUp);
    document.addEventListener('touchend', onFaderUp);
  }

  // Control default Y center in SVG space (before any transform)
  var CONTROL_CENTER_Y = 224;

  function onBoxClick(e) {
    e.preventDefault();
    var svgEl = document.getElementById('illustration-set');
    if (!svgEl) return;
    var rect = svgEl.getBoundingClientRect();
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    // Convert screen Y to SVG Y
    var svgY = ((clientY - rect.top) / rect.height) * 296;
    // The fader offset needed to place control center at svgY
    var newOffset = svgY - CONTROL_CENTER_Y;
    faderOffset = Math.max(FADER_MIN_Y, Math.min(FADER_MAX_Y, newOffset));

    var controlEl = document.getElementById('control_volume');
    if (controlEl) controlEl.setAttribute('transform', 'translate(0,' + faderOffset + ')');

    // Update volume
    var range = FADER_MAX_Y - FADER_MIN_Y;
    var vol = 100 - ((faderOffset - FADER_MIN_Y) / range) * 100;
    Player.setVolume(Math.round(vol));

    // Start dragging immediately so user can fine-tune
    faderDragging = true;
    faderStartMouseY = clientY;
    faderStartOffset = faderOffset;
    if (controlEl) controlEl.style.cursor = 'grabbing';
  }

  function svgYScale() {
    var svgEl = document.getElementById('illustration-set');
    if (!svgEl) return 1;
    var rect = svgEl.getBoundingClientRect();
    // SVG viewBox is 296x296, rendered at rect.height
    return 296 / rect.height;
  }

  function onFaderDown(e) {
    e.preventDefault();
    faderDragging = true;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    faderStartMouseY = clientY;
    faderStartOffset = faderOffset;
    var controlEl = document.getElementById('control_volume');
    if (controlEl) controlEl.style.cursor = 'grabbing';
  }

  function onFaderMove(e) {
    if (!faderDragging) return;
    e.preventDefault();
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    var deltaScreen = clientY - faderStartMouseY;
    var deltaSVG = deltaScreen * svgYScale();

    faderOffset = Math.max(FADER_MIN_Y, Math.min(FADER_MAX_Y, faderStartOffset + deltaSVG));

    var controlEl = document.getElementById('control_volume');
    if (controlEl) controlEl.setAttribute('transform', 'translate(0,' + faderOffset + ')');

    // Map position to volume: top = 100, bottom = 0
    var range = FADER_MAX_Y - FADER_MIN_Y;
    var vol = 100 - ((faderOffset - FADER_MIN_Y) / range) * 100;
    Player.setVolume(Math.round(vol));
  }

  function onFaderUp() {
    if (!faderDragging) return;
    faderDragging = false;
    var controlEl = document.getElementById('control_volume');
    if (controlEl) controlEl.style.cursor = 'grab';
  }

  return { init, startSpin, stopSpin, setBPM, stopBounce, renderStack, setCover, dropAlbum, transitionDJ, animateCables, updateCables, isAnimating, toggleCable, isDisconnected: function () { return disconnectedCable; }, initVolumeFader, liftNeedle, dropNeedle, vinylBrake, vinylRelease, toggleBrake };
})();
