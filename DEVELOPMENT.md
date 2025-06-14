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

## Code Quality and Linting

This project uses various linters to maintain code quality across different file types. The linting is automatically run before each commit using git hooks.

### Available Linting Commands

- `npm run lint`: Run all linters
- `npm run lint:js`: Lint JavaScript/TypeScript files
- `npm run lint:css`: Lint CSS files
- `npm run lint:html`: Lint HTML files
- `npm run lint:python`: Lint Python files
- `npm run lint:md`: Lint Markdown files
- `npm run format`: Format all supported files with Prettier
- `npm run lint:fix`: Auto-fix linting issues where possible

### Pre-commit Hooks

The project uses Husky and lint-staged to automatically run linters before each commit:

- JavaScript/TypeScript files: Prettier + ESLint
- CSS files: Prettier + Stylelint
- HTML files: Prettier + HTMLHint
- Python files: Pylint
- Markdown files: Prettier + Markdownlint
- JSON files: Prettier

### Setting Up Development Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. The git hooks will be automatically installed via the `prepare` script.

### Linting Configuration

- ESLint (`.eslintrc.json`): JavaScript/TypeScript linting
- Prettier (`.prettierrc`): Code formatting
- Stylelint (`.stylelintrc.json`): CSS linting
- HTMLHint (`.htmlhintrc`): HTML linting
- Markdownlint (`.markdownlint.json`): Markdown linting

### Python Setup

For Python linting, you'll need to install Pylint:

```bash
pip install pylint
```

### Manual Linting

While linting runs automatically on commit, you can manually run linters:

1. Format all files:
   ```bash
   npm run format
   ```

2. Run all linters:
   ```bash
   npm run lint
   ```

3. Run specific linter:
   ```bash
   npm run lint:js    # JavaScript/TypeScript
   npm run lint:css   # CSS
   npm run lint:html  # HTML
   npm run lint:python # Python
   npm run lint:md    # Markdown
   ```

4. Auto-fix issues:
   ```bash
   npm run lint:fix
   ```

### Skipping Pre-commit Hooks

In rare cases where you need to skip the pre-commit hooks:

```bash
git commit -m "your message" --no-verify
```

**Note:** This should be used sparingly and only when absolutely necessary.

### IDE Integration

For the best development experience, configure your IDE to use the project's linting rules:

- VS Code: Install the ESLint, Stylelint, and HTMLHint extensions
- Other IDEs: Configure them to use the config files in the project root

### Troubleshooting

If you encounter linting issues:

1. Ensure all dependencies are installed: `npm install`
2. Check if the correct Node.js version is being used
3. Verify that the git hooks are installed: `.husky` directory should exist
4. Try removing and reinstalling the hooks:
   ```bash
   rm -rf .husky
   npm run prepare
   ```

### Common Issues and Solutions

1. **Quote Style Issues**: The project uses single quotes for strings. Run `npm run format` to automatically fix.

2. **Indentation Issues**: The project uses 2 spaces for indentation. Run `npm run format` to fix.

3. **Unused Variables**: Either use the variables or remove them. These are marked as warnings.

4. **TypeScript/ESLint Conflicts**: Make sure you're using a compatible TypeScript version (currently ~5.5.0).

5. **HTML Issues**: Make sure to use proper HTML5 doctype and follow accessibility guidelines.

### Best Practices

1. Run `npm run format` before committing to ensure consistent code style
2. Address warnings to keep the codebase clean
3. Don't disable linting rules without good reason
4. Keep dependencies up to date
5. Document any custom linting rules or exceptions
