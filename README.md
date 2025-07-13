# 🎨 Philip-Walsh Codepens

A collection of interactive coding challenges, experiments, and demos. This repository showcases creative programming projects ranging from 3D visualizations to games and UI experiments.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start

# Build project index
npm run build
```

Visit `http://localhost:3000` to view the project index and browse all available codepens.

## 🐍 Python Scripts & Virtual Environment

This repository includes powerful Python scripts for project management and data analysis:

### Setting up Python Environment

```bash
# Create virtual environment (if not exists)
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On Linux/Mac
# or
.venv\Scripts\activate     # On Windows

# Install Python dependencies
pip install -r requirements.txt
```

### Available Python Scripts

- **`scripts/build-index.py`** - 🏗️ Main project index builder

  - Automatically scans all projects and generates the beautiful homepage
  - Supports watch mode for continuous rebuilding
  - Includes smart caching for fast incremental updates

- **`scripts/download-pen.py`** - 📥 CodePen downloader utility

  - Downloads CodePens for local development
  - Handles assets and dependencies

- **`scripts/codepen-stats.py`** - 📊 Statistics generator

  - Analyzes project data and generates insights
  - Tracks technology usage and project metrics

- **`scripts/update-index.sh`** - 🔄 Shell wrapper script
  - Convenient interface for running the build script
  - Supports both single build and watch modes

### Python Script Usage

```bash
# Build project index once
python3 scripts/build-index.py

# Watch for changes and auto-rebuild
python3 scripts/build-index.py --watch

# Use the shell wrapper (recommended)
./scripts/update-index.sh         # Build once
./scripts/update-index.sh watch   # Watch mode

# Generate project statistics
python3 scripts/codepen-stats.py
```

### Python Dependencies

The project uses these Python packages:

- **`beautifulsoup4`** - HTML parsing and manipulation
- **`cloudscraper`** - Web scraping with anti-bot protection

## 📁 Project Structure

```
codepens/
├── public/
│   ├── index.html          # Auto-generated project index
│   ├── challenges/         # Coding challenges and solutions
│   └── css/               # Shared stylesheets
├── challenges/            # Challenge source files
├── other/                 # Experimental projects
├── assets/               # Shared assets
├── server/               # Express.js server
└── scripts/              # Build and utility scripts
```

## 🎯 Featured Projects

Based on recent commits, this repository includes:

- **3D Sign**: Interactive 3D text visualization
- **City UI**: Modern city-themed user interface
- **Word Game**: Interactive word-based game
- **Spheres**: 3D sphere animations and interactions
- **Planets**: Solar system visualization
- **Solar Face**: Creative solar-themed visualization

## ✨ Features

- **🧠 Smart Project Discovery**: Automatically scans and indexes all projects
- **🎨 Beautiful UI**: Dark theme with glassmorphic cards and modern design
- **🏷️ Tech Detection**: Automatically detects technologies used (jQuery, React, Canvas, Three.js, etc.)
- **📊 Live Stats**: Shows project count, categories, and technologies
- **📱 Responsive**: Works on all devices
- **⚡ Fast Development**: Hot reload with nodemon

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, jQuery
- **Backend**: Node.js, Express.js
- **Build Tools**: Custom build scripts, automated linting
- **Graphics**: Canvas, WebGL, Three.js
- **Styling**: Modern CSS with glassmorphism effects

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build project index
- `npm run lint` - Run all linters (JS, CSS, HTML, Python, Markdown)
- `npm run format` - Format code with Prettier
- `npm run lint:fix` - Fix linting issues automatically

### Project Index Builder

The repository includes an automated project index builder that:

1. **Scans** all project folders for `index.html` files
2. **Extracts** metadata (title, description, technologies)
3. **Categorizes** projects based on folder structure
4. **Caches** results for fast rebuilds
5. **Generates** a beautiful HTML page at `public/index.html`

## 🎨 Creating New Projects

1. Create a new folder in `challenges/` or `other/`
2. Add an `index.html` file with your project
3. Run `npm run build` to update the project index
4. Your project will automatically appear on the home page

## 📝 Code Quality

This project maintains high code quality with:

- **ESLint** for JavaScript linting
- **Stylelint** for CSS linting
- **HTMLHint** for HTML validation
- **Prettier** for code formatting
- **Markdownlint** for documentation
- **Husky** for pre-commit hooks

## 🌐 Live Demo

Visit the live demo to explore all projects: [GitHub Pages](https://philip-walsh.github.io/codepens)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your codepen/experiment
4. Run `npm run lint:fix` to ensure code quality
5. Submit a pull request

## 📄 License

ISC License - see package.json for details.

## 👨‍💻 Author

**Philip Walsh** - [GitHub](https://github.com/Philip-Walsh)

---

_This repository is a showcase of creative coding experiments and challenges. Each project demonstrates different aspects of web development, from basic HTML/CSS to complex 3D visualizations._

