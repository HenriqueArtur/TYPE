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

### Documentation
- `pnpm docs:dev` - Start documentation development server
- `pnpm docs:build` - Build documentation site
- `pnpm docs:preview` - Preview built documentation

### Dependency Management
- `pnpm update:dependencies` - Interactive dependency updates with npm-check-updates

## Project Architecture

**TYPE** _(TypeScript Yields Powerful [Game] Engines)_ is a modern **Electron-based game engine and editor** built with TypeScript, React, and PIXI.js. The engine implements Entity Component System (ECS) architecture with a sophisticated multi-engine design pattern for high-performance 2D game development.

### Multi-Process Electron Structure
- **Main Process** (`src/main/`): Application lifecycle, window management, file system access
- **Preload Script** (`src/preload/`): Secure IPC bridge between main and renderer processes
- **Game Renderer** (`src/renderer/game/`): Lightweight PIXI.js game runtime with TypeEngine
- **Editor Renderer** (`src/renderer/editor/`): React-based game development environment (future)

### TypeEngine - Central Coordinator
The TypeEngine serves as the main coordinator managing 7 specialized sub-engines through dependency injection:
- **EntityEngine**: Entity and component management with ECS lifecycle
- **RenderEngine**: PIXI.js rendering coordination with sprite management
- **PhysicsEngine**: Matter.js physics integration with automatic body-sprite synchronization
- **SceneEngine**: Scene loading, transitions, and management
- **SystemEngine**: Priority-based system execution with hot-swappable logic
- **EventEngine**: Decoupled communication between engine components
- **TimeEngine**: Precise frame timing and delta calculation

### Core Directory Structure
- **`src/__Engine__/`**: Reusable game engine components
  - `TypeEngine.ts`: Main engine coordinator
  - `Engines/`: Sub-engine implementations
  - `Component/`: ECS components (Drawable, Physics, Input, Event)
  - `Systems/`: Built-in systems (Physics, Rendering, Input)
  - `Utils/`: Engine utilities and helpers
- **`src/__Project__/`**: Game development workspace
  - Scene definitions (`.scene.json`)
  - Blueprint templates (`.blueprint.json`)
  - Custom components (`.component.ts` + `.component.js`)
  - Custom systems (`.system.ts` + `.system.js`)
  - Management files (`component.manage.json`, `system.manage.json`, `scenes.manage.json`)
  - Game assets (images, sounds, etc.)

### Data Flow Pattern
```
Editor (React) ←→ src/__Project__/*.json ←→ Game Runtime (PIXI.js + TypeEngine)
```

All game data is serialized as JSON files in `src/__Project__/`, enabling version control and human-readable project files.

## Code Conventions

### Naming Conventions
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

### ECS Architecture Requirements
- **Components**: Pure data containers with no behavior, following `ComponentInstanceManage` interface
- **Systems**: Implement `System<TypeEngine>` interface with `name`, `priority`, `enabled`, `init`, `update` properties
- **Entities**: Managed by EntityEngine, contain components but no logic
- **Custom Components**: Must be registered in `component.manage.json` with `.js` extension
- **Custom Systems**: Must be registered in `system.manage.json` with `.js` extension

### Game Project Structure Requirements
Game objects require associated files:
- **Components**: `.component.ts` → compiled to `.component.js`
- **Systems**: `.system.ts` → compiled to `.system.js`
- **Scenes**: `.scene.json` with game object definitions
- **Blueprints**: `.blueprint.json` for reusable entity templates
- **Management Files**: JSON files registering custom components and systems

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
- Assets should be placed in `src/__Project__/` directory for proper loading

### Testing Protocol
- **DO NOT** use `pnpm dev` for testing purposes
- Verification sequence: `pnpm test:type` → `pnpm lint` → `pnpm test` → `pnpm build`

### Build System
- **Dual Configuration**: `electron.vite.config.ts` for Electron core, `vite.config.ts` for game files
- **Development**: Hot reloading for both main and renderer processes
- **Production**: Optimized bundles with platform-specific packaging

## Commit Message Protocol

### Gitmoji Pattern
All commits **MUST** follow the [Gitmoji](https://gitmoji.dev/) pattern for consistent, visual commit history.

### Format
```
<gitmoji> <type>: <concise description>
```

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
- `vite.config.ts`: Game files build configuration and TypeEngine bundling
- `biome.json`: Code formatting and linting rules
- `docs/`: Comprehensive documentation using VitePress with Mermaid diagrams
- `src/__Engine__/TypeEngine.ts`: Main engine coordinator and entry point
- `src/__Project__/scenes.manage.json`: Scene configuration and initial scene definition
- `src/__Project__/component.manage.json`: Custom component registry
- `src/__Project__/system.manage.json`: Custom system registry

## Documentation

### Comprehensive Documentation (`docs/` directory)
Full documentation available using VitePress with Mermaid diagrams:
- **Architecture**: Multi-engine design patterns and ECS implementation
- **Components**: Built-in and custom component creation guide
- **Systems**: System development and management
- **Building Games**: Step-by-step game development workflow
- **Getting Started**: Quick setup and development environment

### LLM Reference Files (`.for-LLMs/` directory)
Quick reference guides for AI development assistance:

#### `components.md`
Complete reference of all built-in components in the TYPE Game Engine:
- **12 Components** across 4 categories (Drawable, Physics, Input, Event)
- Component properties, descriptions, and usage examples
- Documentation and implementation file paths
- Development guidelines and architecture principles
- Real-world usage examples with JSON configurations and system queries

#### `how-to-build-a-game.md` 
Comprehensive game development workflow guide:
- **Complete Development Process**: From planning to testing
- **File Structure & Management**: Component, system, and scene configuration
- **Real Code Examples**: Custom components, systems, and complete game implementations
- **Best Practices**: Performance optimization, file organization, debugging
- **Quick Reference**: Commands, interfaces, and common patterns
- **Step-by-step Tutorials**: Building platformer games with physics and AI

### Usage
- **For Development**: Use `docs/` for detailed technical documentation
- **For AI Assistance**: Use `.for-LLMs/` for quick reference and code examples
- **For Learning**: Start with `how-to-build-a-game.md` for practical implementation

The documentation is part of an academic research program at Universidade de São Paulo (USP) Brazil, focusing on modern ECS game engine architecture and TypeScript development patterns.