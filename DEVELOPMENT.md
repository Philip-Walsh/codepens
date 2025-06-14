# Development Guide 🛠️

This guide focuses on the development workflow and scripts used for managing CodePen projects.

## Development Workflow

1. **Start on CodePen**
   - Begin your project on CodePen
   - Experiment and iterate quickly
   - Use CodePen's live preview and collaboration features

2. **Pull to Local**
   ```bash
   python scripts/download-pen.py <codepen-url>
   ```
   This will:
   - Download the project files
   - Create appropriate directory structure
   - Set up local development environment

3. **Local Development**
   ```bash
   # Start the development server
   node server.js
   
   # In another terminal, watch for changes
   ./scripts/update-index.sh watch
   ```

4. **Version Control**
   - Use git for version control
   - Commit regularly
   - Push to remote repository
   - Use branches for features

## Available Scripts

### 1. Download CodePen Projects (`download-pen.py`)
```bash
python scripts/download-pen.py <codepen-url>
```
Downloads a CodePen project and sets it up locally.

### 2. Update Project Index (`update-index.sh`)
```bash
# Build once
./scripts/update-index.sh

# Watch for changes
./scripts/update-index.sh watch
```
Maintains the project index and documentation.

### 3. Generate Statistics (`codepen-stats.py`)
```bash
python scripts/codepen-stats.py
```
Generates project statistics and updates documentation.

## Project Structure

```
.
├── challenges/     # Weekly CodePen challenges
├── other/         # Other projects and experiments
├── public/        # Generated index and static files
├── scripts/       # Development scripts
│   ├── build-index.py    # Index generator
│   ├── download-pen.py   # CodePen downloader
│   ├── codepen-stats.py  # Statistics generator
│   └── update-index.sh   # Index updater
└── server.js      # Local development server
```

## Best Practices

1. **Source Control**
   - Commit regularly
   - Use meaningful commit messages
   - Keep the repository clean
   - Use branches for features

2. **Code Organization**
   - Keep projects in appropriate directories
   - Use consistent naming conventions
   - Document your code
   - Keep dependencies up to date

3. **Development Process**
   - Start on CodePen for quick iteration
   - Pull to local for advanced features
   - Use version control for safety
   - Keep documentation updated

## Weekly Challenges

The repository includes solutions to weekly CodePen challenges. Each challenge is:
- Started on CodePen
- Pulled to local for advanced features
- Organized in the challenges directory
- Documented in the project index

## Troubleshooting

If you encounter issues:

1. **Script Errors**
   - Check Python/Node.js versions
   - Verify dependencies are installed
   - Check file permissions
   - Review error messages

2. **Server Issues**
   - Check port availability
   - Verify file paths
   - Check for syntax errors
   - Review server logs

3. **Index Problems**
   - Run update-index.sh
   - Check file permissions
   - Verify project structure
   - Review build logs 