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

## Important Files
- `electron.vite.config.ts`: Build configuration for main, preload, and dual renderer processes
- `biome.json`: Code formatting and linting rules
- `GEMINI.md`: Comprehensive AI collaboration guidelines and project context
- `src/__Engine__/index.ts`: Main engine exports
- `src/__Project__/scene.json`: Scene definition and game object hierarchy