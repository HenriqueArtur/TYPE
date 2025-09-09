# Collider Rectangle Component

The Collider Rectangle Component creates static collision bodies using Matter.js physics engine. These are immovable objects that other physics bodies can collide with.

## Purpose

The Collider Rectangle Component handles:
- Static collision detection
- Immovable barriers and walls
- Platform and ground surfaces
- Static friction properties

## Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | X position of the collider center |
| `y` | `number` | Y position of the collider center |
| `width` | `number` | Width of the rectangular collider |
| `height` | `number` | Height of the rectangular collider |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `rotation` | `number` | `0` | Rotation in radians |
| `frictionStatic` | `number` | `0.001` | Static friction coefficient |

## Usage Examples

### Basic Wall Collider
```typescript
const colliderData: ColliderRectangleComponentData = {
  x: 400,
  y: 500,
  width: 800,
  height: 50
};
```

### Rotated Platform
```typescript
const colliderData: ColliderRectangleComponentData = {
  x: 200,
  y: 300,
  width: 200,
  height: 20,
  rotation: Math.PI / 6, // 30 degrees
  frictionStatic: 0.8 // High friction surface
};
```

### Slippery Surface
```typescript
const colliderData: ColliderRectangleComponentData = {
  x: 300,
  y: 400,
  width: 300,
  height: 30,
  frictionStatic: 0 // No friction (ice-like)
};
```

## Runtime Properties

The created component includes all the above properties plus:
- `_body`: The Matter.js Body object configured as static

## Physics Behavior

- **Static**: Colliders never move and are not affected by forces
- **Collision**: Other physics bodies will collide with and bounce off colliders
- **Friction**: Static friction affects how objects slide along the collider surface
- **Performance**: Static bodies are highly optimized in Matter.js

## Notes

- Position coordinates represent the center of the rectangle
- Colliders are always static and cannot be moved by physics forces
- Use low friction values (0-0.1) for slippery surfaces like ice
- Use high friction values (0.8-1.0) for grippy surfaces like rubber
- Rotation is measured in radians around the center point