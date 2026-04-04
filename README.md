<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" />
</p>

<h1 align="center">📁 ImgFold</h1>

<p align="center">
  <strong>A fast, private, and beautiful Image to PDF converter — built entirely in the browser.</strong>
</p>

<p align="center">
  Drag, drop, reorder, customize, and convert your images into a polished PDF — all without ever leaving your browser. No uploads. No servers. Just pure client-side magic.
</p>

---

## Live Demo
https://hamzahossainx.github.io/ImgFold/

## ✨ Features

| # | Feature | Description |
|:-:|---------|-------------|
| 1 | 🖼️ **Multi-Image Upload** | Upload JPG, PNG, and JPEG files via drag-and-drop, file picker, or clipboard paste (`Ctrl+V`) |
| 2 | 👁️ **Live Preview Grid** | Instantly see thumbnails of all uploaded images in a responsive grid |
| 3 | 🔀 **Drag & Drop Reorder** | Rearrange image order with smooth drag-and-drop powered by `@dnd-kit` |
| 4 | ❌ **Remove Images** | Hover over any image to reveal a quick-remove action |
| 5 | 🔍 **Full-Screen Preview** | Click any image to open a full-screen modal preview |
| 6 | ✏️ **Custom Filename** | Set a custom name for your output PDF file |
| 7 | 📐 **Page Size Options** | Auto (matches image aspect ratio), A4, or Letter |
| 8 | 🔄 **Page Orientation** | Choose between Portrait and Landscape |
| 9 | 📏 **Image Fit Modes** | Contain (preserves aspect ratio) or Fill (stretches to fit) |
| 10 | 📎 **Margin Control** | Adjustable margin slider from 0 to 60 pt |
| 11 | 🎚️ **Quality Control** | Image compression slider from 10% to 100% |
| 12 | ⏳ **Live Progress Bar** | Visual progress indicator with 4 generation stages |
| 13 | ⬇️ **Smart Download** | Download button appears only when the PDF is ready |
| 14 | 🌙 **Dark Mode** | Toggle dark/light theme — system preference–aware |
| 15 | 🔤 **Font Size Switcher** | Adjust UI font size: Small, Medium, or Large |
| 16 | 📱 **Fully Responsive** | Seamless experience on desktop and mobile |
| 17 | 📋 **Clipboard Paste** | Paste images directly from clipboard with `Ctrl+V` |

---

## 🔒 Privacy First

> **Your files never leave your device.**  
> All image processing and PDF generation happen entirely in the browser using client-side JavaScript. No data is uploaded to any server — ever.

---

## 🛠️ Tech Stack

| Library | Version | Purpose |
|---------|:-------:|---------|
| [React](https://react.dev) | `^18.3.1` | UI component framework |
| [Vite](https://vitejs.dev) | `^5.4.0` | Lightning-fast build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | `^3.4.7` | Utility-first CSS framework |
| [Framer Motion](https://www.framer.com/motion/) | `^11.3.0` | Declarative animations & transitions |
| [pdf-lib](https://pdf-lib.js.org) | `^1.17.1` | Client-side PDF generation |
| [@dnd-kit](https://dndkit.com) | `^6.1.0` | Accessible drag-and-drop toolkit |
| [PostCSS](https://postcss.org) | `^8.4.41` | CSS transformations & Tailwind processing |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | `^10.4.20` | Automatic vendor prefixes |

---

## 📂 Project Structure

```
imgfold-react/
├── index.html                  # App entry point
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite config (includes pdf-lib alias fix)
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS plugins
└── src/
    ├── main.jsx                # React DOM mount
    ├── App.jsx                 # Root application component
    ├── index.css               # Global styles & Tailwind directives
    ├── components/
    │   ├── Header.jsx          # App header with dark mode & font size toggles
    │   ├── ImageUploader.jsx   # Drag-drop / file picker / paste upload zone
    │   ├── ImagePreviewGrid.jsx# Sortable grid of uploaded images
    │   ├── SortableImageCard.jsx # Individual draggable image card
    │   ├── ControlsPanel.jsx   # PDF settings (page size, margins, quality…)
    │   ├── PDFGenerator.jsx    # Generate & download PDF controls
    │   └── ProgressBar.jsx     # Multi-stage progress indicator
    ├── hooks/
    │   └── usePDFGeneration.js # Custom hook for PDF generation logic
    └── utils/
        ├── imageUtils.js       # Image loading, compression & helpers
        └── pdfUtils.js         # PDF document assembly utilities
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/imgfold-react.git
   cd imgfold-react
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open in your browser**

   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build        # Outputs optimized bundle to /dist
npm run preview      # Preview the production build locally
```

---

## 🌐 Deploy to GitHub Pages

Follow these steps to publish ImgFold as a static site on GitHub Pages:

1. **Set the base path** in `vite.config.js`:

   ```js
   export default defineConfig({
     base: '/imgfold-react/',
     // ...existing config
   });
   ```

2. **Install `gh-pages`**:

   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy scripts** to `package.json`:

   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

4. **Deploy**:

   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**: Go to your repository **Settings → Pages** and select the `gh-pages` branch as the source.

6. **Your app is live at**:

   ```
   https://YOUR_USERNAME.github.io/imgfold-react/
   ```

---

## ⚠️ Known Notes

| Note | Details |
|------|---------|
| **pdf-lib ESM issue** | The `pdf-lib` npm package ships a broken ESM build. This is already patched in `vite.config.js` by aliasing `pdf-lib` to its UMD bundle. No action is needed on your part. |

---

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Ideas

- 🧪 Add unit tests with Vitest
- 🌍 Add i18n / multi-language support
- 🎨 Add more page size presets (Legal, Tabloid, etc.)
- 📄 Add multi-page layout options (2-up, 4-up grids)
- ♿ Improve accessibility (ARIA labels, keyboard navigation)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 ImgFold

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Made with ❤️ and React &nbsp;·&nbsp; <a href="#-imgfold">Back to top ↑</a>
</p>
