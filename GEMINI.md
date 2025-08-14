# GEMINI.MD: AI Collaboration Guide
*Last Updated:* 2025-08-13

This document provides essential context for AI models interacting with this project. Adhering to these guidelines will ensure consistency and maintain code quality.

 ## 1. Specific Instructions for AI Collaboration
 ### Security Guidelines
 * **IPC Security:** Always validate data passed between main and renderer processes
 * **File System Access:** Use secure file operations, validate paths to prevent directory traversal
 * **No Hardcoded Secrets:** Never commit API keys, tokens, or sensitive configuration
 * **Electron Security:** Follow Electron security best practices (disable node integration in renderer, use context isolation)
                                                                                                                                                                                             
 ### Development Workflow
 * **TDD Approach:** Adhere to a Test-Driven Development (TDD) workflow.
     *   **Write Tests First:** Before implementing a new feature, write the corresponding tests.
     *   **Focused Testing:** During development, run only the tests for the specific feature you are working on.
     *   **Full Regression:** After completing the feature, run the entire test suite to ensure no regressions were introduced.
 * **Planning Phase:** Before making changes, create a detailed plan with numbered steps
 * **Approval Required:** Wait for operator approval before implementing changes
 * **Dependency Management:** Discuss new dependencies with operator, provide pros/cons analysis
 * **Asset Path Integrity:** Never modify asset loading paths in `src/renderer/game/index.ts`
                                                                                                                                                                                             
 ### Testing Protocol
 * **AI Testing Restriction:** Do NOT use `pnpm dev` for testing purposes
 * **Verification Steps:**
   1. Run `pnpm test:type` for TypeScript validation
   2. Run `pnpm lint` for code quality checks
   3. Run `pnpm test` to ensure tests pass
   4. Run `pnpm build` to verify build integrity
                                                                                                                                                                                             
 ### Change Documentation
 * **After completing any activity:**
   1. **Create Journal Entry:** Add file to `.ai-journal/YYYY-MM-DD-hh-mm-ss-activity-name.md`
   2. **Include Summary:** Document what was changed, why, and any important decisions
   3. **Note Dependencies:** List any new dependencies or breaking changes
   4. **Verification Results:** Include results of testing and validation steps
                                                                                                                                                                                             
 ### Project-Specific Guidelines
 * **JSON Schema:** Maintain consistent structure for project files in `src/project`
 * **Editor-Game Sync:** Ensure changes to data structures work in both editor and game
 * **Performance:** Consider PIXI.js performance implications for game runtime
 * **Cross-Platform:** Test changes across different operating systems when possible
                                                                                                                                                                                             
 ### Communication Protocol
 * **Status Updates:** Provide clear progress updates during long operations
 * **Error Reporting:** Report exact error messages and stack traces
 * **Clarification:** Ask for clarification rather than making assumptions about requirements
 * **Alternative Solutions:** When possible, provide multiple approaches with trade-offs

## 2. Project Overview & Purpose

### Primary Goal
This project is a **game engine** built on top of **PIXI.js** and **Electron**, featuring a comprehensive **React.js-based editor**. The architecture separates content creation from content consumption:

* **Editor Application:** A full-featured game development environment where developers can create, edit, and manage game assets, scenes, and objects
* **Game Runtime:** A lightweight player that loads and executes games without editing capabilities

### Business Domain
Specifically targeting indie game developers and small studios who need an accessible, desktop-based game creation platform.will

### Core Workflow

*   **Content Creation:** Developers use the React-based editor to design games, manage assets, and configure game objects.
*   **Asset Management:** All game data (scenes, objects, configurations) are serialized as JSON files in the `src/__Project__` directory.
*   **Game Execution:** The game runtime loads these JSON files to render and run the completed game.
*   **Distribution:** Games can be packaged and distributed as standalone Electron applications.

### Project Structure

The project is organized into two main directories: `__Engine__` and `__Project__`.

*   **`__Engine__`:** This directory contains the core game engine logic, including components, game objects, input handling, scene management, and utilities. It is designed to be a reusable and extensible game engine.
*   **`__Project__`:** This directory contains the specific assets and data for a particular game, such as scenes, game objects, and other resources. This separation allows for easy management and versioning of game-specific content.

### Key Features

* **Visual Editor:** Drag-and-drop interface for game object placement and scene composition
* **Asset Pipeline:** Integrated asset management system for sprites, sounds, and other game resources
* **JSON Serialization:** All game data stored in human-readable, version-control-friendly JSON format
* **Cross-Platform:** Desktop application supporting Windows, macOS, and Linux
* **PIXI.js Integration:** Hardware-accelerated 2D rendering with WebGL support

## 3. Core Technologies & Stack

### Languages
* **TypeScript (v~5.9.2)** - Primary development language for type safety and better developer experience

### Frameworks & Runtimes
* **Node.js (v22.14.0)** - JavaScript runtime for the main process
* **React (v19.1.1)** - UI framework for the editor interface
* **Electron (v37.2.6)** - Desktop application framework
* **Vite (v7.1.2)** - Build tool and development server
* **PIXI.js (v8.12.0)** - 2D WebGL rendering engine for game graphics

### Key Libraries/Dependencies
#### Game Engine & Rendering
* **pixi.js (v8.12.0)** - Core 2D rendering engine with WebGL acceleration

#### UI & Editor Interface
* **react, react-dom (v19.1.1)** - Core React framework for editor UI
* **@heroicons/react (v2.2.0)** - Icon library for UI components

### Development & Build Tools
* **electron-vite (v4.0.0)** - Vite integration for Electron development
* **electron-builder (v26.0.12)** - Application packaging and distribution
* **vite (v7.1.2)** - Fast build tool and development server
* **vitest (v3.2.4)** - Testing framework

### Code Quality
* **@biomejs/biome (v2.1.4)** - Fast linter and formatter (replaces ESLint + Prettier)

### Package Manager
* **pnpm (v10.14.0)** - Fast, disk space efficient package manager

## 4. Architectural Patterns
### Multi-Process Electron Architecture
The application follows Electron's security-focused multi-process model:

#### Main Process (`src/main`)
* **Responsibility:** Application lifecycle, window management, file system access
* **Security:** Has full Node.js API access, handles sensitive operations
* **Communication:** Communicates with renderer processes via IPC (Inter-Process Communication)

#### Preload Script (`src/preload`)
* **Responsibility:** Secure bridge between main and renderer processes
* **Security:** Exposes only necessary APIs to renderer processes
* **Pattern:** Uses contextBridge to safely expose main process functionality

#### Renderer Processes
Two separate renderer processes for different application modes:

##### Editor Renderer (src/renderer/editor)
* **Purpose:** Full-featured game development environment

* **Capabilities:**
  - Load, edit, and save project files from src/project
  - Visual scene editor with drag-and-drop functionality
  - Asset management and import tools
  - Game object property editing
  - Real-time preview capabilities

* **Technology:** React.js application with PIXI.js integration for game preview

##### Game Renderer (src/renderer/game)
* **Purpose:** Lightweight game runtime for playing completed games

* **Capabilities:**
  - Load and parse JSON project files
  - Render game scenes using PIXI.js
  - Handle game logic and user input
  - Read-only: Cannot modify project files

* **Technology:** Minimal JavaScript application focused on performance

### Data Flow Architecture
```
Editor (React) ←→ src/__Project__/*.json ←→ Game Runtime (PIXI.js)
     ↑                                           ↑
     └── Serialization/Deserialization ────────┘
```

#### Project Directory Structure (`src`)
The `src` directory is organized into the following main parts:

*   **`__Engine__`:** Contains the core, reusable game engine logic.
    *   **`Component`:**  A collection of components that can be attached to game objects to provide functionality (e.g., `TransformComponent`, `SpriteComponent`).
    *   **`GameObject`:**  Manages game object creation, including abstract and concrete implementations.
    *   **`InputDevices`:** Handles input from devices like the mouse.
    *   **`Scene`:** Manages game scenes and the hierarchy of game objects within them.
    *   **`Utils`:** Provides utility functions used throughout the engine.
*   **`__Project__`:** Contains the assets and data for a specific game. This includes scene definitions (`.json`), and game object definitions. Game objects are defined by three associated files with the same base name (e.g., `Bunny`):
    *   **`.ts`:** The TypeScript file containing the class definition for the game object (e.g., `Bunny.ts`). The class name within this file should match the file name.
    *   **`.obj.json`:** A JSON file containing serialized initial values for the game object (e.g., `Bunny.obj.json`).
    *   **`.loaded.ts`:** A TypeScript file responsible for loading initial values from the `.obj.json` file or other sources into the game object instance (e.g., `Bunny.loaded.ts`).
    *   Assets like images (`.png`) are also stored here.
*   **`main`:** The entry point for the Electron main process.
*   **`preload`:** The script that bridges the main and renderer processes.
*   **`renderer`:** Contains the code for the two renderer processes:
    *   **`editor`:** The React-based game editor.
    *   **`game`:** The lightweight game runtime.

#### Component-Based Game Architecture
* **Game Objects:** Entities with attached components (Transform, Sprite, Collider, etc.)
* **Scene Management:** Hierarchical scene structure with parent-child relationships
* **Asset References:** JSON files contain paths/IDs rather than embedded binary data

## 5. Coding Conventions & Style Guide
### Formatting (BiomeJS Configuration)
From `biome.json`:
- **Indentation:** 2 spaces
- **Line Width:** 100 characters
- **Quote Style:** Double quotes for JavaScript/TypeScript
- **Semicolons:** Required
- **Trailing Commas:** Where valid

### Naming Conventions

* **Variables:** `snake_case`
```Typescript
const game_object = {};
```

* **Functions:** `camelCase`
```Typescript
function loadScene(scenePath: string) { }
```

* **Classes & Components:** `PascalCase`
```Typescript
class GameEngine { }
function SceneEditor() { }
```

* **Constants:** `SCREAMING_SNAKE_CASE`
```Typescript
const MAX_TEXTURE_SIZE = 2048;
```

* **Files:**
  - **React components:** PascalCase.tsx (e.g., SceneEditor.tsx)
  - **Utilities/modules:** kebab-case.ts (e.g., asset-loader.ts)

## 6. Key Files & Entrypoints
### Local Development
* **Start Development:** `pnpm dev` - Launches both editor and game in development mode
* **Hot Reload:** Vite provides instant updates for renderer processes
* **Debug Mode:** Electron DevTools available for debugging

### Testing Strategy
* **Unit Tests:** `pnpm` test - Run test suite with Vitest
* **CI Testing:** `pnpm test:ci` - CI-specific test configuration (DO NOT use locally)
* **Type Checking:** `pnpm test:type` - Verify TypeScript types
* **Integration:** Test editor-to-game data flow with sample projects

### Quality Assurance
* **Linting:** `pnpm lint` - Check code style and potential issues
* **Formatting:** Automatic formatting on save with BiomeJS
* **Type Safety:** Continuous TypeScript checking during development

### Build Process
* **Development Build:** `pnpm build` - Create development build for testing
* **Production Build:** `pnpm build:prod` - Optimized build for distribution
* **Packaging:** `electron-builder` creates platform-specific installers

## 7. Development & Testing Workflow

* **Local Development Environment:** Run `pnpm dev` to start the application in development mode. The IA agent not must use this command for testing purposes.
* **Testing:** Run `pnpm test` to execute tests with `vitest`. The command `pnpm test:ci` is used ONLY in the CI pipeline.
* **CI/CD Process:** On every pull request, the following actions are triggered:
    - **Type-Safe:** TypeScript types are checked using `pnpm test:type`.
    - **Lint:** The code is checked for linting errors using `pnpm lint`.
    - **Build:** The application is built using `pnpm build`.
    - **Test:** Tests are run using `pnpm test:ci`.

## 8. Editor Panels

The editor UI is composed of several panels, each with a specific purpose:

*   **Hierarchy Panel:** Displays the hierarchy of game objects in the current scene.
*   **Inspector Panel:** Allows viewing and editing the properties of the selected game object.
*   **Project Panel:** Shows the file structure of the `__Project__` directory, allowing for asset management.
*   **Scene Panel:** The main view where you can visually arrange game objects in the scene.
*   **Game Panel:** A preview of how the game looks and plays.
*   **Console Panel:** Displays logs, warnings, and errors from the engine and game.
