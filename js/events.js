'use strict';
// ============================================================
// SKETCH — Events
// ============================================================

// ============================================================ LISTENERS ÉLÉMENT
function addElListeners(dom) {
  dom.addEventListener('mousedown', onElMousedown);
  dom.querySelectorAll('.resize-handle').forEach(rh => {
    rh.addEventListener('mousedown', onResizeMousedown);
  });
}

// ============================================================ DRAG ÉLÉMENT
let dragState = null;

function onElMousedown(e) {
  if (S.tool !== 'select') return;
  if (e.button === 2) return;
  e.stopPropagation();

  const el = S.elements.find(el => el.id === e.currentTarget.id);
  if (!el || el.locked) return;

  if (e.shiftKey) {
    if (S.selected.includes(el.id)) S.selected = S.selected.filter(i => i !== el.id);
    else S.selected.push(el.id);
  } else {
    if (!S.selected.includes(el.id)) S.selected = [el.id];
  }
  reRenderAll(); updatePropsPanel();

  const startPos = toCanvas(e.clientX, e.clientY);
  const startEls = S.selected.map(id => {
    const el = S.elements.find(e => e.id === id);
    return { id, x: el.x, y: el.y };
  });
  dragState = { startPos, startEls, moved: false };

  const onMove = e2 => {
    const cur = toCanvas(e2.clientX, e2.clientY);
    const dx = cur.x - dragState.startPos.x;
    const dy = cur.y - dragState.startPos.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragState.moved = true;
    if (!dragState.moved) return;
    dragState.startEls.forEach(({ id, x, y }) => {
      const el = S.elements.find(e => e.id === id);
      if (el) { el.x = Math.round(x + dx); el.y = Math.round(y + dy); }
    });
    reRenderAll(); updatePropsPanel();
  };

  const onUp = () => {
    if (dragState && dragState.moved) saveHistory();
    dragState = null;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ============================================================ RESIZE
let resizeState = null;

function onResizeMousedown(e) {
  if (S.tool !== 'select') return;
  e.stopPropagation();
  e.preventDefault();

  const dom = e.currentTarget.closest('.wire-el');
  const el = S.elements.find(e => e.id === dom.id);
  if (!el) return;

  const dir = e.currentTarget.dataset.rh;
  const startPos = toCanvas(e.clientX, e.clientY);
  const snap = { x: el.x, y: el.y, w: el.w, h: el.h };
  const MIN = 20;

  const onMove = e2 => {
    const cur = toCanvas(e2.clientX, e2.clientY);
    const dx = cur.x - startPos.x;
    const dy = cur.y - startPos.y;
    let { x, y, w, h } = snap;
    if (dir.includes('e')) w = Math.max(MIN, w + dx);
    if (dir.includes('s')) h = Math.max(MIN, h + dy);
    if (dir.includes('w')) { x = x + dx; w = Math.max(MIN, w - dx); }
    if (dir.includes('n')) { y = y + dy; h = Math.max(MIN, h - dy); }
    el.x = Math.round(x); el.y = Math.round(y);
    el.w = Math.round(w); el.h = Math.round(h);
    reRenderAll(); updatePropsPanel();
  };

  const onUp = () => {
    saveHistory();
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ============================================================ CANVAS EVENTS
let selBoxState = null;

CANVAS.addEventListener('mousedown', e => {
  if (e.button === 1 || S.tool === 'pan') { startPan(e); return; }
  if (e.button === 2) return;

  if (S.tool === 'select') {
    S.selected = [];
    reRenderAll(); updatePropsPanel();
    const r = CANVAS.getBoundingClientRect();
    selBoxState = { sx: e.clientX - r.left, sy: e.clientY - r.top };
    const box = $('selBox');
    box.style.display = 'block';
    box.style.left = selBoxState.sx + 'px';
    box.style.top  = selBoxState.sy + 'px';
    box.style.width = '0'; box.style.height = '0';
  }

  if (S.tool === 'rect' || S.tool === 'frame') {
    const pos = toCanvas(e.clientX, e.clientY);
    S.drawing = true; S.drawStart = pos;
  }

  if (S.tool === 'text') {
    const pos = toCanvas(e.clientX, e.clientY);
    const el = createElement('note', pos.x, pos.y, 160, 80, { text: 'Texte libre...' });
    S.selected = [el.id];
    reRenderAll(); updatePropsPanel(); saveHistory();
  }
});

CANVAS.addEventListener('mousemove', e => {
  if (selBoxState) {
    const r = CANVAS.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    const x = Math.min(selBoxState.sx, cx);
    const y = Math.min(selBoxState.sy, cy);
    const w = Math.abs(cx - selBoxState.sx);
    const h = Math.abs(cy - selBoxState.sy);
    const box = $('selBox');
    box.style.left = x + 'px'; box.style.top = y + 'px';
    box.style.width = w + 'px'; box.style.height = h + 'px';
    const bx1 = (x - S.panX) / S.zoom, by1 = (y - S.panY) / S.zoom;
    const bx2 = bx1 + w / S.zoom,    by2 = by1 + h / S.zoom;
    S.selected = S.elements
      .filter(el => el.x >= bx1 && el.y >= by1 && el.x + el.w <= bx2 && el.y + el.h <= by2)
      .map(el => el.id);
    reRenderAll(); updatePropsPanel();
  }

  if (S.drawing) {
    // Aperçu live du rectangle/frame en cours de dessin
    // (géré au mouseup)
  }
});

CANVAS.addEventListener('mouseup', e => {
  if (selBoxState) {
    selBoxState = null;
    $('selBox').style.display = 'none';
  }
  if (S.drawing) {
    S.drawing = false;
    const pos = toCanvas(e.clientX, e.clientY);
    const x = Math.min(S.drawStart.x, pos.x);
    const y = Math.min(S.drawStart.y, pos.y);
    const w = Math.max(40, Math.abs(pos.x - S.drawStart.x));
    const h = Math.max(20, Math.abs(pos.y - S.drawStart.y));
    const type = S.tool === 'frame' ? 'frame' : 'rect';
    const el = createElement(type, x, y, w, h);
    S.selected = [el.id];
    reRenderAll(); updatePropsPanel(); saveHistory();
    setTool('select');
  }
});

// ============================================================ PAN
function startPan(e) {
  const startX = e.clientX, startY = e.clientY;
  const px = S.panX, py = S.panY;
  CANVAS.classList.add('panning');

  const onMove = e2 => {
    S.panX = px + (e2.clientX - startX);
    S.panY = py + (e2.clientY - startY);
    reRenderAll();
  };
  const onUp = () => {
    CANVAS.classList.remove('panning');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ============================================================ ZOOM (molette)
CANVAS.addEventListener('wheel', e => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.08 : 0.08;
  const newZoom = Math.max(0.15, Math.min(4, S.zoom + delta));
  const r = CANVAS.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  S.panX = mx - (mx - S.panX) * (newZoom / S.zoom);
  S.panY = my - (my - S.panY) * (newZoom / S.zoom);
  S.zoom = newZoom;
  reRenderAll();
  $('zoomDisplay').textContent = Math.round(S.zoom * 100) + '%';
}, { passive: false });

// ============================================================ DRAG DEPUIS LE PANEL
function initDragFromPanel() {
  const compGrid = $('compGrid');
  COMPONENTS.forEach(comp => {
    const item = document.createElement('div');
    item.className = 'comp-item';
    item.draggable = true;
    item.dataset.type = comp.type;
    item.innerHTML = `<div class="comp-preview">${comp.preview}</div><div class="comp-label">${comp.label}</div>`;
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('comp-type', comp.type);
    });
    compGrid.appendChild(item);
  });

  CANVAS.addEventListener('dragover', e => e.preventDefault());
  CANVAS.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('comp-type');
    if (!type) return;
    const pos = toCanvas(e.clientX, e.clientY);
    const comp = COMPONENTS.find(c => c.type === type);
    const el = createElement(type, pos.x - (comp ? comp.w / 2 : 60), pos.y - (comp ? comp.h / 2 : 30));
    S.selected = [el.id];
    reRenderAll(); updatePropsPanel(); saveHistory();
  });
}

// ============================================================ MENU CONTEXTUEL
CANVAS.addEventListener('contextmenu', e => {
  e.preventDefault();
  const el = S.selected.length === 1 ? S.elements.find(e => e.id === S.selected[0]) : null;
  showCtxMenu(e.clientX, e.clientY, el);
});

function showCtxMenu(x, y, el) {
  const menu = $('ctxMenu');
  const items = [];

  if (el) {
    items.push({ label: '✎  Renommer',        fn: () => renameEl(el) });
    items.push({ label: '⧉  Dupliquer',        key: 'Ctrl+D', fn: () => duplicateSelected() });
    items.push({ label: '⎘  Copier',           key: 'Ctrl+C', fn: () => copySelected() });
    items.push('sep');
    items.push({ label: '↑  Premier plan',     fn: () => { bringToFront(el); saveHistory(); } });
    items.push({ label: '↓  Arrière-plan',     fn: () => { sendToBack(el); saveHistory(); } });
    items.push('sep');
    items.push({ label: el.locked ? '🔓 Déverrouiller' : '🔒 Verrouiller', fn: () => { el.locked = !el.locked; reRenderAll(); } });
    items.push({ label: el.visible ? '👁  Masquer' : '👁  Afficher',         fn: () => { el.visible = !el.visible; reRenderAll(); renderLayers(); } });
    items.push('sep');
    items.push({ label: '🗑  Supprimer',        cls: 'danger', fn: () => deleteSelected() });
  } else {
    items.push({ label: '⎘  Coller',           key: 'Ctrl+V', fn: () => pasteSelected() });
    items.push({ label: '⊞  Tout sélectionner', key: 'Ctrl+A', fn: () => { S.selected = S.elements.map(e => e.id); reRenderAll(); updatePropsPanel(); } });
  }

  menu.innerHTML = items.map(i => {
    if (i === 'sep') return '<div class="ctx-sep"></div>';
    return `<div class="ctx-item ${i.cls || ''}">${i.label}${i.key ? `<span class="ctx-key">${i.key}</span>` : ''}</div>`;
  }).join('');

  menu.style.display = 'block';
  menu.style.left = Math.min(x, window.innerWidth  - 190) + 'px';
  menu.style.top  = Math.min(y, window.innerHeight - 240) + 'px';

  const fnItems = items.filter(i => i !== 'sep');
  menu.querySelectorAll('.ctx-item').forEach((el, i) => {
    el.addEventListener('click', () => { fnItems[i].fn(); hideCtxMenu(); });
  });
}

function hideCtxMenu() { $('ctxMenu').style.display = 'none'; }
document.addEventListener('click',   hideCtxMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideCtxMenu(); });

// ============================================================ CLAVIER
document.addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' ||
      document.activeElement.getAttribute('contenteditable') === 'true') return;

  if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();

  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); duplicateSelected(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copySelected(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); pasteSelected(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') { e.preventDefault(); S.selected = S.elements.map(e => e.id); reRenderAll(); updatePropsPanel(); }

  if (e.key === 'v') setTool('select');
  if (e.key === 'r') setTool('rect');
  if (e.key === 't') setTool('text');
  if (e.key === 'f') setTool('frame');
  if (e.key === 'h') setTool('pan');
  if (e.key === 'g') toggleGrid();

  // Déplacement au clavier
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    if (!S.selected.length) return;
    e.preventDefault();
    const STEP = e.shiftKey ? 10 : 1;
    S.selected.forEach(id => {
      const el = S.elements.find(e => e.id === id);
      if (!el) return;
      if (e.key === 'ArrowLeft')  el.x -= STEP;
      if (e.key === 'ArrowRight') el.x += STEP;
      if (e.key === 'ArrowUp')    el.y -= STEP;
      if (e.key === 'ArrowDown')  el.y += STEP;
    });
    reRenderAll(); updatePropsPanel();
  }
});

window.addEventListener('resize', () => { reRenderAll(); });
