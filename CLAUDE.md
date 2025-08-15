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

### Component System
The engine uses a component-based architecture where game objects are entities with attached components:
- `TransformComponent`: Position, rotation, scale
- `SpriteComponent`: Visual sprite rendering
- `TextureComponent`: Texture management

Components are registered via the `COMPONENT_CLASSES` registry in `src/__Engine__/Component/index.ts`.

## AI Journal System

### Journal Creation and Management
At the **first interaction**, create an AI journal file in `.ai-journal/` directory:

**File naming convention**: `year-month-day-hour-minute-second-<ai-action>.md`
- Example: `2024-03-15-14-30-45-feature-implementation.md`

### Journal File Structure
```markdown
# AI Development Journal

**AI Agent**: Claude Code
**Created**: YYYY-MM-DD HH:MM:SS
**Commit Hash**: <current git commit hash>

## Planned Steps
1. [Initial planned steps based on user request]
2. [Additional steps as they emerge]

## Interaction Log
### [Timestamp] - [Brief interaction description]
- User Request: [Concise summary of what was asked]
- New Steps: [Any additional steps identified]

## Summary
[To be filled when all tasks are completed]
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
- Use `git log -1 --format="%H"` to get current commit hash
- Use `git diff <journal-commit-hash> HEAD` to capture changes during mid-session commits

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
- 🔧 `:wrench:` - Configuration changes
- 📝 `:memo:` - Documentation
- ✅ `:white_check_mark:` - Add or update tests
- 🎨 `:art:` - Improve structure/format of code
- ⚡ `:zap:` - Performance improvements
- 🔥 `:fire:` - Remove code or files
- 🚚 `:truck:` - Move or rename resources
- 📦 `:package:` - Add or update compiled files or packages
- 🔒 `:lock:` - Fix security issues
- ⬆️ `:arrow_up:` - Upgrade dependencies
- ⬇️ `:arrow_down:` - Downgrade dependencies
- 📌 `:pushpin:` - Pin dependencies
- 🚨 `:rotating_light:` - Fix compiler/linter warnings
- 🎮 `:video_game:` - Game engine specific features
- 🖥️ `:desktop_computer:` - Electron-specific changes

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

## Important Files
- `electron.vite.config.ts`: Build configuration for main, preload, and dual renderer processes
- `biome.json`: Code formatting and linting rules
- `GEMINI.md`: Comprehensive AI collaboration guidelines and project context
- `src/__Engine__/index.ts`: Main engine exports
- `src/__Project__/scene.json`: Scene definition and game object hierarchy