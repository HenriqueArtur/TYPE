# TYPE Game Engine Components Reference

This comprehensive reference covers all built-in components in the TYPE Game Engine's Entity-Component-System (ECS) architecture.

## Component Categories

### Drawable Components
Visual rendering components using PIXI.js

### Physics Components
Physics simulation components using Matter.js

### Input Components
User input handling components

### Event Components
Event handling and scripting components

### Utility Components
Core utility components for common game object properties

---

## Drawable Components

### SpriteComponent
**Description**: Renders textures and images using PIXI.js for 2D graphics display.

**Key Properties**:
- `texture_path` (required): Path to texture/image file
- `position`: World coordinates `{ x, y }` (default: `{ x: 0, y: 0 }`)
- `scale`: Scale multipliers `{ x, y }` (default: `{ x: 1, y: 1 }`)
- `rotation`: Rotation in radians (default: `0`)
- `alpha`: Opacity 0-1 (default: `1`)
- `tint`: Hex color tint (optional)
- `visible`: Visibility boolean (default: `true`)
- `anchor`: Anchor point 0-1 (default: `0.5`)

**Documentation**: [docs/components/drawable/sprite.md](../docs/components/drawable/sprite.md)

**Implementation**: [src/__Engine__/Component/Drawable/SpriteComponent.ts](../src/__Engine__/Component/Drawable/SpriteComponent.ts)

---

### CircleComponent
**Description**: Renders circular shapes with customizable styling using PIXI.js Graphics.

**Key Properties**:
- `radius` (required): Circle radius in pixels
- `position`: World coordinates `{ x, y }` (default: `{ x: 0, y: 0 }`)
- `scale`: Scale multipliers `{ x, y }` (default: `{ x: 1, y: 1 }`)
- `rotation`: Rotation in radians (default: `0`)
- `alpha`: Opacity 0-1 (default: `1`)
- `visible`: Visibility boolean (default: `true`)
- `fill`: Fill styling `{ enabled, color }` (optional)
- `stroke`: Stroke styling `{ enabled, color, width }` (optional)

**Documentation**: [docs/components/drawable/circle.md](../docs/components/drawable/circle.md)

**Implementation**: [src/__Engine__/Component/Drawable/Shapes/CircleComponent.ts](../src/__Engine__/Component/Drawable/Shapes/CircleComponent.ts)

---

### RectangleComponent
**Description**: Renders rectangular shapes with flexible styling and anchor positioning using PIXI.js Graphics.

**Key Properties**:
- `width` (required): Rectangle width in pixels
- `height` (required): Rectangle height in pixels
- `position`: World coordinates `{ x, y }` (default: `{ x: 0, y: 0 }`)
- `scale`: Scale multipliers `{ x, y }` (default: `{ x: 1, y: 1 }`)
- `rotation`: Rotation in radians (default: `0`)
- `alpha`: Opacity 0-1 (default: `1`)
- `visible`: Visibility boolean (default: `true`)
- `anchor`: Anchor point 0-1 (default: `0.5`)
- `fill`: Fill styling `{ enabled, color }` (optional)
- `stroke`: Stroke styling `{ enabled, color, width }` (optional)

**Documentation**: [docs/components/drawable/rectangle.md](../docs/components/drawable/rectangle.md)

**Implementation**: [src/__Engine__/Component/Drawable/Shapes/RectangleComponent.ts](../src/__Engine__/Component/Drawable/Shapes/RectangleComponent.ts)

---

## Physics Components

### RigidBodyRectangleComponent
**Description**: Creates dynamic physics bodies that respond to forces, collisions, and physics simulation using Matter.js.

**Key Properties**:
- `x` (required): X position of body center
- `y` (required): Y position of body center
- `width` (required): Rectangle width in pixels
- `height` (required): Rectangle height in pixels
- `velocity`: Initial velocity `{ x, y }` (default: `{ x: 0, y: 0 }`)
- `angularVelocity`: Rotational velocity rad/s (default: `0`)
- `rotation`: Initial rotation in radians (default: `0`)
- `restitution`: Bounce factor 0-1+ (default: `0.8`)
- `friction`: Surface friction coefficient (default: `0.001`)
- `frictionAir`: Air resistance/drag (default: `0.01`)
- `density`: Mass density (default: `0.001`)

**Documentation**: [docs/components/physics/rigid-body-rectangle.md](../docs/components/physics/rigid-body-rectangle.md)

**Implementation**: [src/__Engine__/Component/Physics/RigidBodyRectangleComponent.ts](../src/__Engine__/Component/Physics/RigidBodyRectangleComponent.ts)

---

### RigidBodyCircleComponent
**Description**: Creates dynamic circular physics bodies for round objects using Matter.js.

**Key Properties**:
- `x` (required): X position of body center
- `y` (required): Y position of body center
- `radius` (required): Circle radius in pixels
- `velocity`: Initial velocity `{ x, y }` (default: `{ x: 0, y: 0 }`)
- `angularVelocity`: Rotational velocity rad/s (default: `0`)
- `rotation`: Initial rotation in radians (default: `0`)
- `restitution`: Bounce factor 0-1+ (default: `0.8`)
- `friction`: Surface friction coefficient (default: `0.001`)
- `frictionAir`: Air resistance/drag (default: `0.01`)
- `density`: Mass density (default: `0.001`)

**Documentation**: [docs/components/physics/rigid-body-circle.md](../docs/components/physics/rigid-body-circle.md)

**Implementation**: [src/__Engine__/Component/Physics/RigidBodyCircleComponent.ts](../src/__Engine__/Component/Physics/RigidBodyCircleComponent.ts)

---

### ColliderRectangleComponent
**Description**: Creates static collision bodies for immovable barriers and platforms using Matter.js.

**Key Properties**:
- `x` (required): X position of collider center
- `y` (required): Y position of collider center
- `width` (required): Rectangle width in pixels
- `height` (required): Rectangle height in pixels
- `rotation`: Rotation in radians (default: `0`)
- `frictionStatic`: Static friction coefficient (default: `0.001`)

**Documentation**: [docs/components/physics/collider-rectangle.md](../docs/components/physics/collider-rectangle.md)

**Implementation**: [src/__Engine__/Component/Physics/ColliderRectangleComponent.ts](../src/__Engine__/Component/Physics/ColliderRectangleComponent.ts)

---

### ColliderCircleComponent
**Description**: Creates static circular collision bodies for round barriers using Matter.js.

**Key Properties**:
- `x` (required): X position of collider center
- `y` (required): Y position of collider center
- `radius` (required): Circle radius in pixels
- `rotation`: Rotation in radians (default: `0`)
- `frictionStatic`: Static friction coefficient (default: `0.001`)

**Documentation**: [docs/components/physics/collider-circle.md](../docs/components/physics/collider-circle.md)

**Implementation**: [src/__Engine__/Component/Physics/ColliderCircleComponent.ts](../src/__Engine__/Component/Physics/ColliderCircleComponent.ts)

---

### SensorRectangleComponent
**Description**: Creates trigger areas that detect when objects enter/exit without blocking movement using Matter.js.

**Key Properties**:
- `x` (required): X position of sensor center
- `y` (required): Y position of sensor center
- `width` (required): Rectangle width in pixels
- `height` (required): Rectangle height in pixels
- `rotation`: Rotation in radians (default: `0`)

**Documentation**: [docs/components/physics/sensor-rectangle.md](../docs/components/physics/sensor-rectangle.md)

**Implementation**: [src/__Engine__/Component/Physics/SensorRectangleComponent.ts](../src/__Engine__/Component/Physics/SensorRectangleComponent.ts)

---

### SensorCircleComponent
**Description**: Creates circular trigger areas for round detection zones using Matter.js.

**Key Properties**:
- `x` (required): X position of sensor center
- `y` (required): Y position of sensor center
- `radius` (required): Circle radius in pixels
- `rotation`: Rotation in radians (default: `0`)

**Documentation**: [docs/components/physics/sensor-circle.md](../docs/components/physics/sensor-circle.md)

**Implementation**: [src/__Engine__/Component/Physics/SensorCircleComponent.ts](../src/__Engine__/Component/Physics/SensorCircleComponent.ts)

---

## Input Components

### MouseComponent
**Description**: Handles mouse input state, tracking position, button states, and scroll wheel data.

**Key Properties**:
- `screenPosition`: Screen coordinates `{ x, y }` (default: `{ x: 0, y: 0 }`)
- `windowPosition`: Window coordinates `{ x, y }` (default: `{ x: 0, y: 0 }`)
- `buttons`: Button states `{ left, right, middle }` (default: all `false`)
- `wheel`: Scroll wheel deltas `{ deltaX, deltaY, deltaZ }` (default: all `0`)

**Documentation**: [docs/components/input/mouse.md](../docs/components/input/mouse.md)

**Implementation**: [src/__Engine__/Component/Input/MouseComponent.ts](../src/__Engine__/Component/Input/MouseComponent.ts)

---

## Event Components

### EventComponent
**Description**: General-purpose event handling component that allows attaching JavaScript event handlers to entities.

**Key Properties**:
- `scriptPath` (required): Project-relative path to event handler script file (must end with `.js`)

**Script Pattern**: Event scripts must follow the EventHandler interface pattern with `event` name and `handler` function.

**Documentation**: [docs/components/event/event-component.md](../docs/components/event/event-component.md)

**Implementation**: [src/__Engine__/Component/Event/EventComponent.ts](../src/__Engine__/Component/Event/EventComponent.ts)

---

### OnCollisionEventComponent
**Description**: Specialized event component for handling collision-specific events with automatic collision detection.

**Key Properties**:
- `scriptPath` (required): Project-relative path to collision event handler script file (must end with `.js`)

**Special Behavior**: Automatically triggers when the entity with this component collides with other physics bodies.

**Documentation**: [docs/components/event/on-collision-event-component.md](../docs/components/event/on-collision-event-component.md)

**Implementation**: [src/__Engine__/Component/Event/OnCollisionEventComponent.ts](../src/__Engine__/Component/Event/OnCollisionEventComponent.ts)

---

## Utility Components

### TransformComponent
**Description**: Provides standardized spatial transformation properties for game objects, handling position, scale, and rotation in 2D space.

**Key Properties**:
- `position`: World coordinates `{ x, y }` (default: `{ x: 0, y: 0 }`)
- `scale`: Scale multipliers `{ x, y }` (default: `{ x: 1, y: 1 }`)
- `rotation`: Rotation in radians (default: `0`)

**Documentation**: [docs/components/utils/transform.md](../docs/components/utils/transform.md)

**Implementation**: [src/__Engine__/Component/Utils/TransformComponent.ts](../src/__Engine__/Component/Utils/TransformComponent.ts)

---

## Component Development Guidelines

### Creating Custom Components

1. **File Structure**: Create `.component.ts` files in your project folder
2. **Interface Pattern**: Follow `ComponentInstanceManage` interface with `name`, `create`, and `serialize` methods
3. **Data-Only Design**: Components should contain only data properties, no methods
4. **Default Values**: Provide sensible defaults for optional properties
5. **Registration**: Register in `component.manage.json` with `.js` extension

### Component Architecture Principles

- **Pure Data**: Components store state, systems provide behavior
- **Serializable**: All components must be serializable to/from JSON
- **Type Safe**: Use TypeScript interfaces for data validation
- **Performance**: Keep components lightweight and cache-friendly
- **Composable**: Design components to work together via systems

### Common Patterns

- **Transform Properties**: Position, scale, rotation are common drawable properties
- **Physics Integration**: Physics components use Matter.js Body objects internally
- **Resource Management**: Components with `_resource` properties for asset references
- **PIXI.js Integration**: Drawable components use `_drawable` property for PIXI objects

---

## Usage Examples

### Basic Entity Creation
```typescript
// Scene JSON example
{
  "gameObjects": [
    {
      "name": "Player",
      "components": [
        {
          "name": "TransformComponent",
          "data": {
            "position": { "x": 100, "y": 200 },
            "scale": { "x": 1, "y": 1 },
            "rotation": 0
          }
        },
        {
          "name": "SpriteComponent",
          "data": {
            "texture_path": "player.png",
            "position": { "x": 100, "y": 200 }
          }
        },
        {
          "name": "RigidBodyRectangleComponent", 
          "data": {
            "x": 100,
            "y": 200,
            "width": 32,
            "height": 48
          }
        },
        {
          "name": "MouseComponent",
          "data": {}
        }
      ]
    }
  ]
}
```

### System Component Queries
```typescript
// Example system querying multiple components with Transform
const entities = engine.EntityEngine.query<{
  TransformComponent: TransformComponent[];
  SpriteComponent: SpriteComponent[];
  RigidBodyRectangleComponent: RigidBodyRectangleComponent[];
}>(["TransformComponent", "SpriteComponent", "RigidBodyRectangleComponent"]);

for (const { components } of entities) {
  const transform = components.TransformComponent[0];
  const sprite = components.SpriteComponent[0];
  const rigidBody = components.RigidBodyRectangleComponent[0];
  
  // Sync transform with physics body
  transform.position.x = rigidBody._body.position.x;
  transform.position.y = rigidBody._body.position.y;
  transform.rotation = rigidBody._body.angle;
  
  // Apply transform to sprite
  sprite.position = transform.position;
  sprite.scale = transform.scale;
  sprite.rotation = transform.rotation;
}
```