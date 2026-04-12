'use strict';
// ============================================================
// SKETCH — State
// ============================================================

const S = {
  pages: [{ id: 'page_1', name: 'Page 1', elements: [] }],
  currentPageId: 'page_1',
  selected: [],
  clipboard: [],
  tool: 'select',
  zoom: 1,
  panX: 0,
  panY: 0,
  history: [],
  future: [],
  nextId: 1,
  nextPageId: 2,
  gridVisible: true,
  gridSize: 8,
};

// Propriété virtuelle : éléments de la page courante
Object.defineProperty(S, 'elements', {
  get() {
    const p = this.pages.find(p => p.id === this.currentPageId);
    return p ? p.elements : [];
  },
  set(v) {
    const p = this.pages.find(p => p.id === this.currentPageId);
    if (p) p.elements = v;
  },
  configurable: true,
  enumerable: true,
});

// ============================================================ HISTORY
function saveHistory() {
  S.history.push(JSON.stringify({
    pageId: S.currentPageId,
    elements: S.elements.map(e => ({ ...e })),
  }));
  if (S.history.length > 60) S.history.shift();
  S.future = [];
  renderLayers();
}

function undo() {
  if (!S.history.length) return;
  S.future.push(JSON.stringify({
    pageId: S.currentPageId,
    elements: S.elements.map(e => ({ ...e })),
  }));
  const snap = JSON.parse(S.history.pop());
  S.currentPageId = snap.pageId;
  S.elements = snap.elements;
  S.selected = S.selected.filter(id => S.elements.find(e => e.id === id));
  S.nextId = Math.max(0, ...S.elements.map(e => +e.id.split('_')[1])) + 1;
  reRenderAll(); updatePropsPanel(); renderLayers(); renderPages();
}

function redo() {
  if (!S.future.length) return;
  S.history.push(JSON.stringify({
    pageId: S.currentPageId,
    elements: S.elements.map(e => ({ ...e })),
  }));
  const snap = JSON.parse(S.future.pop());
  S.currentPageId = snap.pageId;
  S.elements = snap.elements;
  S.selected = S.selected.filter(id => S.elements.find(e => e.id === id));
  S.nextId = Math.max(0, ...S.elements.map(e => +e.id.split('_')[1])) + 1;
  reRenderAll(); updatePropsPanel(); renderLayers(); renderPages();
}
