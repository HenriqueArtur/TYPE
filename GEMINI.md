# GEMINI.MD: AI Collaboration Guide

This document provides essential context for AI models interacting with this project. Adhering to these guidelines will ensure consistency and maintain code quality.

## 1. Project Overview & Purpose

* **Primary Goal:** Based on the `package.json` and `README.md`, this project appears to be a minimal setup for a React application using Vite, with a focus on TypeScript and Electron for desktop application development. The name "Engine-Ts" suggests it might be a game engine or a tool with graphical/rendering capabilities.
* **Business Domain:** The project seems to be in the "Developer Tools" or "Game Development" domain, given the technologies and configurations present.

## 2. Core Technologies & Stack

* **Languages:** TypeScript (version ~5.8.3).
* **Frameworks & Runtimes:** Node.js (v22.14.0), React (v19.1.0), Electron (v36.3.1), Vite (v6.3.5).
* **Databases:** No database is explicitly configured.
* **Key Libraries/Dependencies:**
    - **UI & Rendering:** `react`, `react-dom`, `pixi.js`, `tailwindcss`, `@heroicons/react`, `framer-motion`.
    - **Development & Build:** `electron-vite`, `electron-builder`, `vite`, `vitest`.
    - **Linting & Formatting:** `biomejs`.
* **Package Manager(s):** pnpm (v10.5.2).

## 3. Architectural Patterns

* **Overall Architecture:** The project follows a multi-process architecture typical of Electron applications, with a `main` process, a `preload` script, and a `renderer` process. The renderer process itself is a React application.
* **Directory Structure Philosophy:**
    * `/src/main`: Contains the Electron main process code.
    * `/src/preload`: Contains the script that bridges the main and renderer processes.
    * `/src/renderer/editor`: Contains the source code for the editor's React-based renderer process.
    * `/src/renderer/game`: Contains the source code for the game's renderer process.
    * `/src/project`: Contains project files, like scenes and assets.
    * `/release`: Contains the output of the build process.

## 4. Coding Conventions & Style Guide

* **Formatting:** The project uses `biomejs` for formatting. Key rules from `biome.json`:
    - Indentation: 2 spaces.
    - Line Width: 100 characters.
    - Quote Style: double quotes for JavaScript/TypeScript.
* **Naming Conventions:**
    - `variables`, `functions`: camel_case.
    - `classes`, `components`: PascalCase.
    - `files`: kebab-case or PascalCase for React components.
* **API Design:** Not applicable, as this is a desktop application.
* **Error Handling:** Specific error handling patterns are not yet defined.

## 5. Key Files & Entrypoints

* **Main Entrypoint(s):**
    - Main Process: `src/main/index.ts`
    - Preload Script: `src/preload/index.ts`
    - Renderer Process (Editor): `src/renderer/editor/index.html`
    - Renderer Process (Game): `src/renderer/game/index.html`
* **Configuration:**
    - `electron.vite.config.ts`: Vite configuration for the Electron processes.
    - `package.json`: Project metadata and scripts.
    * `biome.json`: Linter and formatter configuration.
    * `tsconfig.json`: TypeScript configuration.
* **CI/CD Pipeline:**
    - `.github/workflows/build.yaml`: Build workflow.
    - `.github/workflows/lint.yaml`: Linting workflow.
    - `.github/workflows/test.yaml`: Testing workflow.
    - `.github/workflows/type-safe.yaml`: TypeScript type checking workflow.

## 6. Development & Testing Workflow

* **Local Development Environment:** Run `pnpm dev` to start the application in development mode.
* **Testing:** Run `pnpm test` to execute tests with `vitest`. The command `pnpm test:ci` is used in the CI pipeline.
* **CI/CD Process:** On every pull request, the following actions are triggered:
    - **Build:** The application is built using `pnpm run build`.
    - **Lint:** The code is checked for linting errors using `pnpm run lint:ci`.
    - **Test:** Tests are run using `pnpm run test:ci`.
    - **Type-Safe:** TypeScript types are checked using `pnpm run test:type`.

## 7. Specific Instructions for AI Collaboration

* **Contribution Guidelines:** No `CONTRIBUTING.md` file was found. It is recommended to create one.
* **Infrastructure (IaC):** Not applicable.
* **Security:** Be mindful of security best practices, especially when dealing with Electron's main process and IPC (Inter-Process Communication). Do not hardcode secrets or keys.
* **Dependencies:** When adding a new dependency, use `pnpm add <package-name>`.
* **Commit Messages:** No specific commit message format is enforced, but it is recommended to follow the Conventional Commits specification.
* **Asset Paths:** Do not change asset loading paths in `src/renderer/game/index.ts`. The paths are correct for the build process.
