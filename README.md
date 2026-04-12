# ✏️ SKETCH — Outil de Wireframing

> Un outil de wireframing léger, élégant et entièrement dans le navigateur. Aucune dépendance, aucune installation.

---

## ✨ Fonctionnalités

- 🎨 Interface "papier" minimaliste avec grille de points
- 📄 **Multi-pages** — gérez plusieurs écrans dans le même projet
- 🧩 **18 composants UI** prêts à l'emploi (glisser-déposer)
- 🔄 Annuler / Rétablir (historique 60 étapes)
- 📋 Copier / Coller avec décalage automatique
- 🔍 Zoom fluide (molette) + panoramique
- 📏 Règles et grille de points configurable
- 🗂️ Gestionnaire de calques (visibilité, ordre)
- ⚙️ Panneau de propriétés (position, taille, opacité, label)
- 💾 Export / Import JSON (sauvegarde complète du projet)
- 🔒 Verrouillage d'éléments
- ⌨️ Raccourcis clavier complets

---

## 🚀 Démarrage rapide

```bash
# Ouvrir directement dans le navigateur
open index.html
# ou double-cliquer sur index.html
```

Aucune installation requise — fichier HTML + CSS + JS pur.

---

## ⌨️ Raccourcis clavier

| Touche | Action |
|--------|--------|
| `V` | Outil Sélection |
| `R` | Dessiner un Rectangle |
| `T` | Ajouter une Note |
| `F` | Dessiner un Cadre |
| `H` | Outil Main (panoramique) |
| `G` | Afficher / Masquer la grille |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Rétablir |
| `Ctrl+D` | Dupliquer la sélection |
| `Ctrl+C` | Copier la sélection |
| `Ctrl+V` | Coller |
| `Ctrl+A` | Tout sélectionner |
| `Suppr` | Supprimer la sélection |
| `↑ ↓ ← →` | Déplacer (×1 px) |
| `Shift + ↑↓←→` | Déplacer (×10 px) |
| `Double-clic zoom` | Réinitialiser le zoom à 100% |

---

## 🧩 Composants disponibles

| Composant | Description |
|-----------|-------------|
| `button` | Bouton cliquable |
| `input` | Champ de saisie |
| `text` | Bloc de texte (lignes) |
| `image` | Placeholder image |
| `nav` | Barre de navigation |
| `card` | Composant carte |
| `table` | Tableau de données |
| `modal` | Fenêtre modale |
| `heading` | Titre / Heading |
| `frame` | Cadre conteneur |
| `rect` | Rectangle libre |
| `toggle` | Interrupteur on/off |
| `checkbox` | Case à cocher |
| `avatar` | Avatar utilisateur |
| `badge` | Badge / Tag |
| `divider` | Séparateur horizontal |
| `progress` | Barre de progression |
| `note` | Post-it / Note libre |

---

## 📁 Structure du projet

```
saas_wireframe/
├── 📄 index.html          — Point d'entrée
├── 📖 README.md           — Documentation
│
├── 🎨 css/
│   └── styles.css         — Tous les styles (design system, composants, layout)
│
└── ⚙️ js/
    ├── state.js           — État global (S), historique, undo/redo
    ├── components.js      — Définitions des 18 composants + rendu HTML
    ├── render.js          — Rendu DOM, grille canvas, règles, calques, pages, props
    ├── events.js          — Événements souris, clavier, drag & drop
    └── app.js             — Initialisation, actions, pages, export/import
```

---

## 🛠️ Technologies

| Technologie | Usage |
|-------------|-------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | Structure & canvas |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | Design system, variables CSS |
| ![JavaScript](https://img.shields.io/badge/JS-F7DF1E?style=flat&logo=javascript&logoColor=black) | Vanilla ES2020, aucun framework |
| Google Fonts | DM Sans + DM Mono |

---

## 💡 Comment ça marche

```
┌─────────────────────────────────────────────────────┐
│  HEADER  — Outils · Actions · Zoom · Export         │
├──────────┬──────────────────────────────┬───────────┤
│  GAUCHE  │                              │  DROITE   │
│  Pages   │         CANVAS               │  Props    │
│  Compos. │    (grille + éléments)        │  Aligner  │
│  Calques │                              │  Infos    │
└──────────┴──────────────────────────────┴───────────┘
```

1. **Glisser** un composant depuis le panneau gauche → canvas
2. **Cliquer** pour sélectionner, **Shift+clic** pour sélection multiple
3. **Redimensionner** avec les poignées bleues
4. Modifier les propriétés dans le **panneau droit**
5. **Exporter** le projet en JSON pour le reprendre plus tard

---

## 📄 Pages multiples

- Cliquer **+** dans la section "Pages" pour ajouter un écran
- **Double-cliquer** sur un nom de page pour le renommer
- **✕** pour supprimer (minimum 1 page requise)
- Les données de chaque page sont sauvegardées dans l'export JSON

---

*Portfolio project — Made with ❤️ and vanilla JS*
