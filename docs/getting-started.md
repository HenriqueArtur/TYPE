# Getting Started

Welcome to **Type** - the modern TypeScript game engine! This guide will help you get up and running quickly.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** 18 or higher
- **pnpm** 8 or higher (recommended package manager)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/HenriqueArtur/Type.git
cd Type
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development

```bash
pnpm dev
```

This launches the game runtime in development mode with hot reloading.

## Project Structure

Once you have the project running, you'll see this structure:

```
Type/
├── src/
│   ├── __Engine__/              # 🎮 Core Engine
│   │   ├── TypeEngine.ts        # Main coordinator
│   │   ├── Engines/             # Sub-engines
│   │   ├── Systems/             # Game logic systems
│   │   └── Component/           # ECS components
│   ├── __Project__/             # 🧪 Test environment
│   ├── main/                    # 🔧 Electron main process
│   ├── preload/                 # 🔒 IPC bridge
│   └── renderer/game/           # 🎮 Game runtime
├── docs/                        # 📚 Documentation
└── package.json
```

## Your First Engine Instance

Create a basic TypeEngine setup:

```typescript
import { TypeEngine } from './__Engine__/TypeEngine'

// Create engine with configuration
const engine = new TypeEngine({
  projectPath: './src/__Project__',
  Render: {
    canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
    width: 1024,
    height: 768,
    backgroundColor: 0x1099bb
  },
  Physics: {
    gravity: { x: 0, y: 0.8 }
  }
})

// Initialize all sub-engines
await engine.setup()

// Start the game loop
engine.start()
```

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development mode |
| `pnpm build` | Build for production |
| `pnpm test` | Run test suite |
| `pnpm test:type` | TypeScript type checking |
| `pnpm lint` | Code linting and formatting |
| `pnpm docs:dev` | Start documentation server |
| `pnpm docs:build` | Build documentation |

## Development Workflow

Type follows **Test-Driven Development (TDD)**:

1. **Write Tests First**: Create `.spec.ts` files before implementing features
2. **Red Phase**: Ensure tests fail initially  
3. **Green Phase**: Write minimal code to pass tests
4. **Refactor Phase**: Improve code while maintaining test coverage

## Next Steps

Now that you have Type running locally:

1. **Explore the Architecture**: Learn about the [multi-engine design](/architecture)
2. **Understanding ECS**: Dive into the [Entity Component System](/architecture/ecs)  
3. **Create Components**: Build your first [custom components](/components)
4. **Write Systems**: Implement [game logic systems](/systems)

## Need Help?

- 📚 Check the full [documentation](/architecture)
- 🐛 Report issues on [GitHub](https://github.com/HenriqueArtur/Type/issues)
- 💡 Join discussions in the repository

---

::: tip Development Environment
The `__Project__` directory contains test scenes, entities, and systems that demonstrate engine capabilities. Use these as examples while learning the engine architecture.
:::

::: warning TypeScript Strict Mode
Type uses strict TypeScript configuration. Make sure your code follows type safety guidelines - no `any` types are allowed!
:::