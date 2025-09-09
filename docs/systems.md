# Systems

Systems are the logic processors in TYPE Game Engine's Entity-Component-System (ECS) architecture. While [Components](/components) store only data, Systems contain the behavior and logic that operate on component data to create gameplay functionality.

## System Architecture

Systems in TYPE follow the `System<TEngine>` interface and are managed by the **SystemEngine**. Each system:

- **Processes component data**: Systems query entities with specific components and operate on their data
- **Contains game logic**: All behavior, calculations, and game mechanics are implemented in systems
- **Runs in priority order**: Systems execute in order based on their priority value (lower = earlier)
- **Manages lifecycle**: Systems can initialize, update, and clean up resources

## System Interface

```typescript
export interface System<TEngine = unknown> {
  name: string;
  priority: number;  // Lower values execute first
  enabled: boolean;  // Whether system should update
  
  init(engine: TEngine): void | Promise<void>;     // Initialize system
  update(engine: TEngine, deltaTime: number): void; // Update logic
  destroy?(engine: TEngine): void;                 // Cleanup resources
}
```

## Default Systems

TYPE Game Engine includes several built-in systems that handle core functionality:

### Physics Systems
- **[Physics System](/systems/physics)** - Handles Matter.js physics simulation and updates

### Rendering Systems  
- **[Render PIXI System](/systems/render-pixi)** - Renders sprites and drawable components using PIXI.js

### Input Systems
- **[Mouse System](/systems/input/mouse)** - Captures and processes mouse input events

## System Management

Systems are managed by the **SystemEngine**, which handles:

- **Loading**: Automatically loads default systems and custom systems from `system.manage.json`
- **Initialization**: Calls `init()` on all systems during engine setup
- **Execution**: Updates enabled systems every frame in priority order
- **Lifecycle**: Manages system enabling/disabling and cleanup

### System Priority

Systems execute in priority order during each frame:
- **Priority 1**: Physics and input systems (data collection)
- **Priority 2**: Rendering systems (visual updates)
- **Higher priorities**: Game logic, AI, audio, etc.

### System Enabling/Disabling

Systems can be dynamically enabled or disabled:
- **Scene setup**: Only relevant systems are enabled for each scene
- **Performance**: Disable unused systems to improve performance
- **Runtime control**: Toggle systems based on game state

## Creating Custom Systems

To create custom systems in your game project:

### 1. Create System File
Create a TypeScript file in your project folder with pattern:
```
<SystemNameInPascalCase>.system.ts
```

Example: `PlayerMovementSystem.system.ts`

### 2. System Implementation
Implement the System interface:

```typescript
// PlayerMovementSystem.system.ts
import type { System } from "path/to/System";
import type { TypeEngine } from "path/to/TypeEngine";

export class PlayerMovementSystem implements System<TypeEngine> {
  name = "PlayerMovementSystem";
  priority = 1;  // Execute early for input processing
  enabled = true;

  async init(engine: TypeEngine): Promise<void> {
    // Internal engine use only (will be removed in future version)
  }

  update(engine: TypeEngine, deltaTime: number): void {
    // Query entities with required components
    const playerEntities = engine.EntityEngine.query([
      "PlayerComponent", "TransformComponent", "InputComponent"
    ]);

    // Process each entity
    for (const { components } of playerEntities) {
      // Game logic operating on component data
      const transform = components.TransformComponent[0];
      const input = components.InputComponent[0];
      
      // Update transform based on input
      if (input.moveLeft) transform.position.x -= 100 * deltaTime / 1000;
      if (input.moveRight) transform.position.x += 100 * deltaTime / 1000;
    }
  }

  destroy(engine: TypeEngine): void {
    // Internal engine use only (will be removed in future version)
  }
}
```

### 3. Register in system.manage.json
Add your system to the `system.manage.json` file with the system class name and relative path (using `.js` extension):

```json
{
  "PlayerMovementSystem": "./PlayerMovementSystem.system.js"
}
```

::: warning
Use `.js` extension in the registration file, even though your source file is `.ts`. This is because the build system compiles TypeScript to JavaScript.
:::

### 4. System Requirements
Your custom system must:
- Implement the `System<TypeEngine>` interface
- Have a unique `name` property
- Set appropriate `priority` for execution order
- Use `engine.EntityEngine.query()` to find entities with required components
- Operate only on component data (no direct component behavior)

## System Patterns

### Entity Queries
Systems use entity queries to find relevant entities:
```typescript
// Find entities with specific components
const entities = engine.EntityEngine.query(["SpriteComponent", "TransformComponent"]);

// Process matching entities
for (const { components } of entities) {
  const sprite = components.SpriteComponent[0];
  const transform = components.TransformComponent[0];
  // Update sprite position from transform data
}
```

### Delta Time Usage
Use `deltaTime` for frame-rate independent updates:
```typescript
// Movement in pixels per second
const speed = 100; // pixels per second
transform.position.x += speed * (deltaTime / 1000);
```

### Component Updates
Systems should focus on updating component data:
```typescript
update(engine: TypeEngine, deltaTime: number): void {
  const entities = engine.EntityEngine.query(["PlayerComponent", "TransformComponent"]);
  
  for (const { components } of entities) {
    const player = components.PlayerComponent[0];
    const transform = components.TransformComponent[0];
    
    // Update component data only
    transform.position.x += player.velocity * (deltaTime / 1000);
  }
}
```

::: warning
The `init()` and `destroy()` methods are for internal engine use only and will be removed in a future version. Systems should only update component data in the `update()` method.
:::

## Usage

Systems automatically run when enabled and process entities with matching components. The SystemEngine manages the complete lifecycle, ensuring systems execute in the correct order and handle initialization and cleanup properly.

See the individual system documentation for detailed implementation examples and usage patterns.