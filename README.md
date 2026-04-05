# ImgFold React — Image to PDF Converter

A premium SaaS-quality React app for converting multiple images to a
downloadable PDF — 100% client-side, zero backend, zero uploads.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| Multi-image upload | Drag-drop zone, file picker, clipboard paste |
| Drag-to-reorder | @dnd-kit with smooth overlay animation |
| Per-image actions | Full-screen preview modal, remove individual images |
| Custom PDF name | Editable filename input, defaults to "converted.pdf" |
| Auto page sizing | Matches each image's aspect ratio dynamically |
| Standard sizes | A4 and US Letter presets |
| Orientation | Portrait / Landscape toggle |
| Image fit | Contain (aspect ratio preserved) or Fill (stretch) |
| Margin control | 0–60 pt slider |
| Compression | JPEG quality 10–100% slider for smaller output |
| Progress bar | Live 4-stage progress during generation |
| Dark mode | System-aware, toggleable |
| Font size | Small / Medium / Large UI text switcher |
| Responsive | Mobile + tablet + desktop |

---

## 🗂 Folder Structure

```
imgfold-react/
├── index.html                   ← Vite HTML entry, Google Fonts
├── package.json                 ← All dependencies
├── vite.config.js               ← Vite + React + pdf-lib UMD alias + code splitting
├── tailwind.config.js           ← Dark mode, brand teal palette, custom animations
├── postcss.config.js
└── src/
    ├── main.jsx                 ← ReactDOM entry point
    ├── App.jsx                  ← Root state, layout (sidebar + main)
    ├── index.css                ← Tailwind + global styles + range slider styling
    │
    ├── components/
    │   ├── Header.jsx           ← Logo, dark toggle, font-size switcher
    │   ├── ImageUploader.jsx    ← Animated drop zone (full + compact modes)
    │   ├── ImagePreviewGrid.jsx ← DndContext + SortableContext grid
    │   ├── SortableImageCard.jsx← Draggable card with preview modal
    │   ├── ControlsPanel.jsx    ← Left sidebar: all PDF settings
    │   ├── PDFGenerator.jsx     ← Bottom bar: generate + download + error
    │   └── ProgressBar.jsx      ← Animated 4-stage progress bar
    │
    ├── hooks/
    │   └── usePDFGeneration.js  ← PDF state machine (generate / download / reset)
    │
    └── utils/
        ├── imageUtils.js        ← Read file, compress via Canvas, get dimensions
        └── pdfUtils.js          ← pdf-lib page builder + file downloader
```

---

## 🚀 Quick Start

### Requirements
- **Node.js 18+** — check with `node -v`
- **npm 9+**

### 1 — Install

```bash
cd imgfold-react
npm install
```

### 2 — Dev server

```bash
npm run dev
# Open http://localhost:5173
```

### 3 — Production build

```bash
npm run build    # outputs to /dist (split chunks, fully optimised)
npm run preview  # locally preview the production build
```

---

## ⚠️ Known: pdf-lib ESM issue

The `pdf-lib` npm package ships a broken ESM build (missing `./form` import).
The included `vite.config.js` already patches this by aliasing `pdf-lib` to its
self-contained **UMD bundle** (`node_modules/pdf-lib/dist/pdf-lib.js`).
No action needed — the fix is baked in.

---

## 🌐 Deploy (free)

### Netlify — drag & drop
1. `npm run build` → creates `dist/`
2. Go to **https://app.netlify.com/drop** and drag `dist/` onto the page
3. Live URL in ~10 seconds ✅

### Netlify CLI
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Vercel
```bash
npm i -g vercel
vercel   # select "Vite" framework when prompted
```

### GitHub Pages
```js
// Add to vite.config.js → defineConfig({ base: '/your-repo-name/', ... })
```
```bash
npm i -g gh-pages
npm run build && gh-pages -d dist
```

---

## 🛠 Tech Stack

| Library | Version | Role |
|---------|---------|------|
| React | 18 | UI framework |
| Vite | 5 | Build tool / dev server |
| Tailwind CSS | 3 | Utility styling + dark mode |
| Framer Motion | 11 | Page animations + micro-interactions |
| pdf-lib | 1.17 | Client-side PDF creation |
| @dnd-kit | 6/8 | Drag-and-drop reordering |

---

## 🔒 Privacy

All image processing and PDF generation happens entirely in your browser.
Files are never sent to any server.
