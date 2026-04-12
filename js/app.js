'use strict';
// ============================================================
// SKETCH — App (actions, pages, export, init)
// ============================================================

// ============================================================ OUTILS
function setTool(t) {
  S.tool = t;
  document.querySelectorAll('.tool-btn[data-tool]').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === t);
  });
  CANVAS.className = `canvas-area tool-${t}`;
}

document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => setTool(btn.dataset.tool));
});

// ============================================================ GRILLE
function toggleGrid() {
  S.gridVisible = !S.gridVisible;
  $('btnGrid').classList.toggle('grid-on', S.gridVisible);
  reRenderAll();
}

$('btnGrid').addEventListener('click', toggleGrid);

// ============================================================ ACTIONS SUR ÉLÉMENTS
function deleteSelected() {
  if (!S.selected.length) return;
  S.elements = S.elements.filter(e => !S.selected.includes(e.id));
  S.selected.forEach(id => { const d = document.getElementById(id); if (d) d.remove(); });
  S.selected = [];
  updatePropsPanel(); renderLayers(); saveHistory(); updateEmptyHint();
}

function duplicateSelected() {
  if (!S.selected.length) return;
  const newSel = [];
  S.selected.forEach(id => {
    const el = S.elements.find(e => e.id === id);
    if (!el) return;
    const copy = { ...el, id: 'el_' + (S.nextId++), x: el.x + 20, y: el.y + 20 };
    S.elements.push(copy);
    newSel.push(copy.id);
  });
  S.selected = newSel;
  reRenderAll(); updatePropsPanel(); renderLayers(); saveHistory();
}

function copySelected() {
  if (!S.selected.length) return;
  S.clipboard = S.selected.map(id => {
    const el = S.elements.find(e => e.id === id);
    return el ? { ...el } : null;
  }).filter(Boolean);
  showToast(`✓ ${S.clipboard.length} élément(s) copié(s)`);
}

function pasteSelected() {
  if (!S.clipboard.length) return;
  const newSel = [];
  S.clipboard.forEach(src => {
    const copy = { ...src, id: 'el_' + (S.nextId++), x: src.x + 24, y: src.y + 24 };
    S.elements.push(copy);
    newSel.push(copy.id);
  });
  // Décaler pour le prochain coller
  S.clipboard = S.clipboard.map(e => ({ ...e, x: e.x + 24, y: e.y + 24 }));
  S.selected = newSel;
  reRenderAll(); updatePropsPanel(); renderLayers(); saveHistory();
}

function bringToFront(el) {
  S.elements = S.elements.filter(e => e.id !== el.id);
  S.elements.push(el);
  reRenderAll(); renderLayers();
}

function sendToBack(el) {
  S.elements = S.elements.filter(e => e.id !== el.id);
  S.elements.unshift(el);
  reRenderAll(); renderLayers();
}

function renameEl(el) {
  const name = prompt('Nouveau nom :', el.label || el.type);
  if (name !== null) {
    el.label = name;
    reRenderAll(); renderLayers(); updatePropsPanel(); saveHistory();
  }
}

// ============================================================ PAGES
function addPage() {
  const id = 'page_' + (S.nextPageId++);
  const name = 'Page ' + S.pages.length;
  S.pages.push({ id, name, elements: [] });
  switchPage(id);
}

function switchPage(pid) {
  if (pid === S.currentPageId) return;
  S.currentPageId = pid;
  S.selected = [];
  EL_CONTAINER.innerHTML = '';
  reRenderAll(); updatePropsPanel(); renderLayers(); renderPages();
}

function deletePage(pid) {
  if (S.pages.length <= 1) { showToast('Impossible de supprimer la dernière page'); return; }
  const idx = S.pages.findIndex(p => p.id === pid);
  S.pages.splice(idx, 1);
  if (S.currentPageId === pid) {
    S.currentPageId = S.pages[Math.max(0, idx - 1)].id;
    S.selected = [];
    EL_CONTAINER.innerHTML = '';
  }
  reRenderAll(); updatePropsPanel(); renderLayers(); renderPages();
}

$('btnAddPage').addEventListener('click', addPage);

// ============================================================ ZOOM BUTTONS
$('btnUndo').addEventListener('click', undo);
$('btnRedo').addEventListener('click', redo);
$('btnDuplicate').addEventListener('click', duplicateSelected);
$('btnDelete').addEventListener('click', deleteSelected);

$('btnZoomIn').addEventListener('click', () => {
  S.zoom = Math.min(4, +(S.zoom + 0.1).toFixed(2));
  reRenderAll();
  $('zoomDisplay').textContent = Math.round(S.zoom * 100) + '%';
});
$('btnZoomOut').addEventListener('click', () => {
  S.zoom = Math.max(0.15, +(S.zoom - 0.1).toFixed(2));
  reRenderAll();
  $('zoomDisplay').textContent = Math.round(S.zoom * 100) + '%';
});

// Double-clic sur l'affichage zoom : reset 100%
$('zoomDisplay').addEventListener('dblclick', () => {
  S.zoom = 1; S.panX = 0; S.panY = 0;
  reRenderAll();
  $('zoomDisplay').textContent = '100%';
});

// ============================================================ NOUVEAU PROJET
$('btnClear').addEventListener('click', () => {
  if (S.elements.length === 0 || confirm('Effacer tout le canvas ?')) {
    saveHistory();
    S.elements = [];
    S.selected = [];
    EL_CONTAINER.innerHTML = '';
    renderLayers(); updatePropsPanel(); updateEmptyHint();
  }
});

// ============================================================ EXPORT JSON
$('btnExportJSON').addEventListener('click', () => {
  const data = JSON.stringify({ pages: S.pages, nextId: S.nextId, nextPageId: S.nextPageId }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'sketch_export.json'; a.click();
  URL.revokeObjectURL(url);
  showToast('✓ Projet exporté en JSON');
});

// ============================================================ IMPORT JSON
$('btnImportJSON').addEventListener('click', () => $('importFileInput').click());

$('importFileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      saveHistory();
      // Support ancien format (fichier avec juste elements) et nouveau (avec pages)
      if (data.pages) {
        S.pages = data.pages;
        S.nextPageId = data.nextPageId || S.nextPageId;
        S.currentPageId = S.pages[0]?.id || 'page_1';
      } else if (data.elements) {
        S.pages = [{ id: 'page_1', name: 'Page 1', elements: data.elements }];
        S.currentPageId = 'page_1';
      }
      S.nextId = data.nextId || S.nextId;
      S.selected = [];
      EL_CONTAINER.innerHTML = '';
      reRenderAll(); renderLayers(); updatePropsPanel(); renderPages();
      showToast('✓ Projet importé');
    } catch { showToast('✗ Erreur : JSON invalide'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ============================================================ CONTENU DE DÉMARRAGE
function loadStarter() {
  createElement('nav',     20,  20, 360,  48);
  createElement('heading', 20,  90, 220,  44);
  createElement('text',    20, 150, 280,  70);
  createElement('button',  20, 240, 120,  40);
  createElement('card',   320,  80, 180, 220);
  createElement('image',  320, 320, 180, 120);
  saveHistory();
}

// ============================================================ INIT
(function init() {
  initDragFromPanel();
  renderPages();
  renderLayers();
  drawGrid();
  drawRulers();
  loadStarter();
  setTool('select');
  updatePropsPanel();
  $('btnGrid').classList.toggle('grid-on', S.gridVisible);
  $('zoomDisplay').textContent = '100%';
})();
