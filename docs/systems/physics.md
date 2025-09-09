# Physics System

The Physics System manages the Matter.js physics simulation, updating all physics bodies and handling collision detection and response.

## Purpose

The Physics System handles:
- Physics engine updates and simulation steps
- Collision detection and response
- Force application and physics body management
- Integration with physics components (ColliderRectangle, RigidBodyRectangle, SensorRectangle)

## System Properties

| Property | Value | Description |
|----------|--------|-------------|
| `name` | `"PhysicsSystem"` | System identifier |
| `priority` | `1` | Executes early (physics before rendering) |
| `enabled` | `true` | Enabled by default |

## Implementation

```typescript
export class PhysicsSystem implements System<TypeEngine> {
  name = "PhysicsSystem";
  priority = 1;
  enabled = true;

  async init(_engine: TypeEngine) {
    // Physics system initialization
    // PhysicsEngine is already set up by TypeEngine
  }

  update(engine: TypeEngine, deltaTime: number): void {
    engine.PhysicsEngine.update(deltaTime);
  }

  destroy(_engine: TypeEngine): void {
    // Physics cleanup if needed
  }
}
```

## Functionality

### Physics Engine Update
The system calls `engine.PhysicsEngine.update(deltaTime)` which:
- Steps the Matter.js physics simulation forward
- Updates positions and rotations of all physics bodies
- Processes collisions and applies forces
- Maintains physics world state

### Component Integration
The Physics System works with physics components:

**ColliderRectangleComponent**: Static collision bodies
- Bodies remain in fixed positions
- Provide collision surfaces for other bodies
- Used for walls, platforms, and barriers

**RigidBodyRectangleComponent**: Dynamic physics bodies  
- Bodies respond to forces and collisions
- Affected by gravity and physics simulation
- Used for movable objects, characters, projectiles

**SensorRectangleComponent**: Trigger detection areas
- Bodies detect collisions without blocking movement
- Generate collision events for game logic
- Used for checkpoints, power-ups, danger zones

### Physics Properties
The system processes physics material properties:
- **Mass/Density**: How heavy objects are
- **Friction**: Surface grip and sliding behavior  
- **Restitution**: Bounce and energy conservation
- **Air Resistance**: Drag and terminal velocity

## Usage

### Component Data Synchronization
The Physics System has only one purpose: synchronize component data with Matter.js physics data:

```typescript
// The system automatically:
// 1. Updates Matter.js simulation with deltaTime
// 2. Syncs component positions from physics body positions
// 3. Syncs component rotations from physics body rotations
// 4. Updates velocity data in components from physics bodies
```

### Integration with Other Systems
The Physics System integrates with other systems through component data:

```typescript
// Physics runs first (priority 1)
PhysicsSystem.update(engine, deltaTime); // Updates component data from physics

// Then rendering systems use updated component data (priority 2+)
RenderPixiSystem.update(engine, deltaTime); // Reads component data for rendering
```

## Performance Considerations

### Frame Rate
- Physics simulation is frame-rate independent
- Uses deltaTime for consistent behavior
- Maintains stable physics regardless of FPS

### Optimization
- Static bodies (colliders) are highly optimized
- Sensors have minimal performance impact
- Dynamic bodies scale with simulation complexity

### Collision Detection
- Broad-phase collision detection for performance
- Narrow-phase for accurate collision response
- Spatial partitioning for large worlds

## Common Patterns

### Component Data Updates
```typescript
// Other systems modify component data, Physics System syncs with Matter.js
class MovementSystem implements System<TypeEngine> {
  update(engine: TypeEngine, deltaTime: number): void {
    const entities = engine.EntityEngine.query(["RigidBodyRectangleComponent", "InputComponent"]);
    
    for (const { components } of entities) {
      const rigidBody = components.RigidBodyRectangleComponent[0];
      const input = components.InputComponent[0];
      
      // Modify component data - Physics System will sync with Matter.js
      if (input.moveLeft) rigidBody.velocity.x = -100;
      if (input.moveRight) rigidBody.velocity.x = 100;
    }
  }
}
```

### Collision Event Handling
```typescript
// Collision events are already emitted by PhysicsEngine
// In the future, entities will have components to register for these events
// For now, collision events are handled at the engine level
```

### Physics Property Updates
```typescript
// Modify physics properties through component data
class PhysicsMaterialSystem implements System<TypeEngine> {
  update(engine: TypeEngine, deltaTime: number): void {
    const entities = engine.EntityEngine.query(["RigidBodyRectangleComponent"]);
    
    for (const { components } of entities) {
      const rigidBody = components.RigidBodyRectangleComponent[0];
      
      // Update physics properties through component data
      rigidBody.friction = 0.8; // High friction
      rigidBody.restitution = 0.2; // Low bounce
      // Physics System will sync these changes with Matter.js
    }
  }
}
```

::: warning
Do not call Matter.js methods directly. In the future, PhysicsEngine will provide functions for force application and other physics operations. Always modify component data and let the Physics System handle synchronization.
:::

## Notes

- Physics System must run before rendering systems to provide updated positions
- Integrates seamlessly with Matter.js physics engine
- Handles all physics components automatically without additional configuration
- Performance scales with number of dynamic bodies and collision complexity
- Provides foundation for realistic game physics and collision detection