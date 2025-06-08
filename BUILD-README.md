# 🏗️ Project Index Builder

Automatically scans your local projects and builds a beautiful home page with links to all of them.

## 🚀 Quick Usage

```bash
# Build once
python3 build-index.py

# Or use the shell script
./update-index.sh

# Watch for changes and auto-rebuild
./update-index.sh watch
```

## ✨ Features

- **📁 Auto-Discovery**: Scans `challenges/` and `other/` directories
- **🧠 Smart Caching**: Only re-processes changed files for efficiency
- **🎨 Beautiful UI**: Dark theme with glassmorphic cards and squircle design
- **🏷️ Tech Detection**: Automatically detects technologies used (jQuery, React, Canvas, etc.)
- **📊 Stats**: Shows project count, categories, and technologies
- **📱 Responsive**: Works on all devices
- **⚡ Fast**: Incremental updates with file change detection

## 📂 How It Works

1. **Scans** all project folders for `index.html` files
2. **Extracts** metadata (title, description, technologies)
3. **Categorizes** projects based on folder structure
4. **Caches** results to avoid re-processing unchanged files
5. **Generates** a beautiful HTML page at `public/index.html`

## 🔧 Project Structure Expected

```
your-project/
├── challenges/
│   ├── category1/
│   │   └── project1/
│   │       └── index.html
│   └── category2/
│       └── project2/
│           └── index.html
└── other/
    └── experiment1/
        └── index.html
```

## 🎯 Technology Detection

The script automatically detects these technologies in your HTML:

- jQuery (`$()` or `jquery`)
- React (`react`)
- Vue (`vue`)
- Canvas (`canvas`)
- Three.js (`three.js` or `threejs`)
- GSAP (`gsap`)

## 📈 Caching System

- Creates `.project_cache.json` to store processed data
- Only re-processes files when they change (MD5 hash comparison)
- Dramatically speeds up subsequent builds

## ⚙️ Configuration

Edit `.index-config.json` to customize:

- Site title and subtitle
- Category icons
- Technology detection patterns
- Background image

## 🌐 Generated Output

Creates `public/index.html` with:

- Project cards grouped by category
- Technology tags for each project
- Click-through links to projects
- Stats overview
- Responsive design

## 📝 Examples

Your sliding puzzle game will show up as:

- **Category**: Experiments 🧪
- **Technologies**: jQuery, Squircle UI
- **Link**: `/other/slide`
