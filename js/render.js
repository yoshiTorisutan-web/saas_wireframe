'use strict';
// ============================================================
// SKETCH — Render
// ============================================================

const $ = id => document.getElementById(id);
const CANVAS       = $('canvasArea');
const EL_CONTAINER = $('elementsContainer');

// ============================================================ COORD HELPERS
function toCanvas(screenX, screenY) {
  const r = CANVAS.getBoundingClientRect();
  return {
    x: (screenX - r.left - S.panX) / S.zoom,
    y: (screenY - r.top  - S.panY) / S.zoom,
  };
}

function toScreen(cx, cy) {
  return { x: cx * S.zoom + S.panX, y: cy * S.zoom + S.panY };
}

// ============================================================ CREATE ELEMENT
function createElement(type, x, y, w, h, extra = {}) {
  const comp = COMPONENTS.find(c => c.type === type);
  const el = {
    id: 'el_' + (S.nextId++),
    type,
    x: Math.round(x),
    y: Math.round(y),
    w: w || (comp ? comp.w : 120),
    h: h || (comp ? comp.h : 40),
    opacity: 1,
    locked: false,
    visible: true,
    label: comp ? comp.label : type,
    ...extra,
  };
  S.elements.push(el);
  renderElement(el);
  renderLayers();
  updateEmptyHint();
  return el;
}

// ============================================================ RENDER ELEMENT
function renderElement(el) {
  let dom = document.getElementById(el.id);
  if (!dom) {
    dom = document.createElement('div');
    dom.id = el.id;
    dom.className = 'wire-el';
    EL_CONTAINER.appendChild(dom);
  }

  dom.style.left          = (el.x * S.zoom + S.panX) + 'px';
  dom.style.top           = (el.y * S.zoom + S.panY) + 'px';
  dom.style.width         = el.w + 'px';
  dom.style.height        = el.h + 'px';
  dom.style.transform     = `scale(${S.zoom})`;
  dom.style.transformOrigin = 'top left';
  dom.style.opacity       = el.opacity;
  dom.style.display       = el.visible ? 'block' : 'none';
  dom.style.zIndex        = S.elements.indexOf(el) + 1;

  if (S.selected.includes(el.id)) dom.classList.add('selected');
  else dom.classList.remove('selected');

  dom.innerHTML = `
    <div class="el-inner">${renderElHTML(el)}</div>
    <div class="resize-handle rh-nw" data-rh="nw"></div>
    <div class="resize-handle rh-n"  data-rh="n"></div>
    <div class="resize-handle rh-ne" data-rh="ne"></div>
    <div class="resize-handle rh-e"  data-rh="e"></div>
    <div class="resize-handle rh-se" data-rh="se"></div>
    <div class="resize-handle rh-s"  data-rh="s"></div>
    <div class="resize-handle rh-sw" data-rh="sw"></div>
    <div class="resize-handle rh-w"  data-rh="w"></div>
  `;

  addElListeners(dom);
}

// ============================================================ RE-RENDER ALL
function reRenderAll() {
  // Supprimer les DOM orphelins
  Array.from(EL_CONTAINER.children).forEach(c => {
    if (!S.elements.find(e => e.id === c.id)) c.remove();
  });
  S.elements.forEach(el => renderElement(el));
  drawGrid();
  drawRulers();
  updateEmptyHint();
}

// ============================================================ GRILLE
function drawGrid() {
  const canvas = $('mainCanvas');
  const r = CANVAS.getBoundingClientRect();
  canvas.width  = r.width;
  canvas.height = r.height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!S.gridVisible) return;

  const size = S.gridSize * S.zoom;
  const ox = ((S.panX % size) + size) % size;
  const oy = ((S.panY % size) + size) % size;

  ctx.fillStyle = 'rgba(26,23,20,0.14)';
  for (let x = ox; x < canvas.width; x += size) {
    for (let y = oy; y < canvas.height; y += size) {
      ctx.beginPath();
      ctx.arc(x, y, 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============================================================ RÈGLES
function drawRulers() {
  const rh = $('rulerHCanvas');
  const rv = $('rulerVCanvas');
  const area = CANVAS.getBoundingClientRect();
  const W = area.width - 20, H = area.height - 20;
  if (W <= 0 || H <= 0) return;

  rh.width = W; rh.height = 20;
  rv.width = 20; rv.height = H;

  const ctxH = rh.getContext('2d');
  const ctxV = rv.getContext('2d');

  ctxH.fillStyle = '#ede9e0'; ctxH.fillRect(0, 0, W, 20);
  ctxV.fillStyle = '#ede9e0'; ctxV.fillRect(0, 0, 20, H);

  ctxH.strokeStyle = '#c8c3bc'; ctxH.fillStyle = '#8a857e';
  ctxH.font = '8px DM Mono, monospace'; ctxH.textAlign = 'center';
  ctxV.strokeStyle = '#c8c3bc'; ctxV.fillStyle = '#8a857e';
  ctxV.font = '8px DM Mono, monospace'; ctxV.textAlign = 'right';

  const step = S.zoom > 1.5 ? 50 : S.zoom > 0.7 ? 100 : 200;
  const startX = Math.floor(-S.panX / S.zoom / step) * step;
  const startY = Math.floor(-S.panY / S.zoom / step) * step;

  for (let x = startX; x < startX + W / S.zoom + step; x += step) {
    const sx = x * S.zoom + S.panX;
    if (sx < 0 || sx > W) continue;
    ctxH.beginPath(); ctxH.moveTo(sx, 14); ctxH.lineTo(sx, 20); ctxH.stroke();
    ctxH.fillText(x, sx, 11);
  }
  for (let y = startY; y < startY + H / S.zoom + step; y += step) {
    const sy = y * S.zoom + S.panY;
    if (sy < 0 || sy > H) continue;
    ctxV.beginPath(); ctxV.moveTo(14, sy); ctxV.lineTo(20, sy); ctxV.stroke();
    ctxV.save(); ctxV.translate(10, sy); ctxV.rotate(-Math.PI / 2);
    ctxV.fillText(y, 0, 0); ctxV.restore();
  }
}

// ============================================================ CALQUES
const LAYER_ICONS = {
  button:'⬜', input:'▭', text:'¶', image:'⬡', nav:'≡', card:'⬭',
  table:'⊞', modal:'⧉', heading:'H', frame:'⬚', rect:'▭',
  toggle:'⊙', checkbox:'☑', avatar:'○', badge:'◉', divider:'—',
  progress:'▰', note:'✎',
};

function renderLayers() {
  const list = $('layersList');
  if (!list) return;
  list.innerHTML = [...S.elements].reverse().map(el => `
    <div class="layer-item ${S.selected.includes(el.id) ? 'selected' : ''}" data-id="${el.id}">
      <span class="layer-icon">${LAYER_ICONS[el.type] || '◈'}</span>
      <span class="layer-name">${el.label || el.type}</span>
      <span class="layer-vis">${el.visible ? '👁' : '○'}</span>
    </div>
  `).join('');

  list.querySelectorAll('.layer-item').forEach(item => {
    item.addEventListener('click', e => {
      const id = item.dataset.id;
      if (e.shiftKey) {
        if (S.selected.includes(id)) S.selected = S.selected.filter(i => i !== id);
        else S.selected.push(id);
      } else {
        S.selected = [id];
      }
      reRenderAll(); updatePropsPanel(); renderLayers();
    });
    item.querySelector('.layer-vis').addEventListener('click', e => {
      e.stopPropagation();
      const el = S.elements.find(el => el.id === item.dataset.id);
      if (el) { el.visible = !el.visible; reRenderAll(); renderLayers(); }
    });
  });
}

// ============================================================ PAGES
function renderPages() {
  const list = $('pagesList');
  if (!list) return;
  list.innerHTML = S.pages.map(page => `
    <div class="page-item ${page.id === S.currentPageId ? 'active' : ''}" data-pid="${page.id}">
      <div class="page-item-dot"></div>
      <div class="page-item-name" data-pid="${page.id}">${page.name}</div>
      <div class="page-item-del" data-pid="${page.id}" title="Supprimer">✕</div>
    </div>
  `).join('');

  list.querySelectorAll('.page-item').forEach(item => {
    const pid = item.dataset.pid;

    // Clic : changer de page
    item.addEventListener('click', e => {
      if (e.target.classList.contains('page-item-del')) return;
      if (e.target.classList.contains('page-item-name') && e.target.getAttribute('contenteditable') === 'true') return;
      switchPage(pid);
    });

    // Double-clic sur le nom : renommer
    item.querySelector('.page-item-name').addEventListener('dblclick', e => {
      e.stopPropagation();
      const nameEl = e.currentTarget;
      nameEl.contentEditable = 'true';
      nameEl.focus();
      const range = document.createRange();
      range.selectNodeContents(nameEl);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);

      const finish = () => {
        nameEl.contentEditable = 'false';
        const newName = nameEl.textContent.trim() || 'Page';
        const page = S.pages.find(p => p.id === pid);
        if (page) { page.name = newName; nameEl.textContent = newName; }
      };
      nameEl.addEventListener('blur', finish, { once: true });
      nameEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
        if (e.key === 'Escape') { nameEl.blur(); }
      }, { once: true });
    });

    // Supprimer page
    item.querySelector('.page-item-del').addEventListener('click', e => {
      e.stopPropagation();
      deletePage(pid);
    });
  });
}

// ============================================================ PROPS PANEL
function updatePropsPanel() {
  const panel = $('propsPanel');
  const noSel = $('noSelection');
  if (!panel || !noSel) return;

  if (S.selected.length === 0) {
    panel.style.display = 'none';
    noSel.style.display = 'flex';
    return;
  }
  noSel.style.display = 'none';
  panel.style.display = 'block';

  const el = S.elements.find(e => e.id === S.selected[0]);
  if (!el) return;

  panel.innerHTML = `
    <div class="prop-section">
      <div class="panel-title">Disposition</div>
      <div class="prop-row-2">
        <div><div class="prop-label" style="margin-bottom:4px;">X</div>
          <input class="prop-input" id="px" type="number" value="${Math.round(el.x)}"></div>
        <div><div class="prop-label" style="margin-bottom:4px;">Y</div>
          <input class="prop-input" id="py" type="number" value="${Math.round(el.y)}"></div>
      </div>
      <div class="prop-row-2">
        <div><div class="prop-label" style="margin-bottom:4px;">L</div>
          <input class="prop-input" id="pw" type="number" value="${Math.round(el.w)}"></div>
        <div><div class="prop-label" style="margin-bottom:4px;">H</div>
          <input class="prop-input" id="ph" type="number" value="${Math.round(el.h)}"></div>
      </div>
    </div>
    <div class="prop-section">
      <div class="panel-title">Apparence</div>
      <div class="prop-row">
        <span class="prop-label">Opacité</span>
        <input class="prop-input" id="popacity" type="range" min="0" max="1" step="0.05" value="${el.opacity}" style="flex:1;padding:0;">
        <span style="font-family:var(--mono);font-size:0.68rem;color:var(--ink-3);min-width:30px;text-align:right;" id="opacityVal">${Math.round(el.opacity * 100)}%</span>
      </div>
    </div>
    <div class="prop-section">
      <div class="panel-title">Label</div>
      <div class="prop-row">
        <input class="prop-input" id="plabel" type="text" value="${el.label || ''}" placeholder="Nom de l'élément">
      </div>
    </div>
    <div class="prop-section">
      <div class="panel-title">Aligner</div>
      <div class="align-btns">
        <button class="align-btn" data-align="left"   title="Gauche">⊣</button>
        <button class="align-btn" data-align="center" title="Centrer H">⊕</button>
        <button class="align-btn" data-align="right"  title="Droite">⊢</button>
        <button class="align-btn" data-align="top"    title="Haut">⊤</button>
        <button class="align-btn" data-align="middle" title="Centrer V">⊞</button>
        <button class="align-btn" data-align="bottom" title="Bas">⊥</button>
      </div>
    </div>
    <div class="prop-section">
      <div class="panel-title">Infos</div>
      <div class="prop-row">
        <span class="prop-label">Type</span>
        <span style="font-family:var(--mono);font-size:0.72rem;color:var(--ink-3);">${el.type}</span>
      </div>
      <div class="prop-row">
        <span class="prop-label">ID</span>
        <span style="font-family:var(--mono);font-size:0.62rem;color:var(--ink-4);">${el.id}</span>
      </div>
    </div>
  `;

  const bind = (id, key, parse) => {
    const input = $(id);
    if (!input) return;
    input.addEventListener('change', () => {
      const val = parse ? parse(input.value) : input.value;
      S.selected.forEach(sid => {
        const el = S.elements.find(e => e.id === sid);
        if (el) el[key] = val;
      });
      reRenderAll(); saveHistory();
    });
  };
  bind('px', 'x', parseFloat);
  bind('py', 'y', parseFloat);
  bind('pw', 'w', v => Math.max(10, parseFloat(v)));
  bind('ph', 'h', v => Math.max(10, parseFloat(v)));
  bind('plabel', 'label');

  const opSlider = $('popacity');
  if (opSlider) {
    opSlider.addEventListener('input', () => {
      const v = parseFloat(opSlider.value);
      $('opacityVal').textContent = Math.round(v * 100) + '%';
      S.selected.forEach(sid => {
        const el = S.elements.find(e => e.id === sid);
        if (el) el.opacity = v;
      });
      reRenderAll();
    });
    opSlider.addEventListener('change', saveHistory);
  }

  panel.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.align;
      const r = CANVAS.getBoundingClientRect();
      const cw = r.width / S.zoom, ch = r.height / S.zoom;
      S.selected.forEach(sid => {
        const el = S.elements.find(e => e.id === sid);
        if (!el) return;
        if (dir === 'left')   el.x = 0;
        if (dir === 'center') el.x = (cw - el.w) / 2;
        if (dir === 'right')  el.x = cw - el.w;
        if (dir === 'top')    el.y = 0;
        if (dir === 'middle') el.y = (ch - el.h) / 2;
        if (dir === 'bottom') el.y = ch - el.h;
      });
      reRenderAll(); updatePropsPanel(); saveHistory();
    });
  });
}

// ============================================================ EMPTY HINT
function updateEmptyHint() {
  const hint = $('canvasEmptyHint');
  if (hint) hint.style.display = S.elements.length === 0 ? 'block' : 'none';
}

// ============================================================ TOAST
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}
