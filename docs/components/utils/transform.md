# Transform Component

The Transform Component provides standardized spatial transformation properties for game objects. It handles position, scale, and rotation in 2D space, making it essential for object placement and movement.

## Purpose

The Transform Component handles:
- World position coordinates
- Scaling for size modifications
- Rotation for object orientation
- Standardized spatial representation

## Properties

### Optional Properties (All have defaults)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `position` | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Position in world coordinates |
| `scale` | `{ x: number, y: number }` | `{ x: 1, y: 1 }` | Scale multipliers for width/height |
| `rotation` | `number` | `0` | Rotation in radians |

## Usage Examples

### Basic Transform
```typescript
const transformData: TransformComponentData = {};
// All properties use defaults: position (0,0), scale (1,1), rotation 0
```

### Positioned Object
```typescript
const transformData: TransformComponentData = {
  position: { x: 200, y: 150 }
};
```

### Scaled and Rotated Object
```typescript
const transformData: TransformComponentData = {
  position: { x: 300, y: 200 },
  scale: { x: 2, y: 1.5 }, // 2x width, 1.5x height
  rotation: Math.PI / 4 // 45 degrees
};
```

### Flipped Object
```typescript
const transformData: TransformComponentData = {
  position: { x: 400, y: 300 },
  scale: { x: -1, y: 1 }, // Horizontally flipped
  rotation: 0
};
```

## Runtime Properties

The created component includes all properties as required (no optional properties in the final type):
- `position: { x: number; y: number }`
- `scale: { x: number; y: number }`
- `rotation: number`

## Property Descriptions

### Position
- **World Coordinates**: Absolute position in the game world
- **Origin**: Top-left is typically (0, 0) in most 2D engines
- **Units**: Pixels or world units depending on your game scale

### Scale
- **Uniform Scaling**: Use same value for x and y (`{ x: 2, y: 2 }`)
- **Non-uniform Scaling**: Different values for width/height (`{ x: 1, y: 0.5 }`)
- **Negative Values**: Flip objects (`{ x: -1, y: 1 }` flips horizontally)
- **Zero Values**: Hide objects by scaling to zero

### Rotation
- **Radians**: All rotations use radians (not degrees)
- **Clockwise**: Positive values rotate clockwise
- **Conversion**: Use `Math.PI / 180 * degrees` to convert from degrees
- **Full Circle**: `2 * Math.PI` radians = 360 degrees

## Common Usage Patterns

### Object Movement
```typescript
// Move object 10 pixels right
transform.position.x += 10;

// Move towards target
const target = { x: 500, y: 300 };
const direction = {
  x: target.x - transform.position.x,
  y: target.y - transform.position.y
};
const speed = 100; // pixels per second
transform.position.x += direction.x * speed * deltaTime;
transform.position.y += direction.y * speed * deltaTime;
```

### Object Scaling
```typescript
// Pulse effect
const pulseSpeed = 2;
const time = Date.now() / 1000;
const pulse = 1 + Math.sin(time * pulseSpeed) * 0.2;
transform.scale.x = pulse;
transform.scale.y = pulse;

// Grow object
transform.scale.x *= 1.1;
transform.scale.y *= 1.1;
```

### Object Rotation
```typescript
// Constant rotation
const rotationSpeed = Math.PI; // 180 degrees per second
transform.rotation += rotationSpeed * deltaTime;

// Look at target
const target = { x: 400, y: 300 };
const angle = Math.atan2(
  target.y - transform.position.y,
  target.x - transform.position.x
);
transform.rotation = angle;
```

### Physics Integration
```typescript
// Sync transform with physics body
transform.position.x = physicsBody.position.x;
transform.position.y = physicsBody.position.y;
transform.rotation = physicsBody.angle;

// Apply transform to sprite
sprite.position.x = transform.position.x;
sprite.position.y = transform.position.y;
sprite.scale.x = transform.scale.x;
sprite.scale.y = transform.scale.y;
sprite.rotation = transform.rotation;
```

## Integration with Other Components

### With Sprite Components
```typescript
// System that syncs Transform with SpriteComponent
const entities = engine.EntityEngine.query<{
  TransformComponent: TransformComponent[];
  SpriteComponent: SpriteComponent[];
}>(["TransformComponent", "SpriteComponent"]);

for (const { components } of entities) {
  const transform = components.TransformComponent[0];
  const sprite = components.SpriteComponent[0];
  
  // Apply transform to sprite
  sprite.position = transform.position;
  sprite.scale = transform.scale;
  sprite.rotation = transform.rotation;
}
```

### With Physics Components
```typescript
// System that syncs Transform with RigidBody
const entities = engine.EntityEngine.query<{
  TransformComponent: TransformComponent[];
  RigidBodyRectangleComponent: RigidBodyRectangleComponent[];
}>(["TransformComponent", "RigidBodyRectangleComponent"]);

for (const { components } of entities) {
  const transform = components.TransformComponent[0];
  const rigidBody = components.RigidBodyRectangleComponent[0];
  
  // Sync physics body with transform
  transform.position.x = rigidBody._body.position.x;
  transform.position.y = rigidBody._body.position.y;
  transform.rotation = rigidBody._body.angle;
}
```

## Scene Configuration

### In JSON Scene Files
```json
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
    }
  ]
}
```

### In Blueprint Files
```json
{
  "name": "MovableObject",
  "path": "MovableObject.blueprint.json",
  "components": [
    {
      "name": "TransformComponent",
      "data": {
        "position": { "x": 0, "y": 0 },
        "scale": { "x": 1, "y": 1 },
        "rotation": 0
      }
    }
  ]
}
```

## Best Practices

### Performance
- **Batch Updates**: Update transforms in dedicated systems
- **Avoid Redundant Calculations**: Cache frequently used values
- **Use Dirty Flags**: Only update dependent components when transform changes

### Architecture
- **Single Source of Truth**: Use TransformComponent as the authoritative spatial data
- **System Separation**: Keep transform logic separate from rendering/physics
- **Consistent Units**: Use the same coordinate system throughout your game

### Common Patterns
- **Transform Hierarchy**: Parent-child relationships for complex objects
- **Interpolation**: Smooth movement between positions
- **Constraints**: Limit position, scale, or rotation values

## Notes

- TransformComponent is a **built-in engine component** and doesn't need registration
- All rotation values are in **radians**, not degrees
- Scale values can be **negative** for flipping objects
- Position represents the **center point** or **anchor point** of objects
- Compatible with all drawable and physics components
- Essential for most game objects that have spatial properties