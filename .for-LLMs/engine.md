# Engine Architecture Reference

## Overview
TypeScript-based game engine with singleton architecture, physics simulation, and component-based design.

## Core Systems

### TypeEngine (Singleton)
Central coordinator managing game lifecycle and system coordination.

**File**: `src/__Engine__/TypeEngine.ts`

**Key Features**:
- Singleton pattern for global game state
- Game loop with requestAnimationFrame
- Scene management and loading
- Sprite-body synchronization
- Resource cleanup and memory management

**Usage**:
```typescript
const engine = TypeEngine.getInstance();
await engine.loadScene(scene);
engine.startGameLoop();
```

### Physics System
Matter.js integration for realistic physics simulation.

#### PhysicsWorldManager
**File**: `src/__Engine__/Physics/PhysicsWorldManager.ts`

- Pure physics simulation (no sprites)
- Body management and collision detection
- Matter.js engine updates
- Physics world coordination

#### PhysicsEngine
**File**: `src/__Engine__/Physics/PhysicsEngine.ts`

- Matter.js Engine wrapper
- Gravity and world configuration
- Body creation and management

### Render System
PIXI.js integration for sprite rendering.

#### RenderEngine
**File**: `src/__Engine__/Render/RenderEngine.ts`

- Pure sprite management (no physics)
- PIXI.js operations
- Batch sprite loading
- Render cleanup

#### Key Features
- Decoupled from physics simulation
- Efficient sprite batching with Promise.all
- Memory management and cleanup
- Direct PIXI.js integration

### Scene System
**File**: `src/__Engine__/Scene/index.ts`

- Game object hierarchy
- Physics and sprite coordination
- Component aggregation
- Scene lifecycle management

## Components

### Transform Components
**File**: `src/__Engine__/Component/TransformComponent.ts`
- Position, rotation, scale data
- 2D transformation properties

### Visual Components
**File**: `src/__Engine__/Component/SpriteComponent.ts`
- PIXI.js sprite rendering
- Texture integration
- Visual properties

**File**: `src/__Engine__/Component/TextureComponent.ts`
- Texture loading and management
- Asset path handling

### Physics Components
**Directory**: `src/__Engine__/Component/Body/`

#### BodyComponent (Abstract)
**File**: `src/__Engine__/Component/Body/BodyComponent.ts`
- Matter.js Body integration
- Physics properties (friction, restitution, density)
- Abstract base for all physics bodies

#### RectangularBodyComponent
**File**: `src/__Engine__/Component/Body/RectangularBodyComponent.ts`
- Rectangular physics bodies
- Position and dimension control
- Matter.js rectangle creation

### Game Objects
**Directory**: `src/__Engine__/GameObject/`

#### AbstractGameObject
**File**: `src/__Engine__/GameObject/AbstractGameObject.ts`
- Base class for all entities
- Component management
- Lifecycle methods

#### ConcreteGameObject
**File**: `src/__Engine__/GameObject/ConcreteGameObject.ts`
- JSON-based object creation
- Generic entity implementation

### Input Devices
**Directory**: `src/__Engine__/InputDevices/`

#### Mouse
**File**: `src/__Engine__/InputDevices/Mouse/Mouse.ts`
- Mouse input handling
- Event management
- Position tracking

### Utilities
**Directory**: `src/__Engine__/Utils/`

#### Angle
**File**: `src/__Engine__/Utils/Angle.ts`
- Angle calculations and conversions
- Degree/radian utilities

#### ID Generator
**File**: `src/__Engine__/Utils/id.ts`
- Unique ID generation
- Engine object identification

## Architecture Patterns

### Singleton Pattern
- TypeEngine ensures single game coordinator
- Global state management
- Resource sharing across systems

### Separation of Concerns
- Physics: Pure Matter.js simulation
- Rendering: Pure PIXI.js operations
- Coordination: TypeEngine manages synchronization

### Component System
- Data-focused components
- Composition over inheritance
- JSON serialization support

## File Structure

### Component Registration
**File**: `src/__Engine__/Component/index.ts`
- Component class registry
- Type definitions
- JSON deserialization

### Engine Exports
**File**: `src/__Engine__/index.ts`
- Main engine exports
- Public API surface

### Project Structure
- `*.ts`: Game object classes
- `*.obj.json`: Initial values
- `*.loaded.ts`: Loading logic

## Development Guidelines

### Adding Components
1. Extend `GameComponent` base class
2. Implement in appropriate directory
3. Register in component index
4. Write comprehensive tests

### Extending Physics
1. Extend `BodyComponent` abstract class
2. Implement `createBody()` method
3. Add to `Component/Body/` directory
4. Test Matter.js integration

### Scene Management
1. Create game objects with components
2. Assemble into GameScene
3. Load via TypeEngine
4. Start game loop for coordination

## Testing
- Unit tests: `*.spec.ts` files
- Integration tests: Component composition
- Physics tests: Matter.js integration
- Engine tests: Coordination and lifecycle