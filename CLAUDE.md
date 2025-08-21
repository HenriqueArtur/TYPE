# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development mode (builds and launches both editor and game)
- `pnpm build` - Build the application for testing
- `pnpm test` - Run test suite with Vitest
- `pnpm test:type` - TypeScript type checking
- `pnpm lint` - Code linting and formatting with Biome
- `pnpm lint:ci` - CI-specific linting (diagnostic level errors only)

### Testing
- `pnpm test:ci` - CI test configuration (DO NOT use locally)
- Run focused tests: `pnpm test -- path/to/test/file.spec.ts`

### Building & Distribution
- `pnpm build:linux` - Build Linux distributables
- `pnpm build:mac` - Build macOS distributables  
- `pnpm build:win` - Build Windows distributables

### Dependency Management
- `pnpm update:dependencies` - Interactive dependency updates with npm-check-updates

## Project Architecture

This is an **Electron-based game engine and editor** built with TypeScript, React, and PIXI.js. The architecture separates content creation (editor) from content consumption (game runtime).

### Multi-Process Electron Structure
- **Main Process** (`src/main/`): Application lifecycle, window management, file system access
- **Preload Script** (`src/preload/`): Secure IPC bridge between main and renderer processes
- **Editor Renderer** (`src/renderer/editor/`): React-based game development environment
- **Game Renderer** (`src/renderer/game/`): Lightweight PIXI.js game runtime

### Core Directory Structure
- **`src/__Engine__/`**: Reusable game engine components
  - `Component/`: Game object components (Transform, Sprite, Texture)
  - `GameObject/`: Abstract and concrete game object implementations
  - `Scene/`: Scene management and hierarchy
  - `Utils/`: Engine utilities and helpers
- **`src/__Project__/`**: Game-specific assets and data
  - Scene definitions (`.json`)
  - Game object definitions (`.ts`, `.obj.json`, `.loaded.ts` triplets)
  - Asset files (images, sounds, etc.)

### Data Flow Pattern
```
Editor (React) ←→ src/__Project__/*.json ←→ Game Runtime (PIXI.js)
```

All game data is serialized as JSON files in `src/__Project__/`, enabling version control and human-readable project files.

## Code Conventions

### Naming Conventions (from GEMINI.md)
- **Variables**: `snake_case`
- **Functions**: `camelCase`  
- **Classes/Components**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Files**: React components use `PascalCase.tsx`, utilities use `kebab-case.ts`

### Formatting (Biome Configuration)
- 2-space indentation
- 100 character line width
- Double quotes for strings
- Required semicolons
- Trailing commas where valid

## Key Development Guidelines

### Test-Driven Development (TDD)
- **MANDATORY**: Use Test-Driven Development approach unless specifically requested not to
- **TDD Workflow**:
  1. **Write Tests First**: Before implementing any new feature, write the corresponding tests
  2. **Red Phase**: Run tests to confirm they fail (ensuring tests are valid)
  3. **Green Phase**: Write minimal code to make tests pass
  4. **Refactor Phase**: Improve code while keeping tests passing
- **Test Requirements**:
  - All new functions, classes, and components must have comprehensive tests
  - Tests should cover normal cases, edge cases, and error conditions
  - Use descriptive test names that explain the expected behavior
- **Test File Naming**: Use `.spec.ts` suffix for test files

### Security Requirements
- Validate all IPC data between main and renderer processes
- Use secure file operations, validate paths to prevent directory traversal
- Follow Electron security best practices (disable node integration, use context isolation)
- Never commit secrets, API keys, or sensitive configuration

### Commit Policy
- **IMPORTANT**: Only commit changes when explicitly requested by the user
- Never commit automatically or proactively without explicit user instruction

### Asset Path Integrity
- **CRITICAL**: Never modify asset loading paths in `src/renderer/game/index.ts`

### Testing Protocol
- **DO NOT** use `pnpm dev` for testing purposes
- Verification sequence: `pnpm test:type` → `pnpm lint` → `pnpm test` → `pnpm build`

### Project File Structure
Game objects require three associated files with matching base names:
- `.ts`: TypeScript class definition
- `.obj.json`: Serialized initial values
- `.loaded.ts`: Loading logic for initial values

### Engine Documentation
For detailed information about the game engine architecture, components, scene system, input devices, utilities, and development guidelines, see `./for-LLMs/engine.md`.

**Important**: When creating new engine artifacts (components, utilities, input devices), they must be documented in `engine.md`.

## AI Journal System

### Journal Creation and Management
At the **first interaction**, create an AI journal file in `.ai-journal/` directory:

**File naming convention**: `year-month-day-hour-minute-second-<ai-action>.md`
- Example: `2024-03-15-14-30-45-feature-implementation.md`

**Important**: The `.ai-journal/` directory is excluded from git tracking via `.gitignore` to keep development journals local and prevent repository pollution. Journals are for AI development assistance only and should not be committed to version control.

### Journal File Structure
```markdown
# AI Development Journal

**AI Agent**: Claude Code
**Created**: YYYY-MM-DD HH:MM:SS
**Commit Hash**: <last commit hash from origin/main>

## Summary
**Session Impact**: [Comprehensive overview of all interactions and their collective impact on the project]

## Interaction Log

### [UTC-Timestamp] - [Brief interaction description]
**User Request**: [Concise summary of what was asked]

**Planned Steps**:
1. [What I plan to do]
2. [Step by step approach]
3. [Expected actions]

**What Actually Happened**:
- [Detailed execution of the work]
- [What tools were used]
- [Any issues encountered]
- [Actual steps taken]

**Result**: [Clear outcome and impact of this interaction]
```

### Journal Workflow
1. **First Interaction**: Create journal file with initial analysis and planned steps
2. **Each Interaction**: Add concise entry with user request and any new steps identified
3. **Mid-Session Commits**: If operator requests commits, capture git diff from journal's initial commit hash
4. **Task Completion**: When operator indicates all tasks are finished:
   - Fill the Summary section with comprehensive task overview
   - Update `<ai-action>` in filename if more descriptive name is appropriate
   - Commit the journal file with changes

### Journal Commands
- Always check if `.ai-journal/` directory exists, create if needed
- Use `git log -1 --format="%H" origin/main` to get last commit hash from origin/main
- Use `git diff <journal-commit-hash> HEAD` to capture changes during mid-session commits
- Use `TZ=UTC date "+%Y-%m-%d-%H-%M-%S"` to get UTC timestamp for file naming (macOS/Linux)
- Use `TZ=UTC date "+%H:%M:%S"` to get UTC time for interaction timestamps (macOS/Linux)
- For Windows: Use `powershell -Command "Get-Date -Format 'yyyy-MM-dd-HH-mm-ss' -AsUTC"` for file naming
- For Windows: Use `powershell -Command "Get-Date -Format 'HH:mm:ss' -AsUTC"` for interaction timestamps

## Commit Message Protocol

### Gitmoji Pattern
All commits **MUST** follow the [Gitmoji](https://gitmoji.dev/) pattern for consistent, visual commit history.

### Format
```
<gitmoji> <type>: <concise description>
```

### Common Gitmojis for This Project
- 🎉 `:tada:` - Initial commit
- ✨ `:sparkles:` - New feature
- 🐛 `:bug:` - Bug fix
- 🔧 `:wrench:` - Configuration
- 📝 `:memo:` - Documentation
- ✅ `:white_check_mark:` - Tests
- 🎨 `:art:` - Code structure
- ⚡ `:zap:` - Performance
- 🔥 `:fire:` - Remove code
- 🚚 `:truck:` - Move/rename
- 📦 `:package:` - Dependencies
- 🔒 `:lock:` - Security
- 🚨 `:rotating_light:` - Linter warnings
- 🎮 `:video_game:` - Game engine
- 🖥️ `:desktop_computer:` - Electron

### Examples
```bash
git commit -m "✨ feat: add Transform component with position and rotation"
git commit -m "🐛 fix: resolve texture loading path issues in Electron build"
git commit -m "📝 docs: update README with architecture overview"
git commit -m "✅ test: add comprehensive Scene component test suite"
git commit -m "🔧 config: enforce no-explicit-any rule in biome.json"
```

### Guidelines
- **Concise**: Keep descriptions under 50 characters when possible
- **Present tense**: Use imperative mood ("add" not "added")
- **Specific**: Be precise about what was changed
- **Contextual**: Use appropriate gitmoji for the type of change

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/) (SemVer) with format `MAJOR.MINOR.PATCH`:

- **MAJOR**: Breaking changes that require user intervention
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and small improvements that are backward compatible

### Version Update Protocol
1. Determine version increment based on changes made in the session:
   - **PATCH**: Bug fixes, documentation updates, refactoring
   - **MINOR**: New features, components, or significant improvements
   - **MAJOR**: Breaking API changes, architecture overhauls
2. Update `version` field in `package.json`
3. This versioning step is performed automatically and does not need journal documentation

## Important Files
- `electron.vite.config.ts`: Build configuration for main, preload, and dual renderer processes
- `biome.json`: Code formatting and linting rules
- `GEMINI.md`: Comprehensive AI collaboration guidelines and project context
- `src/__Engine__/index.ts`: Main engine exports
- `src/__Project__/scene.json`: Scene definition and game object hierarchy