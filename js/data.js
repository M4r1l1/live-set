// ============================================
// Data — DJ Profiles + Curated Playlists (SoundCloud)
// Tracks interleaved by artist to avoid consecutive duplicate covers
// Mixes distributed throughout the playlist
// ============================================

const DJS = [
  {
    id: 'dj-mara',
    name: 'Mara Velour',
    channel: 'move',
    genres: ['Afro House', 'Deep House', 'Organic House'],
    illustration: 'assets/animation/stone-dj.webm',
    bio: 'Mezcla sonidos orgánicos africanos con la elegancia del deep house europeo. Sus sets son como atardeceres — empiezan cálidos y terminan hipnóticos.',
    philosophy: 'La música es un textil — capas que se entrelazan hasta que no puedes separar dónde empieza una y termina otra.',
    energy: 'Cálido, envolvente',
  },
  {
    id: 'dj-kei',
    name: 'Kei Nomura',
    channel: 'focus',
    genres: ['Ambient', 'Downtempo', 'Electronica'],
    illustration: 'assets/animation/guy-dj.webm',
    bio: 'Construye sets como construiría un edificio: espacio, estructura, silencio. Su música es lo que suena cuando una ciudad todavía no despierta.',
    philosophy: 'El silencio entre dos tracks es tan importante como los tracks mismos.',
    energy: 'Contemplativo, espacioso',
  },
  {
    id: 'dj-zola',
    name: 'Zola Mbeki',
    channel: 'intensity',
    genres: ['Techno', 'Breakbeat', 'Gqom'],
    illustration: 'assets/animation/geisha-dj.webm',
    bio: 'Mezcla la crudeza del club sudafricano con la oscuridad del techno británico. Sus sets no te invitan a bailar — te obligan.',
    philosophy: 'No me interesa que la gente piense mientras baila. Me interesa que sienta el piso vibrar y se olvide de su nombre.',
    energy: 'Visceral, hipnótica',
  },
  {
    id: 'dj-paloma',
    name: 'Paloma del Río',
    channel: 'flow',
    genres: ['Nu-Disco', 'Tropical Bass', 'Indie Dance'],
    illustration: 'assets/animation/chicken-dj.webm',
    bio: 'No mezcla tracks, mezcla memorias. Un bolero se convierte en un groove, una cumbia se vuelve algo que suena a playa europea. Todo fluye como una conversación larga entre amigos.',
    philosophy: 'La mejor música de fondo es la que de repente te das cuenta que llevas 20 minutos sonriendo sin saber por qué.',
    energy: 'Cálido, groovy, despreocupado',
  },
];

const ALBUMS = [
  // ============================================================
  // MARA VELOUR — move (Afro House / Deep House / Organic House)
  // 20 tracks, 1 mix (Roger Gangi at position 7)
  // ============================================================

  { id: 'mara-01', title: 'Trust', artist: 'Rampa', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/rampa/rampa-trust-keinemusik-km032', artworkUrl: 'https://i1.sndcdn.com/artworks-000160399905-lf2wnv-t500x500.jpg', coverColor: '#c45e2c', bpm: 122 },
  { id: 'mara-02', title: 'Say What (feat. Chuala)', artist: 'Keinemusik', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/keinemusik/keinemusik-rampa-me-adam-port-say-what-feat-chuala', artworkUrl: 'https://i1.sndcdn.com/artworks-GPkwGxzAdgroyqJv-4U0LyA-t500x500.jpg', coverColor: '#2c8c7c', bpm: 122 },
  { id: 'mara-03', title: 'Mockingbird', artist: 'Moojo', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/calamarcrew/moojo-mockingbird', artworkUrl: 'https://i1.sndcdn.com/artworks-xZRbFArIcoGL73Yg-7Bdfog-t500x500.jpg', coverColor: '#1a3a2a', bpm: 122 },
  { id: 'mara-26', title: 'Everybody', artist: 'Carlita', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/lifeanddeath/lad060-carlita-everybody', artworkUrl: 'https://i1.sndcdn.com/artworks-kq7QN5bNjQnMsYgs-SIHjbQ-t500x500.jpg', coverColor: '#c45e2c', bpm: 122 },
  { id: 'mara-06', title: 'Cloudscape', artist: 'Enoo Napa & Phila De Giant', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/sondelarecordings/cloudscape-enoo-napa-phila-de-giant', artworkUrl: 'https://i1.sndcdn.com/artworks-KzcFkUk9nlyyCzqy-yTjl7A-t500x500.jpg', coverColor: '#1a3a2a', bpm: 122 },
  { id: 'mara-27', title: 'For You', artist: 'Fahlberg', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/moblack-records/mbr491-fahlberg-for-you', artworkUrl: 'https://i1.sndcdn.com/artworks-4CRssfSSZCnPeZFz-pfMysg-t500x500.jpg', coverColor: '#c45e2c', bpm: 122 },
  { id: 'mara-14', title: 'Roger Gangi — Afro House Mix 2024', artist: 'Mara Velour', mixDj: 'Roger Gangi', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/rogergangi/afro-house-mix-2025', artworkUrl: 'https://i1.sndcdn.com/artworks-RyR7p1wdizxh83jy-azYOEw-t500x500.jpg', coverColor: '#2c8c7c', bpm: 122 },
  { id: 'mara-10', title: 'The Song', artist: 'Stimming', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/stimming/diy056-the-song', artworkUrl: 'https://i1.sndcdn.com/artworks-000107776902-1im2qr-t500x500.jpg', coverColor: '#1a3a2a', bpm: 120 },
  { id: 'mara-07', title: 'Empire State', artist: '&ME', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/keinemusik/04-me-empire-state', artworkUrl: 'https://i1.sndcdn.com/artworks-000008503192-9y2jwx-t500x500.jpg', coverColor: '#c45e2c', bpm: 124 },
  { id: 'mara-11', title: 'Entropie', artist: 'Rampa', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/rampa/rampa-entropie-keinemusik-km032', artworkUrl: 'https://i1.sndcdn.com/artworks-000160395097-djg053-t500x500.jpg', coverColor: '#2c8c7c', bpm: 120 },
  { id: 'mara-08', title: 'Lotus', artist: 'Moojo & Demayä', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/calamarcrew/moojo-demaya-lotus', artworkUrl: 'https://i1.sndcdn.com/artworks-MjclbJIzZD42ferk-2MjTcQ-t500x500.jpg', coverColor: '#1a3a2a', bpm: 122 },
  { id: 'mara-12', title: 'Discoteca (feat. Sofie)', artist: 'Keinemusik', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/keinemusik/keinemusik-me-rampa-adam-port-discoteca-feat-sofie', artworkUrl: 'https://i1.sndcdn.com/artworks-bENtZ7B0zqab8Bnj-4PN0BA-t500x500.jpg', coverColor: '#c45e2c', bpm: 122 },
  { id: 'mara-13', title: 'Champagne', artist: 'Shimza', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/hmwl/hmwl-premiere-shimza-champagne-get-physical-music-afro-house', artworkUrl: 'https://i1.sndcdn.com/artworks-000499145517-xtkhdg-t500x500.jpg', coverColor: '#2c8c7c', bpm: 124 },

  { id: 'mara-15', title: 'Healing', artist: 'Moojo', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/moblack-records/mbr467-moojo-healing-original-mix', artworkUrl: 'https://i1.sndcdn.com/artworks-Alkcjns2x6fAWoSD-XNXNCQ-t500x500.jpg', coverColor: '#c45e2c', bpm: 120 },
  { id: 'mara-18', title: 'Waves', artist: 'Chaleee, Enoo Napa & Lazarusman', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/sondelarecordings/waves-chaleee-enoo-napa-lazarusman-masterv2', artworkUrl: 'https://i1.sndcdn.com/artworks-aF9VunYWi8mNN6eh-hfC3Cg-t500x500.jpg', coverColor: '#2c8c7c', bpm: 122 },
  { id: 'mara-22', title: 'Thandaza (feat. Arabic Piano)', artist: 'Keinemusik & Alan Dixon', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/keinemusik/keinemusik-adam-port-me-rampa-alan-dixon-thandaza-feat-arabic-piano', artworkUrl: 'https://i1.sndcdn.com/artworks-HQNIdb8d5VwQMyIV-Ahvkvw-t500x500.jpg', coverColor: '#c45e2c', bpm: 118 },
  { id: 'mara-28', title: 'I Wanna Go', artist: 'Arodes', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/arodes10/i-wanna-go', artworkUrl: 'https://i1.sndcdn.com/artworks-l53BDsdzU71h-0-t500x500.jpg', coverColor: '#1a3a2a', bpm: 122 },
  { id: 'mara-23', title: 'Melodica', artist: 'Stimming', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/stimming/melodica', artworkUrl: 'https://i1.sndcdn.com/artworks-000107776902-1im2qr-t500x500.jpg', coverColor: '#2c8c7c', bpm: 118 },
  { id: 'mara-20', title: 'Ze Roberto', artist: 'Moojo', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/calamarcrew/moojo-ze-roberto', artworkUrl: 'https://i1.sndcdn.com/artworks-MUUEAhhHzvYW88pW-d60v1g-t500x500.jpg', coverColor: '#c45e2c', bpm: 124 },

  { id: 'mara-17', title: 'Before The Flood (feat. Cubicolor)', artist: 'Keinemusik', djId: 'dj-mara', soundcloudUrl: 'https://soundcloud.com/keinemusik/keinemusik-me-rampa-adam-port-before-the-flood-feat-cubicolor-1', artworkUrl: 'https://i1.sndcdn.com/artworks-kqAYtQ56SSiDw7dY-upxP1w-t500x500.jpg', coverColor: '#2c8c7c', bpm: 120 },

  // ============================================================
  // KEI NOMURA — focus (Ambient / Downtempo / Electronica)
  // 20 tracks, 1 mix (Livo at position 11)
  // ============================================================

  { id: 'kei-02', title: 'Blurred', artist: 'Kiasmos', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/erasedtapes/kiasmos-blurred', artworkUrl: 'https://i1.sndcdn.com/artworks-000238244902-t5fpe9-t500x500.jpg', coverColor: '#5a6a7a', bpm: 108 },
  { id: 'kei-03', title: 'Kerala', artist: 'Bonobo', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/bonobo/kerala', artworkUrl: 'https://i1.sndcdn.com/artworks-VxjZDrXWKHAh-0-t500x500.jpg', coverColor: '#e8e0d4', bpm: 100 },
  { id: 'kei-05', title: 'Near Light', artist: 'Ólafur Arnalds', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/erasedtapes/olafur-arnalds-near-light', artworkUrl: 'https://i1.sndcdn.com/artworks-000014153310-y9smrt-t500x500.jpg', coverColor: '#e8e0d4', bpm: 88 },
  { id: 'kei-32', title: 'Goodbye (Instrumental)', artist: 'Apparat', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/apparat/apparat-goodbye-instrumental', artworkUrl: 'https://i1.sndcdn.com/artworks-000013214162-dbqoyo-t500x500.jpg', coverColor: '#d4d8e0', bpm: 100 },
  { id: 'kei-27', title: 'Adrift', artist: 'Tycho', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/tycho/tycho-adrift', artworkUrl: 'https://i1.sndcdn.com/artworks-000001215991-mzzx63-t500x500.jpg', coverColor: '#e8e0d4', bpm: 90 },

  { id: 'kei-07', title: 'The Song', artist: 'Stimming', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/stimming/diy056-the-song', artworkUrl: 'https://i1.sndcdn.com/artworks-000107776902-1im2qr-t500x500.jpg', coverColor: '#5a6a7a', bpm: 105 },
  { id: 'kei-08', title: 'Swept', artist: 'Kiasmos', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/erasedtapes/kiasmos-swept', artworkUrl: 'https://i1.sndcdn.com/artworks-000135789519-biyg53-t500x500.jpg', coverColor: '#e8e0d4', bpm: 105 },

  { id: 'kei-33', title: 'Fast Forward', artist: 'Floating Points', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/floatingpoints/fast-forward', artworkUrl: 'https://i1.sndcdn.com/artworks-LBqw6MIml5LD-0-t500x500.jpg', coverColor: '#e8e0d4', bpm: 108 },
  { id: 'kei-11', title: 'A Walk', artist: 'Tycho', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/tycho/a-walk', artworkUrl: 'https://i1.sndcdn.com/artworks-000044034079-5t6t9b-t500x500.jpg', coverColor: '#d4d8e0', bpm: 90 },
  { id: 'kei-29', title: 'Lost', artist: 'Christian Löffler', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/xlr8r/premiere-christian-loffler-lost', artworkUrl: 'https://i1.sndcdn.com/artworks-000138155868-rl33oz-t500x500.jpg', coverColor: '#e8e0d4', bpm: 100 },
  { id: 'kei-18', title: 'Lazy Sunday Mix — RÜFÜS DU SOL, Lane 8, Ben Böhmer', artist: 'Kei Nomura', mixDj: 'Livo', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/livo_mixes/lazy-sunday-mix-rufus-du-sol-lane-8-ben-bohmer', artworkUrl: 'https://i1.sndcdn.com/artworks-kYb2W8qppHb2m634-ZGb7iA-t500x500.jpg', coverColor: '#d4d8e0', bpm: 105 },
  { id: 'kei-13', title: 'Purple Line', artist: 'Ben Böhmer', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/ben-bohmer/ben-bohmer-purple-line', artworkUrl: 'https://i1.sndcdn.com/artworks-000206623693-11w1ds-t500x500.jpg', coverColor: '#5a6a7a', bpm: 108 },
  { id: 'kei-15', title: 'Paused (Stimming Remix)', artist: 'Kiasmos', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/erasedtapes/kiasmos-paused-stimming-remix', artworkUrl: 'https://i1.sndcdn.com/artworks-000242132449-hoen6t-t500x500.jpg', coverColor: '#e8e0d4', bpm: 105 },
  { id: 'kei-16', title: 'Cirrus', artist: 'Bonobo', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/bonobo/cirrus', artworkUrl: 'https://i1.sndcdn.com/artworks-B2Dij64i84WS-0-t500x500.jpg', coverColor: '#d4d8e0', bpm: 100 },
  { id: 'kei-34', title: 'Song Of Los', artist: 'Apparat', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/muterecords/apparat-song-of-los', artworkUrl: 'https://i1.sndcdn.com/artworks-000011602664-hnskhp-t500x500.jpg', coverColor: '#5a6a7a', bpm: 100 },
  { id: 'kei-30', title: 'Kid Velo', artist: 'Rival Consoles', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/erasedtapes/rival-consoles-kid-velo', artworkUrl: 'https://i1.sndcdn.com/artworks-000006106016-p22d1w-t500x500.jpg', coverColor: '#e8e0d4', bpm: 105 },
  { id: 'kei-17', title: 'Says (Monolink Edit)', artist: 'Nils Frahm', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/monolink/nils-frahm-says-monolink-edit-free-download', artworkUrl: 'https://i1.sndcdn.com/artworks-000133561267-d6g52t-t500x500.jpg', coverColor: '#d4d8e0', bpm: 100 },
  { id: 'kei-22', title: 'Melodica', artist: 'Stimming', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/stimming/melodica', artworkUrl: 'https://i1.sndcdn.com/artworks-000107776902-1im2qr-t500x500.jpg', coverColor: '#e8e0d4', bpm: 100 },
  { id: 'kei-35', title: 'Arcadia', artist: 'Apparat', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/apparat/arcadia', artworkUrl: 'https://i1.sndcdn.com/artworks-000011285165-n3byeo-t500x500.jpg', coverColor: '#d4d8e0', bpm: 98 },

  { id: 'kei-24', title: 'Blurred (Bonobo Remix)', artist: 'Kiasmos', djId: 'dj-kei', soundcloudUrl: 'https://soundcloud.com/erasedtapes/kiasmos-blurred-bonobo-remix', artworkUrl: 'https://i1.sndcdn.com/artworks-000245850967-q29a9t-t500x500.jpg', coverColor: '#e8e0d4', bpm: 105 },

  // ============================================================
  // ZOLA MBEKI — intensity (Techno / Breakbeat / Gqom)
  // 28 tracks, 1 mix (DJ Lag Boiler Room at position 9)
  // ============================================================

  { id: 'zola-02', title: 'Sandstorm', artist: 'FJAAK', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/fjaak/fjaak-sandstorm', artworkUrl: 'https://i1.sndcdn.com/artworks-nY48TTmxKfsPekiF-rdpYbw-t500x500.jpg', coverColor: '#e02020', bpm: 138 },
  { id: 'zola-03', title: 'Black Magic', artist: 'Indira Paganotto', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/indirapaganotto/indira-paganotto-blackmagic', artworkUrl: 'https://i1.sndcdn.com/artworks-ezgM4E5MGoSzJtCs-e2xkTg-t500x500.jpg', coverColor: '#3a3a3a', bpm: 140 },
  { id: 'zola-31', title: 'Justa', artist: 'Blawan', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/ternesc/blawan-justa', artworkUrl: 'https://i1.sndcdn.com/artworks-J2koPZEEfCnUOmyt-8uOTBA-t500x500.jpg', coverColor: '#1a1a1a', bpm: 138 },
  { id: 'zola-26', title: '808BB', artist: 'Skee Mask', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/ilian-tape/iss003-skee-mask-808bb', artworkUrl: 'https://i1.sndcdn.com/artworks-000493377066-kevh1h-t500x500.jpg', coverColor: '#e02020', bpm: 135 },
  { id: 'zola-05', title: 'Daisies', artist: 'DJ Lag', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/gqomu/dj-lag-daisies-1', artworkUrl: 'https://i1.sndcdn.com/artworks-000336839790-zojalc-t500x500.jpg', coverColor: '#3a3a3a', bpm: 138 },
  { id: 'zola-06', title: 'Hustle', artist: 'FJAAK', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/fjaak/fjaak-hustle', artworkUrl: 'https://i1.sndcdn.com/artworks-nY48TTmxKfsPekiF-rdpYbw-t500x500.jpg', coverColor: '#e02020', bpm: 140 },
  { id: 'zola-33', title: 'BR3ATH3', artist: 'Kobosil', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/kobosil/br3ath3', artworkUrl: 'https://i1.sndcdn.com/artworks-HgxPgbz2tBSJDUe7-IaStwQ-t500x500.jpg', coverColor: '#3a3a3a', bpm: 140 },
  { id: 'zola-27', title: 'Atalaku', artist: 'Crystallmess', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/pan_hq/b2-crystallmess-atalaku-pan', artworkUrl: 'https://i1.sndcdn.com/artworks-000646128385-b1svyv-t500x500.jpg', coverColor: '#1a1a1a', bpm: 138 },
  { id: 'zola-04', title: 'DJ LAG — Boiler Room x G-Star RAW Johannesburg', artist: 'Zola Mbeki', mixDj: 'DJ Lag', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/platform/dj-lag', artworkUrl: 'https://i1.sndcdn.com/artworks-000139545591-ixa1m1-t500x500.jpg', coverColor: '#e02020', bpm: 140 },
  { id: 'zola-08', title: 'Magnetic Pulse', artist: 'Indira Paganotto', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/when-we-dip/premiere-indira-paganotto-magnetic-pulse-second-state', artworkUrl: 'https://i1.sndcdn.com/artworks-dmJkayXlMDn0RV2v-lgIPeQ-t500x500.jpg', coverColor: '#3a3a3a', bpm: 138 },
  { id: 'zola-09', title: 'Dreamweaver', artist: 'FJAAK', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/fjaak/fjaak-dreamweaver', artworkUrl: 'https://i1.sndcdn.com/artworks-nY48TTmxKfsPekiF-rdpYbw-t500x500.jpg', coverColor: '#1a1a1a', bpm: 135 },
  { id: 'zola-34', title: 'No Hay Mañana (Club Mix)', artist: 'Héctor Oaks', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/hectoroaks/hector-oaks-x-coco-paloma-no-hay-manana-club-mix', artworkUrl: 'https://i1.sndcdn.com/artworks-V5JLIvtWbbhkyqxp-Bku05w-t500x500.jpg', coverColor: '#e02020', bpm: 138 },
  { id: 'zola-28', title: 'Raging Earth', artist: 'Paula Temple', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/paulatemple/raging-earth', artworkUrl: 'https://i1.sndcdn.com/artworks-000513935232-9jqfni-t500x500.jpg', coverColor: '#3a3a3a', bpm: 140 },
  { id: 'zola-10', title: '16th Step', artist: 'DJ Lag', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/goon-club-allstars/gca006-dj-lag-16th-step', artworkUrl: 'https://i1.sndcdn.com/artworks-000187833166-itvcjp-t500x500.jpg', coverColor: '#1a1a1a', bpm: 140 },
  { id: 'zola-12', title: 'Black Ice (feat. Skee Mask)', artist: 'FJAAK', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/fjaak/fjaak-black-ice-feat-skee-mask', artworkUrl: 'https://i1.sndcdn.com/artworks-nY48TTmxKfsPekiF-rdpYbw-t500x500.jpg', coverColor: '#e02020', bpm: 138 },
  { id: 'zola-35', title: 'Move in Circles, Walk on Lines', artist: 'Héctor Oaks', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/bassiani/b1-hector-oaks-move-in-circles', artworkUrl: 'https://i1.sndcdn.com/artworks-000240192717-umh582-t500x500.jpg', coverColor: '#3a3a3a', bpm: 140 },
  { id: 'zola-29', title: 'Touching Plastic', artist: 'Helena Hauff', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/fabric/helena-hauff-touching-plastic-fabric-originals', artworkUrl: 'https://i1.sndcdn.com/artworks-txmav2dXl2OLM8Xw-VUoRZg-t500x500.jpg', coverColor: '#1a1a1a', bpm: 138 },
  { id: 'zola-13', title: 'Blackbird SR-71', artist: 'Indira Paganotto', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/cerclelive/indira-paganotto-black-bird', artworkUrl: 'https://i1.sndcdn.com/artworks-qjVxmnu4UIxryaMY-YtdYwA-t500x500.jpg', coverColor: '#e02020', bpm: 142 },

  { id: 'zola-14', title: 'Nyusa', artist: 'DJ Lag & OKZharp', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/hyperdub/dj-lag-and-okzharp-nyusa-taken-from-steamrooms-ep', artworkUrl: 'https://i1.sndcdn.com/artworks-000544534698-0u79nv-t500x500.jpg', coverColor: '#1a1a1a', bpm: 135 },
  { id: 'zola-36', title: 'Theme From Q', artist: 'Objekt', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/keinobjekt/theme-from-q', artworkUrl: 'https://i1.sndcdn.com/artworks-000203777643-lt2gya-t500x500.jpg', coverColor: '#e02020', bpm: 138 },

  { id: 'zola-17', title: 'Offi Bee', artist: 'DJ Lag', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/goodenuff/offi-bee', artworkUrl: 'https://i1.sndcdn.com/artworks-000589479395-n2ta9w-t500x500.jpg', coverColor: '#1a1a1a', bpm: 140 },
  { id: 'zola-37', title: 'Cactus', artist: 'Objekt', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/keinobjekt/cactus', artworkUrl: 'https://i1.sndcdn.com/artworks-gIg14wESr3OM-0-t500x500.jpg', coverColor: '#e02020', bpm: 135 },
  { id: 'zola-19', title: 'Keep On Moving', artist: 'FJAAK', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/fjaak/fjaak-keep-on-moving', artworkUrl: 'https://i1.sndcdn.com/artworks-OyH8jMmAWU3TCyVT-7xIzSQ-t500x500.jpg', coverColor: '#3a3a3a', bpm: 138 },
  { id: 'zola-38', title: 'Needle And Thread', artist: 'Objekt', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/keinobjekt/needle-and-thread', artworkUrl: 'https://i1.sndcdn.com/artworks-000203777641-dottmg-t500x500.jpg', coverColor: '#1a1a1a', bpm: 136 },
  { id: 'zola-23', title: 'Open The Doors (feat. Kittin)', artist: 'FJAAK & Tobi Neumann', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/fjaak/fjaak-tobi-neumann-feat-kittin-open-the-doors', artworkUrl: 'https://i1.sndcdn.com/artworks-BiGbIoy9zAn7ytMB-gaMmJg-t500x500.jpg', coverColor: '#e02020', bpm: 135 },
  { id: 'zola-30', title: 'Ganzfeld', artist: 'Objekt', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/keinobjekt/ganzfeld', artworkUrl: 'https://i1.sndcdn.com/artworks-000203779618-lb71n7-t500x500.jpg', coverColor: '#3a3a3a', bpm: 138 },
  { id: 'zola-21', title: 'Ringworld', artist: 'FJAAK', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/fjaak/fjaak-ringworld', artworkUrl: 'https://i1.sndcdn.com/artworks-nY48TTmxKfsPekiF-rdpYbw-t500x500.jpg', coverColor: '#1a1a1a', bpm: 140 },

  { id: 'zola-25', title: 'Rough & Ready', artist: 'FJAAK', djId: 'dj-zola', soundcloudUrl: 'https://soundcloud.com/fjaak/fjaakrough', artworkUrl: 'https://i1.sndcdn.com/artworks-03ob5soaqJgImiw2-xMzcyg-t500x500.jpg', coverColor: '#3a3a3a', bpm: 140 },

  // ============================================================
  // PALOMA DEL RÍO — flow (Nu-Disco / Tropical Bass / Indie Dance)
  // 43 tracks, 1 mix (Chancha Vía Circuito at position 30)
  // ============================================================
  { id: 'paloma-01', title: 'Barretto (Tienes Algo)', artist: 'Nicola Cruz', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/dreamingvinyl/barretto-tienes-algodv-premiere', artworkUrl: 'https://i1.sndcdn.com/artworks-idsQRP5R4Kwa9VPJ-9mcIDA-t500x500.jpg', coverColor: '#e8a848', bpm: 114 },
  { id: 'paloma-02', title: 'Carioca', artist: 'Chancha Vía Circuito', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/chanchaviacircuito/carioca-free-download-see-track-info', artworkUrl: 'https://i1.sndcdn.com/artworks-000196249025-b0ht1r-t500x500.jpg', coverColor: '#d45a3a', bpm: 110 },
  { id: 'paloma-03', title: 'Dumbia Murdahs', artist: 'Dengue Dengue Dengue', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/dengue/dengue-dengue-dengue-dumbia', artworkUrl: 'https://i1.sndcdn.com/artworks-000032012672-s0au4k-t500x500.jpg', coverColor: '#f5e6d0', bpm: 112 },
  { id: 'paloma-04', title: 'Cumbia Lenta', artist: 'Frikstailers', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/frikstailers/cumbia-lenta', artworkUrl: 'https://i1.sndcdn.com/artworks-000423274296-5hs975-t500x500.jpg', coverColor: '#e8a848', bpm: 100 },
  { id: 'paloma-05', title: 'Machete', artist: 'Novalima', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/novalima/machete-novalima', artworkUrl: 'https://i1.sndcdn.com/artworks-000093112196-otarid-t500x500.jpg', coverColor: '#d45a3a', bpm: 112 },
  { id: 'paloma-06', title: 'Ya Verás', artist: 'Systema Solar', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/systema-solar/ya-ver-s-systema-solar', artworkUrl: 'https://i1.sndcdn.com/artworks-000082960348-ob4n7f-t500x500.jpg', coverColor: '#f5e6d0', bpm: 112 },
  { id: 'paloma-09', title: 'Telepathine', artist: 'Nicola Cruz', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/inverted-audio/nicola-cruz-telepathine-nousklaer', artworkUrl: 'https://i1.sndcdn.com/artworks-Ky8tCQOTGQEaXQ88-yC4IzQ-t500x500.jpg', coverColor: '#f5e6d0', bpm: 110 },
  { id: 'paloma-10', title: 'La Cumbia De La Ansiedad', artist: 'El Búho', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/earthlymeasures/el-buho-la-cumbia-de-la-ansiedad-1', artworkUrl: 'https://i1.sndcdn.com/artworks-S9pCLWvOC560J8vl-ReemsA-t500x500.jpg', coverColor: '#e8a848', bpm: 112 },
  { id: 'paloma-12', title: 'Marimbaso!', artist: 'Lagartijeando', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/lagartijeando/marimbaso', artworkUrl: 'https://i1.sndcdn.com/artworks-000057366659-e7625q-t500x500.jpg', coverColor: '#f5e6d0', bpm: 110 },
  { id: 'paloma-13', title: 'Algo (Feat La Yegros)', artist: 'King Coya', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/zzkrecords/king-coya-algo-feat-la-yegros', artworkUrl: 'https://i1.sndcdn.com/artworks-000336384744-xe25kc-t500x500.jpg', coverColor: '#e8a848', bpm: 110 },
  { id: 'paloma-17', title: 'La Danza de Los Mirlos', artist: 'Los Mirlos', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/losmirlos/la-danza-de-los-mirlos-1', artworkUrl: 'https://i1.sndcdn.com/artworks-000071090466-t3owgc-t500x500.jpg', coverColor: '#d45a3a', bpm: 112 },
  { id: 'paloma-19', title: 'Contato (feat. Marcela Dias)', artist: 'Nicola Cruz', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/fabric/nicola-cruz-contato-ft-marcela-dias', artworkUrl: 'https://i1.sndcdn.com/artworks-PMzGy7qye9CzxvrY-CDNYyw-t500x500.jpg', coverColor: '#e8a848', bpm: 112 },
  { id: 'paloma-20', title: 'Mirando A Las Muchachas', artist: 'Instituto Mexicano del Sonido', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/instituto-mexicano-del-s/instituto-mexicano-del', artworkUrl: 'https://i1.sndcdn.com/artworks-000016803472-2f02to-t500x500.jpg', coverColor: '#d45a3a', bpm: 115 },
  { id: 'paloma-22', title: 'Lluvia', artist: 'Mateo Kingman', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/mateokingman/lluvia', artworkUrl: 'https://i1.sndcdn.com/artworks-000133058094-r0qizn-t500x500.jpg', coverColor: '#e8a848', bpm: 108 },
  { id: 'paloma-23', title: '¡Sonido Amazonico!', artist: 'Chicha Libre', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/chicha-libre/sonido-amazonico', artworkUrl: 'https://i1.sndcdn.com/artworks-000039304966-a473k3-t500x500.jpg', coverColor: '#d45a3a', bpm: 110 },
  { id: 'paloma-24', title: 'Viene de Mi (Remix)', artist: 'Captain Planet', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/dj-captain-planet/viene-de-mi-captain-planet', artworkUrl: 'https://i1.sndcdn.com/artworks-000040019187-m65zi8-t500x500.jpg', coverColor: '#f5e6d0', bpm: 112 },


  { id: 'paloma-27', title: 'Río Arriba', artist: 'Chancha Vía Circuito', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/zzkrecords/04-chancha-via-circuito-rio-arriba', artworkUrl: 'https://i1.sndcdn.com/artworks-000001839672-ka4qsc-t500x500.jpg', coverColor: '#f5e6d0', bpm: 108 },
  { id: 'paloma-28', title: 'Pua (feat. Penya)', artist: 'Dengue Dengue Dengue', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/onthecornerrecords/dengue-dengue-dengue-a1-pua-ft-penya-otcr12010-mstrd', artworkUrl: 'https://i1.sndcdn.com/artworks-000032012672-s0au4k-t500x500.jpg', coverColor: '#e8a848', bpm: 115 },
  { id: 'paloma-29', title: 'Kuj Yato', artist: 'Clap! Clap!', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/black-acre-records/clap-clap-kuj-yato', artworkUrl: 'https://i1.sndcdn.com/artworks-000087393717-fp6hfb-t500x500.jpg', coverColor: '#d45a3a', bpm: 115 },
  { id: 'paloma-33', title: 'Bienvenidos', artist: 'Systema Solar', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/systema-solar/bienvenidos-systema-solar', artworkUrl: 'https://i1.sndcdn.com/artworks-000082375417-ppxp2f-t500x500.jpg', coverColor: '#f5e6d0', bpm: 110 },
  { id: 'paloma-36', title: 'Cumbiatron', artist: 'King Coya', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/waxploitation/king-coya-cumbiatron-3', artworkUrl: 'https://i1.sndcdn.com/artworks-000014151684-zhrpth-t500x500.jpg', coverColor: '#f5e6d0', bpm: 110 },
  { id: 'paloma-37', title: 'Lamanai', artist: 'Chancha Vía Circuito', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/chanchaviacircuito/chancha-via-circuito-lamanai', artworkUrl: 'https://i1.sndcdn.com/artworks-000103100350-1vhjs4-t500x500.jpg', coverColor: '#e8a848', bpm: 110 },
  { id: 'paloma-43', title: 'Primavera En La Selva', artist: 'Chicha Libre', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/chicha-libre/primavera-en-la-selva', artworkUrl: 'https://i1.sndcdn.com/artworks-000039306889-p3njkn-t500x500.jpg', coverColor: '#e8a848', bpm: 108 },
  { id: 'paloma-44', title: 'The Global Village', artist: 'Nickodemus', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/wonderwheel-recordings/nickodemus-the-global-village', artworkUrl: 'https://i1.sndcdn.com/artworks-000018046207-8qrlj4-t500x500.jpg', coverColor: '#d45a3a', bpm: 112 },
  { id: 'paloma-45', title: 'Mañana Tepotzlan', artist: 'El Búho', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/wonderwheel-recordings/el-buho-manana-tepotzlan', artworkUrl: 'https://i1.sndcdn.com/artworks-000135799541-bxtf0z-t500x500.jpg', coverColor: '#f5e6d0', bpm: 108 },
  { id: 'paloma-46', title: 'Cumbia Amazónica', artist: 'Los Mirlos', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/losmirlos/cumbia-amaz-nica', artworkUrl: 'https://i1.sndcdn.com/artworks-000071091527-lxebii-t500x500.jpg', coverColor: '#e8a848', bpm: 110 },
  { id: 'paloma-47', title: 'Sin Oficio', artist: 'Systema Solar', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/systema-solar/sin-oficio-systema-solar', artworkUrl: 'https://i1.sndcdn.com/artworks-000082868755-6by8p8-t500x500.jpg', coverColor: '#d45a3a', bpm: 112 },
  { id: 'paloma-48', title: 'Sé que estoy cambiando', artist: 'Meridian Brothers', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/meridianbrothers-music/se-que-estoy-cambiando-1', artworkUrl: 'https://i1.sndcdn.com/artworks-moJEj4L7lWVa-0-t500x500.jpg', coverColor: '#f5e6d0', bpm: 108 },
  { id: 'paloma-49', title: 'Aguacero (feat. Chico Mann)', artist: 'Captain Planet', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/thump/captain-planet-aguacero-feat-chico-mann', artworkUrl: 'https://i1.sndcdn.com/artworks-000134123085-y2mxu5-t500x500.jpg', coverColor: '#e8a848', bpm: 112 },
  { id: 'paloma-51', title: 'Encantamiento', artist: 'Chancha Vía Circuito', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/chanchaviacircuito/encantamiento-free-download-see-track-info', artworkUrl: 'https://i1.sndcdn.com/artworks-000138916914-mqjnot-t500x500.jpg', coverColor: '#f5e6d0', bpm: 112 },

  // --- Mix (Chancha Vía Circuito) ---
  { id: 'paloma-52', title: 'Chancha Vía Circuito — Amansará Mixtape', artist: 'Paloma del Río', mixDj: 'Chancha Vía Circuito', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/wonderwheel-recordings/chancha-via-circuito-amansara-mixtape', artworkUrl: 'https://i1.sndcdn.com/artworks-000090446469-0hodg0-t500x500.jpg', coverColor: '#e8a848', bpm: 108 },

  { id: 'paloma-53', title: 'Don Marcial', artist: 'Dengue Dengue Dengue', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/dengue/dengue-dengue-dengue-don', artworkUrl: 'https://i1.sndcdn.com/artworks-000032005899-1sfbwz-t500x500.jpg', coverColor: '#d45a3a', bpm: 110 },
  { id: 'paloma-55', title: 'La Cosecha', artist: 'Nicola Cruz', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/bespoke-musik/nicola-cruz-la-cosecha', artworkUrl: 'https://i1.sndcdn.com/artworks-000171333656-xqrdbw-t500x500.jpg', coverColor: '#e8a848', bpm: 112 },
  { id: 'paloma-56', title: 'Cumbia De Las Picaditas', artist: 'Sonido Gallo Negro', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/sonido-gallo-negro/cumbia-de-las-picaditas', artworkUrl: 'https://i1.sndcdn.com/artworks-000005503508-4fqtn0-t500x500.jpg', coverColor: '#d45a3a', bpm: 108 },
  { id: 'paloma-57', title: 'En Los Huesos', artist: 'Systema Solar', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/systema-solar/en-los-huesos-systema-solar', artworkUrl: 'https://i1.sndcdn.com/artworks-000082959014-i1kdeo-t500x500.jpg', coverColor: '#f5e6d0', bpm: 112 },
  { id: 'paloma-59', title: 'Lokumba', artist: 'Dengue Dengue Dengue', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/enchufada/dengue-dengue-dengue-lokumba', artworkUrl: 'https://i1.sndcdn.com/artworks-000053524925-guirrz-t500x500.jpg', coverColor: '#d45a3a', bpm: 115 },
  { id: 'paloma-61', title: 'Cryptic Nature', artist: 'Nicola Cruz', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/hauznated/nicola-cruz-cabaret038-a1cryptic-nature-1', artworkUrl: 'https://i1.sndcdn.com/artworks-XGLOhyyKh6yHlZgt-Kcx2Tg-t500x500.jpg', coverColor: '#e8a848', bpm: 108 },
  { id: 'paloma-63', title: 'Africa Lando', artist: 'Novalima', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/novalima/05-africa-land-1', artworkUrl: 'https://i1.sndcdn.com/artworks-000093121068-cm9qj5-t500x500.jpg', coverColor: '#f5e6d0', bpm: 112 },
  { id: 'paloma-65', title: 'Ilaló (feat. Mateo Kingman)', artist: 'Chancha Vía Circuito', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/wonderwheel-recordings/chancha-via-circuito-ilalo-ft-mateo-kingman', artworkUrl: 'https://i1.sndcdn.com/artworks-000339022389-77t7j4-t500x500.jpg', coverColor: '#d45a3a', bpm: 108 },
  { id: 'paloma-69', title: 'N\'Dini (feat. Ismael Kouyate)', artist: 'Nickodemus', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/rootsound/nickodemus-ndini-feat-ismael', artworkUrl: 'https://i1.sndcdn.com/artworks-000016943241-lzcsob-t500x500.jpg', coverColor: '#f5e6d0', bpm: 112 },
  { id: 'paloma-70', title: 'Moqueca', artist: 'Captain Planet', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/bastardjazz/captain-planet-zuzuka-poderosa', artworkUrl: 'https://i1.sndcdn.com/artworks-KMQyz8d7gJjgiTYz-tblUBQ-t500x500.jpg', coverColor: '#e8a848', bpm: 115 },
  { id: 'paloma-73', title: 'El Carnicero de Chicago', artist: 'Chicha Libre', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/crammed-discs/chicha', artworkUrl: 'https://i1.sndcdn.com/artworks-000020726425-jeiyi9-t500x500.jpg', coverColor: '#e8a848', bpm: 112 },
  { id: 'paloma-75', title: 'Chapinero', artist: 'Thornato', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/wonderwheel-recordings/thornato-chapinero', artworkUrl: 'https://i1.sndcdn.com/artworks-000157720865-q7fq7e-t500x500.jpg', coverColor: '#f5e6d0', bpm: 112 },
  { id: 'paloma-76', title: 'Nogoma', artist: 'Lua Preta', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/luapreta/nogoma', artworkUrl: 'https://i1.sndcdn.com/artworks-KvpGpHTu2TlBiFyP-95oClg-t500x500.jpg', coverColor: '#e8a848', bpm: 118 },


  { id: 'paloma-78', title: 'Inversions', artist: 'Nicola Cruz & Uji', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/multiculti/nicola-cruz-uji-inversions-mc038', artworkUrl: 'https://i1.sndcdn.com/artworks-000363857751-w8iy4z-t500x500.jpg', coverColor: '#f5e6d0', bpm: 110 },
  { id: 'paloma-79', title: 'Haarp', artist: 'Dengue Dengue Dengue', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/onthecornerrecords/dengue-dengue-dengue-b3-haarp-otcr12010-mstrd', artworkUrl: 'https://i1.sndcdn.com/artworks-000032005899-1sfbwz-t500x500.jpg', coverColor: '#e8a848', bpm: 118 },
  { id: 'paloma-80', title: 'Arena', artist: 'Barda', djId: 'dj-paloma', soundcloudUrl: 'https://soundcloud.com/selloregional/barda-arena', artworkUrl: 'https://i1.sndcdn.com/artworks-000082277208-gt8byq-t500x500.jpg', coverColor: '#d45a3a', bpm: 110 },

];

// ---- Public API ----

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

// Fallback durations when a track has no entry in TRACK_DURATIONS
const TRACK_SLOT = 300_000;   // 5 min fallback for individual tracks
const MIX_SLOT   = 2_100_000; // 35 min fallback for mixes

// Real durations in ms — fetched via verify-tracks.html
const TRACK_DURATIONS = {
  'mara-01': 460371, // 7:40
  'mara-02': 416549, // 6:56
  'mara-03': 251899, // 4:11
  'mara-26': 342335, // 5:42
  'mara-06': 455967, // 7:35
  'mara-27': 120059, // 2:00
  'mara-14': 2286028, // 38:06
  'mara-10': 518048, // 8:38
  'mara-07': 436175, // 7:16
  'mara-11': 416952, // 6:56
  'mara-08': 116036, // 1:56
  'mara-12': 418377, // 6:58
  'mara-13': 364153, // 6:04

  'mara-15': 120033, // 2:00
  'mara-18': 454034, // 7:34
  'mara-22': 424229, // 7:04
  'mara-28': 201796, // 3:21
  'mara-23': 242926, // 4:02
  'mara-20': 199497, // 3:19

  'mara-17': 296411, // 4:56
  'kei-02': 305660, // 5:05
  'kei-03': 237584, // 3:57
  'kei-05': 208588, // 3:28
  'kei-32': 266470, // 4:26
  'kei-27': 360287, // 6:00

  'kei-07': 518048, // 8:38
  'kei-08': 332909, // 5:32
  'kei-33': 458893, // 7:38
  'kei-11': 317050, // 5:17

  'kei-29': 473565, // 7:53
  'kei-18': 2315520, // 38:35
  'kei-13': 480436, // 8:00
  'kei-15': 431348, // 7:11
  'kei-16': 352287, // 5:52
  'kei-34': 272456, // 4:32
  'kei-30': 281392, // 4:41
  'kei-17': 456349, // 7:36
  'kei-22': 242926, // 4:02
  'kei-35': 310321, // 5:10

  'kei-24': 361228, // 6:01
  'zola-02': 302393, // 5:02
  'zola-03': 182570, // 3:02
  'zola-31': 124813, // 2:04
  'zola-26': 315143, // 5:15
  'zola-05': 388738, // 6:28
  'zola-06': 294322, // 4:54
  'zola-33': 289045, // 4:49
  'zola-27': 241502, // 4:01
  'zola-04': 2161703, // 36:01
  'zola-08': 315507, // 5:15
  'zola-09': 174838, // 2:54
  'zola-34': 423628, // 7:03
  'zola-28': 535769, // 8:55
  'zola-10': 369613, // 6:09
  'zola-12': 291709, // 4:51
  'zola-35': 120983, // 2:00
  'zola-29': 317257, // 5:17
  'zola-13': 215693, // 3:35

  'zola-14': 216652, // 3:36
  'zola-36': 440360, // 7:20
  'zola-17': 308665, // 5:08
  'zola-37': 357127, // 5:57
  'zola-19': 247458, // 4:07
  'zola-38': 566020, // 9:26
  'zola-23': 303726, // 5:03
  'zola-30': 356186, // 5:56
  'zola-21': 100624, // 1:40

  'zola-25': 342909, // 5:42
  'paloma-01': 414328, // 6:54
  'paloma-02': 128038, // 2:08
  'paloma-03': 198105, // 3:18
  'paloma-04': 210749, // 3:30
  'paloma-05': 226398, // 3:46
  'paloma-06': 217515, // 3:37
  'paloma-09': 319634, // 5:19
  'paloma-10': 300042, // 5:00
  'paloma-12': 257669, // 4:17
  'paloma-13': 193846, // 3:13
  'paloma-17': 170255, // 2:50
  'paloma-19': 243827, // 4:03
  'paloma-20': 276088, // 4:36
  'paloma-22': 243196, // 4:03
  'paloma-23': 257459, // 4:17
  'paloma-24': 230395, // 3:50

  'paloma-27': 224607, // 3:44
  'paloma-28': 348113, // 5:48
  'paloma-29': 213649, // 3:33
  'paloma-33': 217019, // 3:37
  'paloma-36': 345521, // 5:45
  'paloma-37': 180758, // 3:00
  'paloma-43': 242438, // 4:02
  'paloma-44': 288606, // 4:48
  'paloma-45': 240087, // 4:00
  'paloma-46': 132505, // 2:12
  'paloma-47': 340850, // 5:40
  'paloma-48': 222694, // 3:42
  'paloma-49': 264983, // 4:24
  'paloma-51': 370240, // 6:10
  'paloma-52': 1372183, // 22:52
  'paloma-53': 160092, // 2:40
  'paloma-55': 315640, // 5:15
  'paloma-56': 319625, // 5:19
  'paloma-57': 291291, // 4:51
  'paloma-59': 299156, // 4:59
  'paloma-61': 120033, // 2:00
  'paloma-63': 257957, // 4:17
  'paloma-65': 300801, // 5:00
  'paloma-69': 255470, // 4:15
  'paloma-70': 244402, // 4:04
  'paloma-73': 234850, // 3:54
  'paloma-75': 222348, // 3:42
  'paloma-76': 171050, // 2:51

  'paloma-78': 350700, // 5:50
  'paloma-79': 328285, // 5:28
  'paloma-80': 185982, // 3:05
};

function getTrackDuration(track) {
  if (TRACK_DURATIONS[track.id]) return TRACK_DURATIONS[track.id];
  return track.mixDj ? MIX_SLOT : TRACK_SLOT;
}

// Phase offset per DJ so the single mix per DJ doesn't coincide across DJs.
// Calculated so mixes fire ~40 min apart from each other:
//   Mara mix (Roger Gangi)    at ~0 min from epoch
//   Kei mix (Livo)            at ~40 min from epoch
//   Zola mix (DJ Lag)         at ~80 min from epoch
//   Paloma mix (Chancha)      at ~120 min from epoch
const DJ_PHASE_OFFSET = {
  'dj-mara':   108 * 60_000,
  'dj-kei':    132 * 60_000,
  'dj-zola':    44 * 60_000,
  'dj-paloma': 211 * 60_000,
};

function getRadioPosition(djId) {
  const tracks = getDJAlbums(djId);
  if (tracks.length === 0) return { index: 0, seekMs: 0 };

  let totalDuration = 0;
  for (const t of tracks) {
    totalDuration += getTrackDuration(t);
  }

  const offset = DJ_PHASE_OFFSET[djId] || 0;
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

