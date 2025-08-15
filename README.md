# 🚀 Engine-Ts: Game Engine & Editor

A TypeScript-based game engine and visual editor built with Electron, React, and PIXI.js. This project serves as both a functional game development platform and an academic exploration of modern software architecture patterns.

**Academic Context**: Final project for MBA in Software Engineering at USP Brazil 🎓🇧🇷

## 🎯 Project Overview

Engine-Ts is a desktop application that provides:

- **Visual Game Editor**: React-based interface for game development
- **Lightweight Game Runtime**: PIXI.js-powered 2D rendering engine
- **Component-Based Architecture**: Modular system for game objects and scenes
- **JSON-Based Project Files**: Human-readable, version-control-friendly game data

### Core Technologies

- **TypeScript**: Type-safe development with modern language features
- **Electron**: Cross-platform desktop application framework
- **React 19**: Modern UI library for the editor interface
- **PIXI.js 8**: High-performance 2D WebGL rendering
- **Vite**: Fast build tooling and development server
- **Vitest**: Comprehensive testing framework
- **Biome**: Code formatting and linting

## 🏗️ Architecture

### Multi-Process Electron Structure

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Process  │    │  Editor Renderer │    │  Game Renderer  │
│                 │    │     (React)      │    │    (PIXI.js)    │
│ • App lifecycle │    │ • Visual editor  │    │ • Game runtime  │
│ • Window mgmt   │◄──►│ • Asset mgmt     │    │ • JSON loading  │
│ • File system   │    │ • Scene editor   │    │ • Component sys │
│ • IPC handling  │    │ • UI components  │    │ • Input handling│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                   ┌─────────────────────────────┐
                   │      Preload Script         │
                   │   (Secure IPC Bridge)       │
                   └─────────────────────────────┘
```

### Directory Structure

```
src/
├── __Engine__/              # Reusable game engine core
│   ├── Component/           # ECS components (Transform, Sprite, Texture)
│   ├── GameObject/          # Game object abstractions
│   ├── Scene/              # Scene management and loading
│   ├── InputDevices/       # Input handling (Mouse, etc.)
│   └── Utils/              # Engine utilities
├── __Project__/            # Game-specific content
│   ├── scene.json          # Scene definitions
│   ├── *.ts                # Game object classes
│   ├── *.obj.json          # Object initial values
│   ├── *.loaded.ts         # Object loading logic
│   └── assets/             # Game assets (images, sounds)
├── main/                   # Electron main process
├── preload/                # Secure IPC bridge
└── renderer/
    ├── editor/             # React-based game editor
    └── game/               # PIXI.js game runtime
```

### Data Flow

```
Editor (React) ←→ src/__Project__/*.json ←→ Game Runtime (PIXI.js)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+ (recommended package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HenriqueArtur/Engine-Ts.git
   cd Engine-Ts
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development**
   ```bash
   pnpm dev
   ```

This launches both the editor and game runtime in development mode with hot reloading.

## 🛠️ Development

### Available Commands

```bash
# Development
pnpm dev                    # Start development mode
pnpm build                  # Build for production
pnpm test                   # Run test suite
pnpm test:type             # TypeScript type checking
pnpm lint                  # Code linting and formatting

# Testing
pnpm test -- <file>        # Run specific test file
pnpm test:ci               # CI test configuration

# Building & Distribution
pnpm build:linux          # Build Linux distributables
pnpm build:mac             # Build macOS distributables
pnpm build:win             # Build Windows distributables

# Maintenance
pnpm update:dependencies   # Interactive dependency updates
```

### Development Workflow

This project follows **Test-Driven Development (TDD)**:

1. **Write Tests First**: Create `.spec.ts` files before implementing features
2. **Red Phase**: Ensure tests fail initially
3. **Green Phase**: Write minimal code to pass tests
4. **Refactor Phase**: Improve code while maintaining test coverage

### Code Quality Standards

- **Type Safety**: Strict TypeScript configuration
- **Code Style**: Biome formatter with 2-space indentation, 100-char line width
- **Testing**: Comprehensive test coverage with Vitest
- **Linting**: Zero-tolerance for `any` types and code quality issues

## 🎮 Creating Games

### Component-Based Architecture

Games are built using an Entity-Component System:

```typescript
// Game objects have components
const gameObject = new ConcreteGameObject({
  transform: new TransformComponent({
    position: { x: 100, y: 200 },
    scale: { x: 1, y: 1 },
    rotation: Angle.fromDegrees(45)
  }),
  sprite: new SpriteComponent({
    texture: new TextureComponent({ path: "player.png" }),
    // ... transform properties inherited
  })
});
```

### Game Object Structure

Each game object requires three files:

- **`GameObject.ts`**: Class definition with game logic
- **`GameObject.obj.json`**: Serialized initial values
- **`GameObject.loaded.ts`**: Loading and initialization logic

### Scene Management

Scenes are defined in JSON format:

```json
{
  "name": "MainScene",
  "gameObjects": [
    {
      "id": "player",
      "name": "Player",
      "script": "Player.js",
      "components": {
        "sprite": {
          "type": "SpriteComponent",
          "initial_values": {
            "texture": "player.png",
            "position": { "x": 400, "y": 300 }
          }
        }
      }
    }
  ]
}
```

## 🔧 Extending the Engine

### Adding New Components

1. **Create component class** in `src/__Engine__/Component/`
2. **Implement required interfaces** (`GameComponent`)
3. **Register in component registry** (`COMPONENT_CLASSES`)
4. **Write comprehensive tests** (`.spec.ts`)

### Adding Input Devices

1. **Create device class** in `src/__Engine__/InputDevices/`
2. **Implement event handling**
3. **Integrate with game loop**
4. **Add tests for all functionality**

### Custom Game Objects

1. **Extend `GameObject`** abstract class
2. **Implement `update()` method**
3. **Create associated `.obj.json` and `.loaded.ts` files
4. **Reference in scene definitions**

## 📁 Important Files

- **`CLAUDE.md`**: AI development guidelines and TDD requirements
- **`GEMINI.md`**: Comprehensive project context and collaboration rules
- **`biome.json`**: Code formatting and linting configuration
- **`electron.vite.config.ts`**: Build configuration for all processes
- **`vitest.config.ts`**: Testing framework configuration

## 🔒 Security Considerations

- **IPC Validation**: All inter-process communication is validated
- **File System Access**: Secure path handling prevents directory traversal
- **Electron Security**: Context isolation enabled, node integration disabled
- **Asset Path Integrity**: Critical paths in `src/renderer/game/index.ts` are protected

## 🧪 Testing

Comprehensive test coverage includes:

- **Unit Tests**: All components, utilities, and core functionality
- **Integration Tests**: Scene loading, component interactions
- **Type Tests**: TypeScript type safety verification
- **Mocking**: PIXI.js and Electron APIs for isolated testing

Run tests with:
```bash
pnpm test              # All tests
pnpm test:type         # Type checking
pnpm lint              # Code quality
```

## 📖 Documentation

- **Development Guidelines**: See `CLAUDE.md`
- **Project Context**: See `GEMINI.md`
- **API Documentation**: Generated from TypeScript annotations
- **Architecture Decisions**: Documented in code comments

## 🤝 Contributing

This project follows strict development practices:

1. **TDD Approach**: Tests before implementation
2. **Type Safety**: No `any` types allowed
3. **Code Quality**: Biome linting with error-level rules
4. **Security First**: Follow security guidelines in `GEMINI.md`

## 📄 License

This project is part of an academic research program at USP Brazil. Please respect intellectual property rights and academic integrity guidelines.

---

**Academic Institution**: Universidade de São Paulo (USP) 🇧🇷  
**Program**: MBA in Software Engineering  
**Focus**: Modern software architecture and game engine design patterns