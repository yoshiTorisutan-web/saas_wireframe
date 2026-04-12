'use strict';
// ============================================================
// SKETCH — Components Definition
// ============================================================

const COMPONENTS = [
  { type: 'button',   label: 'Bouton',   w: 120, h: 40,  preview: '<div class="prev-btn"></div>' },
  { type: 'input',    label: 'Champ',    w: 200, h: 40,  preview: '<div class="prev-input"></div>' },
  { type: 'text',     label: 'Texte',    w: 200, h: 60,  preview: '<div class="prev-text"><span></span><span></span><span></span></div>' },
  { type: 'image',    label: 'Image',    w: 160, h: 120, preview: '<div class="prev-image"></div>' },
  { type: 'nav',      label: 'Nav Bar',  w: 300, h: 48,  preview: '<div class="prev-nav"></div>' },
  { type: 'card',     label: 'Carte',    w: 180, h: 220, preview: '<div class="prev-card"></div>' },
  { type: 'table',    label: 'Tableau',  w: 280, h: 160, preview: '<div class="prev-table"><span></span><span></span><span></span></div>' },
  { type: 'modal',    label: 'Modal',    w: 280, h: 200, preview: '<div class="prev-modal"></div>' },
  { type: 'heading',  label: 'Titre',    w: 200, h: 40,  preview: '<div style="font-family:var(--mono);font-size:0.8rem;font-weight:700;color:var(--ink-3)">Titre</div>' },
  { type: 'frame',    label: 'Frame',    w: 320, h: 240, preview: '<div style="width:80%;height:28px;border:2px solid var(--ink-3);border-radius:4px;"></div>' },
  { type: 'rect',     label: 'Rect.',    w: 120, h: 80,  preview: '<div style="width:70%;height:24px;background:var(--paper-3);border:1.5px solid var(--ink-4);border-radius:3px;"></div>' },
  { type: 'toggle',   label: 'Toggle',   w: 100, h: 30,  preview: '<div class="prev-toggle"></div>' },
  { type: 'checkbox', label: 'Case',     w: 140, h: 30,  preview: '<div class="prev-check"><span></span><div style="height:4px;width:40px;background:var(--ink-4);border-radius:2px;"></div></div>' },
  { type: 'avatar',   label: 'Avatar',   w: 56,  h: 56,  preview: '<div class="prev-avatar"></div>' },
  { type: 'badge',    label: 'Badge',    w: 60,  h: 24,  preview: '<div class="prev-badge"></div>' },
  { type: 'divider',  label: 'Div.',     w: 200, h: 20,  preview: '<div class="prev-divider"></div>' },
  { type: 'progress', label: 'Progrès',  w: 200, h: 28,  preview: '<div class="prev-progress"></div>' },
  { type: 'note',     label: 'Note',     w: 160, h: 120, preview: '<div style="width:80%;height:28px;background:#fef9c3;border:1px solid #fde047;border-radius:3px;"></div>' },
];

// ============================================================ RENDU HTML
function renderElHTML(el) {
  switch (el.type) {
    case 'button':
      return `<div class="wf-btn">${el.label || 'Bouton'}</div>`;
    case 'input':
      return `<div class="wf-input">${el.placeholder || 'Placeholder...'}</div>`;
    case 'text':
      return `<div class="wf-text"><span></span><span></span><span></span></div>`;
    case 'image':
      return `<div class="wf-image"></div>`;
    case 'nav':
      return `<div class="wf-nav"><span></span><span></span><span></span><span></span></div>`;
    case 'card':
      return `<div class="wf-card"><div class="wf-card-img"></div><div class="wf-card-body"><span></span><span></span></div></div>`;
    case 'table':
      return `<div class="wf-table">${Array(4).fill(0).map(() =>
        `<div class="wf-table-row">${Array(3).fill(0).map(() =>
          `<div class="wf-table-cell"></div>`).join('')}</div>`).join('')}</div>`;
    case 'modal':
      return `<div class="wf-modal"><div class="wf-modal-hdr"><span></span></div><div class="wf-modal-body"><span></span><span></span><span></span></div></div>`;
    case 'heading':
      return `<div class="wf-heading"><span></span></div>`;
    case 'frame':
      return `<div class="wf-frame"><div class="wf-frame-label">${el.label || 'Frame'}</div></div>`;
    case 'rect':
      return `<div class="wf-rect"></div>`;
    case 'toggle':
      return `<div class="wf-toggle"><div class="wf-toggle-track"><div class="wf-toggle-thumb"></div></div><div class="wf-toggle-lbl">${el.label || 'Toggle'}</div></div>`;
    case 'checkbox':
      return `<div class="wf-checkbox"><div class="wf-checkbox-box">✓</div><div class="wf-checkbox-lbl">${el.label || 'Option'}</div></div>`;
    case 'avatar':
      return `<div class="wf-avatar">◎</div>`;
    case 'badge':
      return `<div class="wf-badge">${el.label || 'New'}</div>`;
    case 'divider':
      return `<div class="wf-divider"></div>`;
    case 'progress':
      return `<div class="wf-progress"><div class="wf-progress-track"><div class="wf-progress-bar"></div></div></div>`;
    case 'note':
      return `<div class="wf-note">${el.text || '📝 Note...'}</div>`;
    default:
      return `<div class="wf-rect"></div>`;
  }
}
