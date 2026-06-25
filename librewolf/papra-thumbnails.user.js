// ==UserScript==
// @name         Papra PDF Thumbnails + Sidebar Toggle + Grid
// @namespace    papra.thumbs
// @version      2.6
// @description  Page-1 thumbnails (with skeleton loader), collapsible sidebar, and a card grid for Papra
// @match        http://192.168.1.24:1221/*
// @match        http://100.68.102.5:1221/*
// @match        http://localhost:1221/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

const PAPRA_GRID = true;   // set false for the plain list

/* =====================================================================
 * 1) PDF THUMBNAILS  (placeholder injected immediately -> shimmer -> fill)
 * ===================================================================== */
(function () {
  'use strict';
  const LINK_SEL  = 'a[href*="/documents/doc_"]';
  const THUMB_W   = 240;
  const CACHE     = true;
  const CACHE_KEY = 'pthumb3:';   // bump to re-render all thumbnails

  const pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) { console.warn('[papra-thumbs] pdf.js failed to load'); return; }
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const style = document.createElement('style');
  style.textContent = `
    @keyframes pthumb-shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
    .pthumb {
      display:block; width:100%; max-width:160px; aspect-ratio:3/4;
      border:1px solid #2a2a30; border-radius:8px; margin:0 0 8px 0;
      background-color:#15151a; background-repeat:no-repeat;
      background-position:top center; background-size:cover;
    }
    .pthumb.loading {
      background-image:linear-gradient(100deg,#16161c 30%,#24242e 50%,#16161c 70%) !important;
      background-size:220% 100% !important;
      animation:pthumb-shimmer 1.25s ease-in-out infinite !important;
    }
  `;
  document.head.appendChild(style);

  const RE  = /\/organizations\/(org_[a-z0-9]+)\/documents\/(doc_[a-z0-9]+)/i;
  const mem = new Map();
  const cGet = id => {
    if (mem.has(id)) return mem.get(id);
    if (CACHE) { try { const v = localStorage.getItem(CACHE_KEY + id); if (v) { mem.set(id, v); return v; } } catch (e) {} }
    return null;
  };
  const cSet = (id, v) => { mem.set(id, v); if (CACHE) { try { localStorage.setItem(CACHE_KEY + id, v); } catch (e) {} } };

  async function makeThumb(orgId, docId) {
    const cached = cGet(docId);
    if (cached) return cached;
    const url = `/api/organizations/${orgId}/documents/${docId}/file`;
    try {
      const pdf  = await pdfjsLib.getDocument({ url, withCredentials: true, disableAutoFetch: true, disableStream: false }).promise;
      const page = await pdf.getPage(1);
      const base = page.getViewport({ scale: 1 });
      const vp   = page.getViewport({ scale: THUMB_W / base.width });
      const cv   = document.createElement('canvas');
      cv.width = vp.width; cv.height = vp.height;
      await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
      const data = cv.toDataURL('image/webp', 0.72);
      cSet(docId, data);
      return data;
    } catch (e) { return url; }
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const ph = e.target; io.unobserve(ph);
      makeThumb(ph.dataset.org, ph.dataset.doc).then((src) => {
        ph.style.backgroundImage = `url("${src}")`;
        ph.classList.remove('loading');
      }).catch(() => { ph.classList.remove('loading'); });
    }
  }, { rootMargin: '400px' });

  function scan() {
    document.querySelectorAll(LINK_SEL).forEach(a => {
      if (a.dataset.pthumb) return;
      const m = (a.getAttribute('href') || '').match(RE);
      if (!m) return;
      a.dataset.pthumb = '1';
      const ph = document.createElement('div');
      ph.className = 'pthumb loading';
      ph.dataset.org = m[1]; ph.dataset.doc = m[2];
      a.insertBefore(ph, a.firstChild);      // reserves correct shape immediately
      io.observe(ph);
    });
  }
  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 250); })
    .observe(document.body, { childList: true, subtree: true });
  scan();
})();

/* =====================================================================
 * 2) COLLAPSIBLE SIDEBAR
 * ===================================================================== */
(function () {
  'use strict';
  const KEY = 'papra_sb_hidden';
  const chevron = dir =>
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" ' +
    'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="' +
    (dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6') + '"/></svg>';
  let sb = null, btn = null;

  function findSidebar() {
    const labels = ['Home', 'Documents', 'Tags', 'Settings', 'Members'];
    const links = [...document.querySelectorAll('a')].filter(a => labels.includes((a.textContent || '').trim()));
    if (links.length < 2) return null;
    let anc = links[0];
    while (anc.parentElement && !links.every(l => anc.contains(l))) anc = anc.parentElement;
    let el = anc;
    for (let i = 0; i < 5 && el.parentElement; i++) {
      const p = el.parentElement;
      if (p.getBoundingClientRect().width > el.getBoundingClientRect().width * 1.4) break;
      el = p;
    }
    return el;
  }
  function place(hidden) {
    if (!btn) return;
    if (hidden || !sb || sb.style.display === 'none') { btn.style.left = '6px'; return; }
    btn.style.left = Math.max(2, sb.getBoundingClientRect().right - 11) + 'px';
  }
  function setHidden(h) {
    if (!sb) return;
    if (h) { if (!('od' in sb.dataset)) sb.dataset.od = sb.style.display || ''; sb.style.display = 'none'; }
    else   { sb.style.display = sb.dataset.od || ''; }
    if (btn) { btn.innerHTML = chevron(h ? 'right' : 'left'); btn.title = (h ? 'Show' : 'Hide') + ' sidebar'; }
    place(h);
    try { localStorage.setItem(KEY, h ? '1' : '0'); } catch (e) {}
  }
  function makeBtn() {
    btn = document.createElement('button');
    btn.style.cssText =
      'position:fixed;top:50%;transform:translateY(-50%);z-index:99999;' +
      'width:22px;height:48px;display:flex;align-items:center;justify-content:center;padding:0;' +
      'border:1px solid #334155;border-radius:6px;background:rgba(27,27,31,.85);' +
      'color:#94a3b8;cursor:pointer;opacity:.55;transition:opacity .15s;';
    btn.onmouseenter = () => btn.style.opacity = '1';
    btn.onmouseleave = () => btn.style.opacity = '.55';
    btn.onclick = () => setHidden(localStorage.getItem(KEY) !== '1');
    document.body.appendChild(btn);
  }
  function init() {
    sb = findSidebar();
    if (!sb) return false;
    if (!btn) makeBtn();
    setHidden(localStorage.getItem(KEY) === '1');
    return true;
  }
  let tries = 0;
  const iv = setInterval(() => { if (init() || ++tries > 40) clearInterval(iv); }, 400);
  window.addEventListener('resize', () => { if (sb) place(localStorage.getItem(KEY) === '1'); });
})();

/* =====================================================================
 * 3) CARD GRID  (Papra renders documents as a <table> — override its display)
 * ===================================================================== */
(function () {
  'use strict';
  if (!PAPRA_GRID) return;
  const COLW = 230; // minimum card width (px)

  const css = `
    table[data-pgrid]{ display:block !important; width:100% !important; border:0 !important; }
    table[data-pgrid] > thead{ display:none !important; }
    table[data-pgrid] > tbody{
      display:grid !important;
      grid-template-columns:repeat(auto-fill,minmax(${COLW}px,1fr)) !important;
      gap:14px !important; align-items:start !important; padding:6px 2px !important;
    }
    table[data-pgrid] > tbody > tr{
      display:flex !important; flex-direction:column !important; gap:8px !important;
      background:#17171c !important; border:1px solid #26262e !important; border-radius:12px !important;
      padding:10px !important; margin:0 !important;
      box-shadow:0 1px 2px rgba(0,0,0,.25) !important;
      transition:border-color .15s ease, transform .1s ease !important;
    }
    table[data-pgrid] > tbody > tr:hover{ border-color:#3b82f6 !important; transform:translateY(-2px) !important; }
    table[data-pgrid] > tbody > tr > td{
      display:block !important; width:auto !important; max-width:100% !important;
      padding:0 !important; border:0 !important; white-space:normal !important; vertical-align:top !important;
    }
    /* name cell: stack icon/content vertically, full width, hide the small file-type icon box */
    table[data-pgrid] .max-w-500px{ display:flex !important; flex-direction:column !important; align-items:stretch !important; max-width:none !important; gap:6px !important; overflow:visible !important; }
    table[data-pgrid] .max-w-500px > div:first-child{ display:none !important; }
    table[data-pgrid] .max-w-500px > div:last-child{ overflow:visible !important; min-width:0 !important; }
    /* thumbnail fills the card width (keeps the shimmer/aspect from section 1) */
    table[data-pgrid] .pthumb{ max-width:none !important; margin:0 0 6px 0 !important; }
    /* clamp title to 2 lines + reserve the space, so every card is the same height regardless of title length */
    table[data-pgrid] a[href*="/documents/doc_"]{
      display:-webkit-box !important; -webkit-box-orient:vertical !important; -webkit-line-clamp:2 !important;
      overflow:hidden !important; white-space:normal !important; word-break:break-word !important;
      line-height:1.25 !important; min-height:2.4em !important;
    }
  `;
  const style = document.createElement('style');
  style.id = 'pgrid-css'; style.textContent = css; document.head.appendChild(style);

  function gridify() {
    document.querySelectorAll('a[href*="/documents/doc_"]').forEach(a => {
      const tbl = a.closest('table');
      if (tbl && !tbl.hasAttribute('data-pgrid')) tbl.setAttribute('data-pgrid', '1');
    });
  }
  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(gridify, 300); }).observe(document.body, { childList: true, subtree: true });
  gridify();
})();

/* =====================================================================
 * 4) ESCAPE CLOSES THE SEARCH PALETTE  (best-effort)
 * ===================================================================== */
(function () {
  'use strict';
  function findSearch() {
    // a visible search input
    const inp = [...document.querySelectorAll('input')].find(i =>
      i.offsetParent && /search/i.test((i.placeholder || '') + ' ' + (i.getAttribute('aria-label') || '')));
    return inp || (document.activeElement && document.activeElement.tagName === 'INPUT' ? document.activeElement : null);
  }
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' && e.keyCode !== 27) return;
    const inp = findSearch();
    if (!inp) return;
    const dlg = inp.closest('[role="dialog"]') || inp.closest('[data-cmdk-root]') ||
                inp.parentElement?.parentElement?.parentElement || document.body;
    // 1) prefer a real close/clear button inside the panel
    const btn = [...dlg.querySelectorAll('button')].find(b => b.offsetParent &&
      /close|clear|dismiss/i.test((b.getAttribute('aria-label') || '') + ' ' + (b.title || '')));
    if (btn) { btn.click(); return; }
    // 2) fallback: clear + blur + click outside to trigger close-on-outside
    inp.value = '';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    inp.blur();
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, true);
})();
