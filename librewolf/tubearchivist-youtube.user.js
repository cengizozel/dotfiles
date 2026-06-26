// ==UserScript==
// @name         TubeArchivist → YouTube Skin
// @namespace    https://github.com/cengizozel/dotfiles
// @version      1.22.0
// @description  Make self-hosted TubeArchivist look (and feel) like YouTube: masthead, left guide sidebar, card grid, watch page, dark/light themes.
// @author       cengiz
// @match        http://100.68.102.5:18000/*
// @match        http://localhost:18000/*
// @match        http://127.0.0.1:18000/*
// @icon         https://www.youtube.com/favicon.ico
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @noframes
// ==/UserScript==

/*
 * --------------------------------------------------------------------------
 *  TubeArchivist → YouTube Skin
 * --------------------------------------------------------------------------
 *  Pure restyle. It does NOT move/replace any React-managed DOM nodes, so it
 *  is resilient to TubeArchivist re-renders and updates. It only:
 *    - overrides TA's CSS custom properties (--main-bg, --highlight-bg, ...)
 *    - lays the existing .nav-items out as a fixed left "guide" sidebar (CSS)
 *    - injects its OWN elements into the masthead: hamburger, logo, search box
 *
 *  Toggle things at runtime via the Tampermonkey menu (the extension icon):
 *    • Theme: Dark / Light
 *    • Sidebar: show / hide
 *    • Skin: on / off
 *
 *  If TA ever changes its class names, only the CSS below needs touching.
 * --------------------------------------------------------------------------
 *
 *  TARGET TUBEARCHIVIST BUILD  (what this skin's selectors were written against)
 *  ---------------------------------------------------------------------------
 *  If a TA update breaks this skin, pull the exact build below and diff its
 *  frontend bundle class names against the selectors used here.
 *    image          : bbilly1/tubearchivist:latest
 *    image built    : 2026-03-28
 *    image id       : sha256:8babfe009c923a69ac054bc375145124f4f79b31b7be3484ad251aeaf4b1f3db
 *    repo digest    : bbilly1/tubearchivist@sha256:dfe723cf008520e1758ecc3e59e6ea8761dd10d5bb099cd87289e80f5bd66567
 *    frontend js    : /assets/index.CjzLN-6T.js
 *    frontend css   : /assets/index.DITeLYOe.css
 *    host           : ev  (tailscale 100.68.102.5:18000)
 *    noted          : 2026-06-26
 *  To compare after an update:  docker pull the repo digest above (or look at
 *  the new /assets/index.*.{js,css}) and check which classes/elements changed.
 * --------------------------------------------------------------------------
 */

(function () {
  'use strict';

  /* ======================= CONFIG ======================= */
  const CFG = {
    // Wordmark shown in the masthead. Set to 'YouTube' if you want the full cosplay.
    logoText: GM_getValue('logoText', 'TubeArchivist'),
    // 'dark' | 'light'
    theme: GM_getValue('theme', 'dark'),
    // left guide sidebar on/off
    sidebar: GM_getValue('sidebar', true),
    // master switch
    enabled: GM_getValue('enabled', true),
    // Pull Roboto from Google Fonts for max YT fidelity. Default OFF for privacy
    // (LibreWolf) -> uses locally installed Roboto / Noto Sans / system sans.
    googleFonts: GM_getValue('googleFonts', false),
    // number of grid columns (fewer columns = bigger thumbnails). We set an explicit
    // column count rather than a min-width, so every size step visibly changes the grid
    // (a minmax()+1fr grid keeps the same look between column-count thresholds).
    gridCols: GM_getValue('gridCols', 5),
    // flip TA's saved view mode to grid automatically (TA stores it server-side as list)
    forceGrid: GM_getValue('forceGrid', true),
    // open the full /video/<id> page on thumbnail click (comments + description),
    // instead of TA's inline ?videoId= quick player (no comments). Like YouTube.
    fullPageOnThumb: GM_getValue('fullPageOnThumb', true),
    sidebarWidth: 240,
    mastheadHeight: 56,
  };

  /* ===================== ICON ASSETS ====================
   * 24x24 Material-style line icons as data-URI SVGs, used as CSS masks so they
   * inherit the current text colour. (No '#' inside -> safe in a url() literal.)
   */
  const svg = (p, vb) =>
    `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='${vb || '0 0 24 24'}'><path d='${p}'/></svg>")`;

  const ICON = {
    home:    svg('M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'),
    channels:svg('M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 10v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-6 4l-6-3.27v6.53L16 16z'),
    playlists:svg('M3 10h11v2H3zm0-4h11v2H3zm0 8h7v2H3zm13-1v6l5-3z'),
    downloads:svg('M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'),
    menu:    svg('M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z'),
    search:  svg('M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'),
    theme:   svg('M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z'),
    resize:  svg('M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z'),
    reindex: svg('M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'),
    trash:   svg('M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'),
    playlistAdd: svg('M2 6v2h12V6H2zm0 4v2h9v-2H2zm0 4v2h9v-2H2zm14-3v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2z'),
  };

  /* ====================== THEMES ======================= */
  // Two palettes. We also tune --img-filter so TA's black SVG icons stay legible.
  const THEMES = {
    dark: {
      bg: '#0f0f0f',
      surface: '#1f1f1f',   // raised cards / boxes (description, comments, settings)
      chip: '#272727',      // hover, chips
      chipHover: '#3f3f3f',
      text: '#f1f1f1',
      text2: '#aaaaaa',
      border: '#303030',
      masthead: '#0f0f0f',
      red: '#ff0033',
      imgFilter: 'invert(0.9)',                 // black icon -> ~#e6e6e6
      scrollThumb: '#717171',
      subBtnBg: '#f1f1f1', subBtnText: '#0f0f0f',
    },
    light: {
      bg: '#ffffff',
      surface: '#f2f2f2',
      chip: '#f2f2f2',
      chipHover: '#e5e5e5',
      text: '#0f0f0f',
      text2: '#606060',
      border: '#e5e5e5',
      masthead: '#ffffff',
      red: '#ff0000',
      imgFilter: 'invert(0.36)',                // black icon -> ~#5c5c5c
      scrollThumb: '#cccccc',
      subBtnBg: '#0f0f0f', subBtnText: '#ffffff',
    },
  };

  /* ==================== CSS BUILDER ===================== */
  function buildCSS() {
    const t = THEMES[CFG.theme] || THEMES.dark;
    const SW = CFG.sidebarWidth + 'px';
    const MH = CFG.mastheadHeight + 'px';
    const COLS = CFG.gridCols;
    const colsAt = (n) => Math.min(COLS, n); // cap columns on narrower screens

    const fontImport = CFG.googleFonts
      ? "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');"
      : '';
    const FONT = `'Roboto','Noto Sans','Segoe UI',system-ui,Arial,sans-serif`;

    // error/red filter (for like / alert / logout-hover icons) -> approx red
    const REDFILTER = 'invert(15%) sepia(95%) saturate(4000%) hue-rotate(353deg) brightness(95%) contrast(110%)';

    return `
${fontImport}

/* ---- 1. THEME: override TA custom props on every element TA may set them on ---- */
html, body, #root {
  --main-bg: ${t.bg} !important;
  --main-font: ${t.text} !important;
  --accent-font-light: ${t.text} !important;
  --accent-font-dark: ${t.text2} !important;
  --highlight-bg: ${t.surface} !important;
  --highlight-error: ${t.red} !important;
  --highlight-error-light: #ff5b54 !important;
  --img-filter: ${t.imgFilter} !important;
  --img-filter-error: ${REDFILTER} !important;
}

/* ---- 2. Typography: swap TA's "Sen" font for Roboto/system everywhere ---- */
html, body,
a, p, i, li, span, label, td, th, h1, h2, h3, h4, h5, h6,
button, input, select, textarea,
.nav-item, .video-desc h3, .player-title h3 {
  font-family: ${FONT} !important;
}
body { background: ${t.bg} !important; color: ${t.text}; }
::selection { background: ${t.red}; color: #fff; }

/* nicer scrollbar */
html { scrollbar-color: ${t.scrollThumb} transparent !important; }
::-webkit-scrollbar { width: 12px; height: 12px; }
::-webkit-scrollbar-thumb { background: ${t.scrollThumb} !important; border-radius: 10px; border: 3px solid ${t.bg}; }
::-webkit-scrollbar-track { background: transparent; }

/* ---- 3. Hide TA's big banner; the masthead replaces it ---- */
.top-banner { display: none !important; }

/* ---- 4. MASTHEAD (restyle .top-nav into a sticky 56px bar) ---- */
.top-nav {
  display: flex !important;
  align-items: center;
  gap: 8px;
  height: ${MH};
  padding: 0 16px !important;
  background: ${t.masthead} !important;
  position: sticky; top: 0; z-index: 2100;
  box-shadow: ${CFG.theme === 'light' ? '0 1px 0 ' + t.border : 'none'};
}

/* hamburger + logo (injected by JS) */
.yt-mast-left { position: absolute; left: 16px; top: 0; height: ${MH}; display: flex; align-items: center; gap: 6px; z-index: 2; }
.yt-burger {
  width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
  background: transparent !important; display: flex; align-items: center; justify-content: center; padding: 0 !important;
  transform: none !important; flex: 0 0 auto;
}
.yt-burger:hover { background: ${t.chip} !important; }
.yt-burger i {
  width: 100%; height: 100%; display: block; margin: 0 !important; background: ${t.text};
  -webkit-mask: ${ICON.menu} center / 24px 24px no-repeat; mask: ${ICON.menu} center / 24px 24px no-repeat;
}
.yt-logo { display: flex; align-items: center; height: 40px; gap: 5px; cursor: pointer; user-select: none; padding: 0 6px; line-height: 1; }
.yt-logo .yt-play {
  width: 30px; height: 21px; background: ${t.red}; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; flex: 0 0 auto;
}
.yt-logo .yt-play::after {
  content: ''; width: 0; height: 0;
  border-style: solid; border-width: 5px 0 5px 9px; border-color: transparent transparent transparent #fff;
  margin-left: 2px;
}
.yt-logo .yt-word {
  font-weight: 700; font-size: 19px; line-height: 1; letter-spacing: -1.2px; color: ${t.text};
  font-family: ${FONT}; display: flex; align-items: center;
}

/* center search box (injected by JS) */
/* dead-centered on the masthead, independent of logo/icon widths */
.yt-search { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(560px, 42vw); display: flex; justify-content: center; }
.yt-search form { display: flex; width: 100%; }
.yt-search input {
  flex: 1 1 auto; min-width: 0; height: 38px; margin: 0 !important;
  background: ${CFG.theme === 'light' ? '#fff' : '#121212'} !important;
  color: ${t.text} !important;
  border: 1px solid ${t.border} !important; border-right: none !important;
  border-radius: 40px 0 0 40px !important; padding: 0 16px !important; font-size: 16px;
}
.yt-search input:focus { outline: none; border-color: #3ea6ff !important; box-shadow: inset 1px 0 0 #3ea6ff; }
.yt-search button {
  width: 64px; height: 38px; flex: 0 0 auto; cursor: pointer; transform: none !important;
  background: ${t.chip} !important; border: 1px solid ${t.border} !important;
  border-radius: 0 40px 40px 0 !important; display: grid; place-items: center; padding: 0 !important;
}
.yt-search button:hover { background: ${t.chipHover} !important; }
.yt-search button i {
  width: 22px; height: 22px; display: block; margin: 0 !important; background: ${t.text};
  -webkit-mask: ${ICON.search} center / 22px 22px no-repeat; mask: ${ICON.search} center / 22px 22px no-repeat;
}

/* TA's own right-side icons (search/gear/logout) -> YT account buttons */
.nav-icons {
  position: absolute !important; right: 14px; top: 50%; transform: translateY(-50%) !important; width: auto !important;
  display: flex !important; align-items: center; gap: 4px;
}
.nav-icons a, .nav-icons > img { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; }
.nav-icons a:hover, .nav-icons > img:hover { background: ${t.chip}; }
.nav-icons img { width: 24px !important; height: 24px; padding: 0 !important; filter: var(--img-filter); }

/* ---- 5. LEFT GUIDE SIDEBAR (lay out the existing .nav-items as a fixed rail) ---- */
.nav-items {
  position: fixed !important; top: ${MH}; left: 0; bottom: 0; width: ${SW}; box-sizing: border-box !important;
  display: flex !important; flex-direction: column; justify-content: flex-start !important;
  align-items: stretch; gap: 2px; padding: 12px !important;
  background: ${t.bg} !important; overflow-y: auto; z-index: 2000;
  border-right: 1px solid ${t.border} !important;   /* greyish divider when the sidebar is shown */
  transition: transform .15s ease;
}
.nav-item {
  display: flex !important; align-items: center; gap: 24px;
  font-size: 14px !important; line-height: 1; text-transform: capitalize;
  padding: 11px 12px !important; margin: 0 !important;
  border: none !important; border-radius: 10px;
  color: ${t.text} !important;
}
.nav-item:hover { background: ${t.chip} !important; }
/* each .nav-item is the lone child of its own <a>, so :nth-of-type can't tell them
   apart -> icons are assigned by label text in JS (decorateSidebar) via inline --ico.
   default is an empty (transparent) svg so undecorated items show no glyph. */
.nav-item { --ico: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'/>"); }
.nav-item::before {
  content: ''; width: 24px; height: 24px; flex: 0 0 auto;
  background-color: currentColor;
  -webkit-mask: var(--ico) center/24px no-repeat; mask: var(--ico) center/24px no-repeat;
}
.nav-items a.active .nav-item, .nav-items .nav-item.active { background: ${t.chip} !important; font-weight: 500; }

/* The masthead is its OWN .boxed-content rendered INSIDE .main-content, so shifting
   .main-content shifts the masthead too (logo gets pushed right). Instead: keep the
   masthead full-width/flush-left and inset only the routed page content past the sidebar. */
.main-content, .footer { transition: margin-left .15s ease; }
.footer { margin-left: ${SW}; }
.boxed-content, .boxed-content.boxed-4,
.boxed-content.boxed-5, .boxed-content.boxed-6, .boxed-content.boxed-7 {
  max-width: none !important; width: auto !important; margin: 0 !important;
  padding: 24px 24px 0 24px !important;
}
/* masthead wrapper: flush to the left edge so the logo reaches the corner */
.boxed-content:has(.top-nav) { padding: 0 !important; }
/* routed page content: inset past the fixed sidebar (every other boxed-content child) */
.main-content > .boxed-content:not(:has(.top-nav)) { margin-left: ${SW} !important; }
/* the inline (?videoId=) player on home/channel is a full-width .player-wrapper sibling -> inset it too */
.main-content > .player-wrapper { margin-left: ${SW} !important; }

/* sidebar hidden (hamburger or menu): slide the rail off-screen and expand the content.
   The masthead logo/search/icons are independent, so they always stay put. */
body.yt-hide-sidebar .nav-items { transform: translateX(-100%); }
body.yt-hide-sidebar .main-content > .boxed-content:not(:has(.top-nav)),
body.yt-hide-sidebar .main-content > .player-wrapper,
body.yt-hide-sidebar .footer { margin-left: 0 !important; }

/* ---- 6. VIDEO GRID -> YouTube cards ----
   real card DOM:  .video-desc > .video-desc-player(watched icons)
                                + .video-desc-details > div[ h3=CHANNEL , a.video-more>h2=TITLE ] + img.dot-button */
.view-controls { border: none !important; margin: 8px 0 4px 0 !important; }
.title-bar { padding-top: 12px !important; }
.title-bar h1 { font-size: 1.6em !important; font-weight: 700; }

/* denser, smaller-than-YouTube cards: override TA's fixed grid-N column counts with a
   responsive auto-fill so the column count follows the window and thumbnails stay compact */
.video-list.grid,
.video-list.grid.grid-2, .video-list.grid.grid-3, .video-list.grid.grid-4,
.video-list.grid.grid-5, .video-list.grid.grid-6, .video-list.grid.grid-7 {
  grid-template-columns: repeat(${COLS}, minmax(0, 1fr)) !important;
  grid-gap: 18px 14px !important;
}
/* cap columns on narrower windows (never more than the chosen count) */
@media (max-width: 1280px) { .video-list.grid, body.yt-force-grid .video-list.list { grid-template-columns: repeat(${colsAt(4)}, minmax(0,1fr)) !important; } }
@media (max-width: 900px)  { .video-list.grid, body.yt-force-grid .video-list.list { grid-template-columns: repeat(${colsAt(3)}, minmax(0,1fr)) !important; } }
@media (max-width: 600px)  { .video-list.grid, body.yt-force-grid .video-list.list { grid-template-columns: repeat(${colsAt(2)}, minmax(0,1fr)) !important; } }

.video-item { background: transparent !important; border-radius: 12px; }
.video-thumb-wrap, .video-thumb { border-radius: 12px; overflow: hidden; }
.video-thumb img { border-radius: 12px; display: block; width: 100%; }

/* watch-progress strip -> YT red, full width, flush to bottom (hidden at 0% width) */
.video-progress-bar { background: ${t.red} !important; height: 4px !important; bottom: 0 !important; }
/* hover play button, subtle */
.video-play { background: rgba(0,0,0,.7) !important; }

/* TA's multi-select checkbox sat on thumbnails as a stray white box (esp. on the
   downloads page). Reveal it only on hover and give it a clean rounded chip. */
.video-item-select-wrapper {
  background: rgba(0,0,0,.6) !important; border-radius: 6px !important;
  top: 8px !important; left: 8px !important; width: 18px !important; height: 18px !important; padding: 4px !important;
  opacity: 0; transition: opacity .15s ease;
}
.video-item:hover .video-item-select-wrapper { opacity: 1; }

/* TA's .video-tags are status/type badges (queued/ignored, vid_type, auto). They're only
   meaningful on the Downloads page (elsewhere the queued/ignored state reads wrong), so:
   - hide them globally,
   - on Downloads keep them at the original top-left thumbnail spot, ALWAYS visible (no
     hover), restyled as slick dark chips instead of TA's white hover box. */
.video-tags { display: none !important; }
body.yt-downloads .video-tags {
  display: flex !important; opacity: 1 !important; flex-wrap: wrap; gap: 4px;
  top: 8px; left: 8px; padding: 0 !important; max-width: calc(100% - 16px);
}
body.yt-downloads .video-tags span {
  background: rgba(0,0,0,.78) !important; color: #fff !important;
  border-radius: 6px; padding: 3px 7px !important; font-size: .7rem; font-weight: 500;
  line-height: 1.3; text-transform: capitalize;
}

/* desc block: drop the grey box, real YT type, stacked */
.video-desc.grid {
  background: transparent !important; padding: 12px 0 0 0 !important;
  display: flex !important; flex-direction: column; gap: 2px;
}
.video-desc.grid .video-desc-details { order: 1; display: flex; justify-content: space-between; align-items: flex-start; }
.video-desc.grid .video-desc-player  { order: 2; margin: 4px 0 0 0 !important; }

/* YT duration badge on the thumbnail (bottom-left, per request); JS fills .yt-dur */
.video-thumb-wrap { position: relative; }
.yt-dur {
  position: absolute; right: 8px; bottom: 8px; z-index: 5; pointer-events: none;
  background: rgba(0,0,0,.8); color: #fff; font-family: ${FONT};
  font-size: .78rem; font-weight: 500; line-height: 1; padding: 3px 5px; border-radius: 4px;
}
/* card meta row: small subtle watched toggle + grey relative-time (JS rewrites the span) */
.video-desc .video-desc-player { display: flex !important; align-items: center; gap: 6px; opacity: 1 !important; }
.video-desc .video-desc-player img { width: 16px !important; opacity: .5; }
.video-desc .video-desc-player span { color: ${t.text2} !important; font-size: .85rem !important; opacity: 1 !important; margin: 0 !important; }

/* channel/title block -> TITLE first (YT order), then channel */
.video-desc-details > div { display: flex !important; flex-direction: column; min-width: 0; }
.video-desc .video-more {
  order: -1; text-decoration: none !important; text-align: left !important; margin: 0 !important; width: 100%;
}
.video-desc .video-more h2 {
  text-transform: none !important; font-size: 1rem !important; font-weight: 500 !important;
  color: ${t.text} !important; line-height: 1.4; margin: 0 0 3px 0 !important;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.video-desc h3 {
  text-transform: none !important; font-size: .88rem !important; font-weight: 400 !important;
  color: ${t.text2} !important; margin: 0 !important;
}
.video-desc h3:hover { color: ${t.text} !important; }
.video-desc a { color: ${t.text2} !important; }
.video-desc img, .video-desc .dot-button { filter: var(--img-filter); }
.video-desc .dot-button { align-self: flex-start; width: 18px; }

/* list view -> YT search-result rows (smaller thumb, title-first, subtle controls) */
.video-item.list { background: transparent !important; grid-template-columns: 260px auto !important; gap: 16px; padding: 8px 0; align-items: flex-start; }
.video-desc.list { background: transparent !important; padding: 0 !important; display: flex !important; flex-direction: column; }
.video-desc.list .video-desc-details { order: 1; }
.video-desc.list .video-desc-player { order: 2; margin-top: 6px !important; }
.video-desc.list .video-more h2 { font-size: 1.15rem !important; -webkit-line-clamp: 2; }
.video-desc p { color: ${t.text2} !important; }

/* FORCE GRID: render TA's list view as the same YouTube card grid (default ON; menu toggle).
   TA stores the view mode server-side, so a CSS conversion guarantees a grid every load. */
body.yt-force-grid .video-list.list {
  display: grid !important;
  grid-template-columns: repeat(${COLS}, minmax(0, 1fr)) !important;
  grid-gap: 18px 14px !important;
}
body.yt-force-grid .video-item.list {
  display: flex !important; flex-direction: column !important;
  grid-template-columns: none !important; background: transparent !important; align-items: stretch;
}
body.yt-force-grid .video-item.list .video-thumb-wrap { width: 100% !important; }
body.yt-force-grid .video-desc.list { padding: 12px 0 0 0 !important; }
body.yt-force-grid .video-desc.list .video-more h2 { font-size: 1rem !important; }

/* download-queue rows reuse .video-desc, but their TITLE is an <h3> inside an external
   youtube link (channel is a plain link/span). Promote that h3 to a real YT title. */
.video-desc a[href*="youtube.com"] { color: ${t.text} !important; }
.video-desc a[href*="youtube.com"] h3 {
  text-transform: none !important; font-size: 1.05rem !important; font-weight: 500 !important;
  color: ${t.text} !important; line-height: 1.4; margin: 0 0 3px 0 !important;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* channel grid cards */
.channel-item .info-box, .channel-item.grid > .info-box { background: transparent !important; }
.channel-banner img { border-radius: 12px; }

/* ---- 7. BUTTONS -> YT pills ---- */
button {
  border-radius: 18px !important; padding: 8px 16px !important; font-weight: 500 !important;
  background: ${t.chip} !important; color: ${t.text} !important;
  transition: background .1s ease, transform .1s ease;
}
button:hover { background: ${t.chipHover} !important; color: ${t.text} !important; transform: none !important; }
button:disabled:hover { background: ${t.chip} !important; }
.danger-button { background: ${t.red} !important; color: #fff !important; }
.danger-button:hover { filter: brightness(1.1); }
/* the "Unsubscribe"/"Subscribe" style toggle */
.unsubscribe { background: ${t.chip} !important; color: ${t.text} !important; }
/* JS tags a real Subscribe button with .yt-subscribe */
button.yt-subscribe { background: ${t.subBtnBg} !important; color: ${t.subBtnText} !important; }

/* form inputs */
input:not(.yt-search input), select, textarea {
  background: ${t.chip} !important; color: ${t.text} !important;
  border: 1px solid ${t.border} !important; border-radius: 8px !important;
}

/* ---- 8. WATCH PAGE ---- */
/* TA makes .video-player 100vh + align-content:space-evenly, which shoves the title far
   below the video. Let it size to its content so the title sits right under the video. */
.video-player { height: auto !important; align-content: start !important; gap: 0 !important; }
.video-main { margin: 0 !important; }
/* player box follows the theme (was hard #000, which looked wrong in light mode) */
.player-wrapper { background: ${t.bg} !important; border-radius: 12px; margin: 0 0 12px 0 !important; overflow: hidden; }
.video-main, .video-player { background: ${t.bg} !important; }
.player-wrapper.theater-mode { border-radius: 0; }
/* the <video> element's own letterbox bg is black by default -> theme it too */
.video-main video, .video-player video { border-radius: 0; background: ${t.bg} !important; }
.player-title { padding-top: 2px !important; position: relative; }
.player-title > h3 { margin: 4px 0 6px 0 !important; }

/* /video/ page: TA stacks player margin (20px) + boxed-content padding (24px) +
   .title-bar padding-top (30px) => a big gap before the title. Collapse it. */
body.yt-video .player-wrapper { margin-bottom: 0 !important; }
body.yt-video .main-content > .boxed-content:not(:has(.top-nav)) { padding-top: 0 !important; }
body.yt-video .title-bar { padding-top: 14px !important; }

/* icons on the /video/ action buttons (Reindex / Download File / Delete / Add to playlist) */
.button-box button { display: inline-flex !important; align-items: center; gap: 7px; }
.yt-btn-ico { width: 17px; height: 17px; display: inline-block; flex: 0 0 auto; background: currentColor;
  -webkit-mask: var(--ico) center / 17px 17px no-repeat; mask: var(--ico) center / 17px 17px no-repeat; }
.player-title h3 { text-transform: none !important; font-size: 1.4rem !important; font-weight: 700; color: ${t.text} !important; width: 100%; }
.player-title .close-button { position: absolute; top: 14px; right: 0; width: 24px !important; }
.player-title .thumb-icon { display: inline-flex; align-items: center; }
.player-title .thumb-icon img { width: 22px !important; }
.player-stats { float: none !important; display: flex !important; gap: 12px; margin-top: 6px !important; }
.player-stats span { color: ${t.text2} !important; margin: 0 !important; }
/* hide the "no sponsor segments added" notice entirely */
.sponsorblock, #sponsorblock { display: none !important; }
.description-box, .info-box-item, .notification, .playlist-wrap, .icon-text, .settings-group {
  border-radius: 12px !important;
}
.description-box { background: ${t.surface} !important; }
.timestamp-link { color: #3ea6ff !important; }

/* comments -> YouTube style: no grey box; letter-avatar + author/time + text + meta;
   replies toggle as a blue text button; replies indented under the comment. */
.comments-section { background: transparent !important; border-radius: 0 !important; padding: 0 !important; margin-top: 24px !important; }
.comments-section > h2 { font-size: 1.5rem !important; font-weight: 700; margin-bottom: 16px; }
.comment-box { display: grid !important; grid-template-columns: 40px 1fr; column-gap: 14px; row-gap: 2px; padding: 14px 0 !important; align-items: start; }
.comment-box > .yt-avatar { grid-column: 1; grid-row: 1 / -1; align-self: start; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 600; font-size: 1.05rem; user-select: none; }
.comment-box > :not(.yt-avatar) { grid-column: 2; min-width: 0; }
.comment-box h3 { font-size: .85rem !important; font-weight: 500 !important; color: ${t.text} !important; text-transform: none !important; margin: 0 !important; line-break: normal !important; }
.comment-highlight { background: ${t.chip} !important; color: ${t.text} !important; padding: 2px 8px !important; border-radius: 8px; width: fit-content; }
.comment-box > p { color: ${t.text} !important; margin: 2px 0 6px 0 !important; line-height: 1.45; }
.comment-meta { color: ${t.text2} !important; font-size: .8rem; display: flex !important; align-items: center; gap: 6px; }
.comment-meta span, .comment-meta .thumb-icon { color: ${t.text2} !important; }
.comment-meta .thumb-icon img { width: 16px !important; }
.comment-like img { filter: var(--img-filter) !important; }
.comment-box > button { background: transparent !important; color: #3ea6ff !important; font-weight: 600 !important; padding: 6px 12px !important; border-radius: 18px !important; margin-top: 2px; width: fit-content; }
.comment-box > button:hover { background: rgba(62,166,255,.14) !important; color: #3ea6ff !important; transform: none !important; }
[id="toggle-icon"] { font-size: .7em; margin-right: 5px; }
.comments-replies { border-left: none !important; padding-left: 0 !important; margin-top: 4px !important; }
.comments-replies .comment-box { grid-template-columns: 32px 1fr; }
.comments-replies .yt-avatar { width: 32px !important; height: 32px !important; font-size: .9rem !important; }

/* info boxes / stats tiles */
.info-box-item { background: ${t.surface} !important; }

/* ---- 9. PAGINATION / MISC ---- */
.pagination-item { border-radius: 18px !important; border-color: ${t.border} !important; }
.view-icons img, .grid-count img { filter: var(--img-filter); }

/* with force-grid on, only the view-MODE toggles (grid/list/table) and the column +/- are
   redundant -> hide just those by icon src; keep filter, sort, and my injected controls. */
body.yt-force-grid .view-icons img[src*="gridview" i],
body.yt-force-grid .view-icons img[src*="listview" i],
body.yt-force-grid .view-icons img[src*="tableview" i] { display: none !important; }
body.yt-force-grid .grid-count { display: none !important; }

/* in-page controls injected into the view-controls bar (theme + thumbnail size).
   Force uniform height + vertical margins on imgs AND my buttons so they share one baseline. */
.view-icons { align-items: center !important; }
.view-icons img { width: 24px !important; height: 32px !important; object-fit: contain; margin: 0 8px !important; }
.view-icons .yt-ctl { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 32px; margin: 0 2px; cursor: pointer; border-radius: 50%; }
.view-icons .yt-ctl:hover { background: ${t.chip}; }
.view-icons .yt-ctl i { width: 22px; height: 22px; display: block; margin: 0 !important; background: ${t.text};
  -webkit-mask: var(--ico) center / 22px 22px no-repeat; mask: var(--ico) center / 22px 22px no-repeat; }
.footer { background: ${t.bg} !important; border-top: 1px solid ${t.border}; }
.footer-colors { display: none !important; }

/* loading spinner colour */
.lds-ring div { border-color: ${t.red} transparent transparent transparent !important; }

/* ---- 10. RESPONSIVE: collapse sidebar on narrow screens ---- */
@media (max-width: 1000px) {
  .nav-items { transform: translateX(-100%); }
  .main-content, .footer { margin-left: 0 !important; }
  .video-item.list { grid-template-columns: 240px auto !important; }
}
`;
  }

  /* ================= STYLE INJECTION ================= */
  let styleEl;
  function applyStyle() {
    if (!CFG.enabled) { if (styleEl) styleEl.textContent = ''; return; }
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'yt-skin-style';
      (document.head || document.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = buildCSS();
  }

  /* ================= BODY STATE FLAGS ================ */
  function applyBodyFlags() {
    const b = document.body;
    if (!b) return;
    b.classList.toggle('yt-hide-sidebar', !CFG.sidebar);
    b.classList.toggle('yt-force-grid', !!CFG.forceGrid);
  }

  /* ================= MASTHEAD ENHANCERS ============== */
  function enhanceMasthead() {
    const nav = document.querySelector('.top-nav');
    if (!nav || nav.querySelector('.yt-mast-left')) return; // already done

    // left cluster: hamburger + logo, inserted as the first masthead child
    const left = document.createElement('div');
    left.className = 'yt-mast-left';

    const burger = document.createElement('button');
    burger.className = 'yt-burger';
    burger.title = 'Toggle sidebar';
    burger.innerHTML = '<i></i>';
    burger.addEventListener('click', () => {
      CFG.sidebar = !CFG.sidebar;
      GM_setValue('sidebar', CFG.sidebar);
      applyBodyFlags();
    });

    const logo = document.createElement('div');
    logo.className = 'yt-logo';
    logo.title = 'Home';
    logo.innerHTML = `<span class="yt-play"></span><span class="yt-word"></span>`;
    logo.querySelector('.yt-word').textContent = CFG.logoText;
    logo.addEventListener('click', () => spaNavigate('/'));

    left.appendChild(burger);
    left.appendChild(logo);
    nav.insertBefore(left, nav.firstChild);

    // center search, inserted right before TA's icon cluster
    const icons = nav.querySelector('.nav-icons');
    const search = document.createElement('div');
    search.className = 'yt-search';
    search.innerHTML =
      `<form><input type="text" placeholder="Search" aria-label="Search"><button type="submit" title="Search"><i></i></button></form>`;
    const form = search.querySelector('form');
    const input = search.querySelector('input');
    form.addEventListener('submit', (e) => { e.preventDefault(); runSearch(input.value.trim()); });
    if (icons) nav.insertBefore(search, icons); else nav.appendChild(search);
  }

  // Tag a real "Subscribe" button so CSS can paint it like YT's.
  function tagSubscribe() {
    document.querySelectorAll('button:not(.yt-tagged)').forEach((btn) => {
      const txt = (btn.textContent || '').trim().toLowerCase();
      if (txt === 'subscribe') btn.classList.add('yt-subscribe');
      btn.classList.add('yt-tagged');
    });
  }

  // Prepend an icon to the /video/ action buttons (Reindex / Download File / Delete / Add to playlist).
  const ACTION_ICONS = [
    ['reindex', ICON.reindex],
    ['download file', ICON.downloads],
    ['delete', ICON.trash],
    ['add to playlist', ICON.playlistAdd],
  ];
  function decorateActionButtons() {
    document.querySelectorAll('.button-box button, #reindex-button button').forEach((btn) => {
      if (btn.querySelector('.yt-btn-ico')) return;
      const label = (btn.textContent || '').trim().toLowerCase();
      const match = ACTION_ICONS.find(([t]) => label.startsWith(t));
      if (!match) return;
      const i = document.createElement('i');
      i.className = 'yt-btn-ico';
      i.style.setProperty('--ico', match[1]);
      btn.insertBefore(i, btn.firstChild);
    });
  }

  // Assign a distinct guide icon to each sidebar item by its label text.
  // (Inline custom property -> survives React re-renders; :nth-of-type can't be used
  // because each .nav-item is the sole child of its own <a> wrapper.)
  const NAV_ICONS = { home: ICON.home, channels: ICON.channels, playlists: ICON.playlists, downloads: ICON.downloads };
  function decorateSidebar() {
    document.querySelectorAll('.nav-items .nav-item').forEach((el) => {
      const ico = NAV_ICONS[(el.textContent || '').trim().toLowerCase()];
      if (ico && el.style.getPropertyValue('--ico') !== ico) el.style.setProperty('--ico', ico);
    });
  }

  // "18m 12s" / "1h 5m 3s" -> "18:12" / "1:05:03" (YouTube clock format)
  function durToClock(s) {
    if (!s) return '';
    const h = (s.match(/(\d+)\s*h/) || [])[1];
    const m = (s.match(/(\d+)\s*m/) || [])[1];
    const sec = (s.match(/(\d+)\s*s/) || [])[1];
    if (h == null && m == null && sec == null) return s.trim(); // already "18:12" or unknown
    const pad = (n) => String(+n || 0).padStart(2, '0');
    return (+h > 0) ? `${+h}:${pad(m)}:${pad(sec)}` : `${+m || 0}:${pad(sec)}`;
  }

  // "6/25/2026" -> "3 days ago" (YouTube-style relative upload time)
  function relativeTime(str) {
    if (!str) return '';
    const t = Date.parse(str.trim());
    if (isNaN(t)) return '';
    let sec = Math.floor((Date.now() - t) / 1000);
    if (sec < 45) return 'just now';
    const U = [['year', 31557600], ['month', 2629800], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [name, n] of U) { const v = Math.floor(sec / n); if (v >= 1) return `${v} ${name}${v > 1 ? 's' : ''} ago`; }
    return 'just now';
  }

  // Per card: lift the duration onto a thumbnail badge and rewrite the date as relative time.
  // Card meta is one span: "<date> | <duration>" inside .video-desc-player.
  function decorateCards() {
    document.querySelectorAll('.video-item').forEach((item) => {
      const wrap = item.querySelector('.video-thumb-wrap');
      const span = item.querySelector('.video-desc-player span');
      // duration badge + relative upload time (only when the meta span exists)
      if (wrap && span) {
        const raw = span.dataset.ytRaw || span.textContent || '';
        if (raw && !span.dataset.ytRaw) span.dataset.ytRaw = raw;
        const bar = raw.indexOf('|');
        const datePart = (bar >= 0 ? raw.slice(0, bar) : raw).trim();
        const durPart = bar >= 0 ? raw.slice(bar + 1).trim() : '';
        if (durPart) {
          let badge = wrap.querySelector('.yt-dur');
          if (!badge) { badge = document.createElement('span'); badge.className = 'yt-dur'; wrap.appendChild(badge); }
          const clock = durToClock(durPart);
          if (badge.textContent !== clock) badge.textContent = clock;
        }
        const rel = relativeTime(datePart) || datePart;
        if (span.textContent !== rel) span.textContent = rel;
      }
    });
  }

  // Tag the body with the current route so CSS can scope page-specific tweaks
  // (e.g. the status badges only make sense on /downloads/).
  function applyRoute() {
    const b = document.body;
    if (!b) return;
    b.classList.toggle('yt-downloads', location.pathname.startsWith('/downloads'));
    b.classList.toggle('yt-video', location.pathname.startsWith('/video/'));
  }

  // TA comments have no avatar data, so give each a YouTube-style letter avatar
  // (initial + a stable colour derived from the author name).
  function avatarColor(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return `hsl(${h}, 42%, 45%)`;
  }
  function decorateComments() {
    document.querySelectorAll('.comment-box').forEach((box) => {
      if (box.querySelector(':scope > .yt-avatar')) return;
      const h3 = box.querySelector(':scope > h3');
      if (!h3) return;
      const name = (h3.textContent || '').replace(/^@/, '').trim() || '?';
      const av = document.createElement('div');
      av.className = 'yt-avatar';
      av.textContent = name.charAt(0).toUpperCase();
      av.style.background = avatarColor(name);
      box.insertBefore(av, box.firstChild);
    });
  }

  // Add theme + thumbnail-size controls into TA's view-controls bar (the row with the
  // grid/list/table icons), so they're reachable without the Tampermonkey menu.
  const THUMB_COLS = [6, 5, 4, 3]; // fewer columns -> bigger thumbnails; cycle wraps to smallest
  function mkViewCtl(act, icon, title) {
    const b = document.createElement('span');
    b.className = 'yt-ctl'; b.dataset.ytAct = act; b.title = title;
    const i = document.createElement('i'); i.style.setProperty('--ico', icon);
    b.appendChild(i);
    return b;
  }
  function enhanceViewControls() {
    document.querySelectorAll('.view-icons').forEach((bar) => {
      if (bar.querySelector('.yt-ctl')) return;
      bar.appendChild(mkViewCtl('theme', ICON.theme, 'Toggle dark / light'));
      bar.appendChild(mkViewCtl('size', ICON.resize, `Thumbnail size (${CFG.gridCols} columns)`));
    });
  }
  // Delegated click handler: a per-button listener can be lost when React replaces the
  // controls bar (that's the "first click does nothing" symptom). One document-level
  // listener handles clicks on any current-or-future .yt-ctl reliably.
  function onCtlClick(e) {
    const ctl = e.target.closest ? e.target.closest('[data-yt-act]') : null;
    if (!ctl) return;
    if (ctl.dataset.ytAct === 'theme') {
      CFG.theme = CFG.theme === 'dark' ? 'light' : 'dark';
      GM_setValue('theme', CFG.theme); applyStyle();
    } else if (ctl.dataset.ytAct === 'size') {
      CFG.gridCols = THUMB_COLS[(THUMB_COLS.indexOf(CFG.gridCols) + 1) % THUMB_COLS.length];
      GM_setValue('gridCols', CFG.gridCols); applyStyle();
      document.querySelectorAll('.yt-ctl[data-yt-act="size"]').forEach((b) => { b.title = `Thumbnail size (${CFG.gridCols} columns)`; });
    }
  }

  // Route a thumbnail click to the full /video/<id> page (comments + description),
  // instead of TA's inline ?videoId= quick player. Capture phase so we intercept
  // before TA's own React onClick; the card's title link already targets /video/<id>.
  function onThumbClick(e) {
    if (!CFG.fullPageOnThumb || !e.target.closest) return;
    const thumb = e.target.closest('.video-thumb, .video-thumb-wrap');
    if (!thumb) return;
    // leave the multi-select checkbox / action buttons (e.g. downloads page) alone
    if (e.target.closest('button, input, .video-item-select, .video-item-select-wrapper')) return;
    const item = thumb.closest('.video-item');
    // the card's title link already points at the proper /video/<id> page; reuse its href
    const link = item && item.querySelector('a[href*="/video/"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    // beat TA's own onClick (which would set ?videoId=) and go straight to the clean URL
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    location.assign(href);
  }

  /* ================= NAVIGATION / SEARCH ============= */
  // Use TA's own React-Router links so we stay a SPA (no full reload).
  function spaNavigate(path) {
    const a = document.querySelector(`.nav-items a[href="${path}"], .nav-items a[href="${path.replace(/\/$/, '')}"]`);
    if (a) { a.click(); return; }
    location.assign(path);
  }

  function runSearch(q) {
    // go to the search page (SPA nav if we're not already there)
    if (!location.pathname.startsWith('/search')) {
      const link = document.querySelector('.nav-icons a[href*="search" i]');
      if (link) link.click(); else location.assign('/search/');
    }
    if (q) fillNativeSearch(q, 0);
  }

  // TA's search input is a controlled React field: value=state, onChange updates state,
  // and onKeyDown===Enter runs the search against the *current* state. So we must:
  //   1) set value via the native setter, 2) fire 'input' so React commits the state,
  //   3) then dispatch keydown Enter so the handler (now closed over the new state) searches.
  function fillNativeSearch(q, tries) {
    if (tries > 60) return; // ~5s of polling for the field to mount
    const input = document.querySelector('.multi-search-box input');
    if (!input) { setTimeout(() => fillNativeSearch(q, tries + 1), 80); return; }
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, q);
    input.dispatchEvent(new Event('input', { bubbles: true })); // -> onChange -> state = q
    input.focus();
    setTimeout(() => {
      const ev = { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 };
      input.dispatchEvent(new KeyboardEvent('keydown', ev));
      input.dispatchEvent(new KeyboardEvent('keyup', ev));
    }, 40);
  }

  /* ================= MENU COMMANDS =================== */
  function registerMenu() {
    GM_registerMenuCommand(
      (CFG.theme === 'dark' ? '🌙→☀️ Switch to Light' : '☀️→🌙 Switch to Dark'),
      () => { CFG.theme = CFG.theme === 'dark' ? 'light' : 'dark'; GM_setValue('theme', CFG.theme); applyStyle(); refreshMenu(); }
    );
    GM_registerMenuCommand(
      (CFG.sidebar ? '🚫 Hide guide sidebar' : '📑 Show guide sidebar'),
      () => { CFG.sidebar = !CFG.sidebar; GM_setValue('sidebar', CFG.sidebar); applyBodyFlags(); applyStyle(); refreshMenu(); }
    );
    GM_registerMenuCommand(
      (CFG.googleFonts ? '🔌 Roboto: Google Fonts (ON)' : '🔒 Roboto: local only (no network)'),
      () => { CFG.googleFonts = !CFG.googleFonts; GM_setValue('googleFonts', CFG.googleFonts); applyStyle(); refreshMenu(); }
    );
    GM_registerMenuCommand(
      (CFG.forceGrid ? '▦ Force grid view (ON)' : '▤ Force grid view (OFF)'),
      () => { CFG.forceGrid = !CFG.forceGrid; GM_setValue('forceGrid', CFG.forceGrid); applyBodyFlags(); refreshMenu(); }
    );
    GM_registerMenuCommand(
      (CFG.fullPageOnThumb ? '▶ Thumbnail opens full page (ON)' : '▷ Thumbnail opens inline player (OFF)'),
      () => { CFG.fullPageOnThumb = !CFG.fullPageOnThumb; GM_setValue('fullPageOnThumb', CFG.fullPageOnThumb); refreshMenu(); }
    );
    GM_registerMenuCommand(
      `🖼️ Thumbnail size: ${CFG.gridCols} columns (click to cycle)`,
      () => {
        const cols = [6, 5, 4, 3];
        CFG.gridCols = cols[(cols.indexOf(CFG.gridCols) + 1) % cols.length];
        GM_setValue('gridCols', CFG.gridCols); applyStyle(); refreshMenu();
      }
    );
    GM_registerMenuCommand(
      (CFG.enabled ? '⏻ Disable YouTube skin' : '✅ Enable YouTube skin'),
      () => { CFG.enabled = !CFG.enabled; GM_setValue('enabled', CFG.enabled); location.reload(); }
    );
  }
  // Tampermonkey can't remove menu items live; reload re-registers with new labels.
  function refreshMenu() { /* labels refresh on next page load */ }

  /* ================= BOOTSTRAP ====================== */
  applyStyle();          // at document-start, before first paint (kills the flash)
  registerMenu();
  document.addEventListener('click', onCtlClick, true); // delegated controls (size/theme)
  document.addEventListener('click', onThumbClick, true); // thumbnail -> full /video/ page

  function boot() {
    applyBodyFlags();
    applyRoute();
    enhanceMasthead();
    decorateSidebar();
    decorateCards();
    decorateComments();
    enhanceViewControls();
    tagSubscribe();
    decorateActionButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // TA is a SPA: re-run enhancers if React swaps things out, and after route changes.
  // Debounced so we don't churn on every single mutation.
  let pending = false;
  const mo = new MutationObserver(() => {
    if (!CFG.enabled || pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (document.head && !document.head.querySelector('#yt-skin-style')) applyStyle();
      applyRoute();
      enhanceMasthead();
      decorateSidebar();
      decorateCards();
      decorateComments();
      enhanceViewControls();
      tagSubscribe();
    decorateActionButtons();
    });
  });
  if (document.documentElement) {
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
