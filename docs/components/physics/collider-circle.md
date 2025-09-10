# Collider Circle Component

The Collider Circle Component creates static circular collision bodies using Matter.js physics engine. These are immovable objects that other physics bodies can collide with.

## Purpose

The Collider Circle Component handles:
- Static circular collision detection
- Immovable barriers and obstacles
- Rounded surfaces and curved walls
- Static friction properties for circular objects

## Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | X position of the collider center |
| `y` | `number` | Y position of the collider center |
| `radius` | `number` | Radius of the circular collider |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `rotation` | `number` | `0` | Rotation in radians |
| `frictionStatic` | `number` | `0.001` | Static friction coefficient |

## Usage Examples

### Basic Circular Barrier
```typescript
const colliderData: ColliderCircleComponentData = {
  x: 400,
  y: 300,
  radius: 50
};
```

### Large Obstacle with High Friction
```typescript
const colliderData: ColliderCircleComponentData = {
  x: 200,
  y: 400,
  radius: 75,
  frictionStatic: 0.8 // High friction surface
};
```

### Slippery Circular Surface
```typescript
const colliderData: ColliderCircleComponentData = {
  x: 600,
  y: 200,
  radius: 30,
  frictionStatic: 0 // No friction (marble-like)
};
```

### Rotated Collider
```typescript
const colliderData: ColliderCircleComponentData = {
  x: 300,
  y: 350,
  radius: 40,
  rotation: Math.PI / 3 // 60 degrees (for consistency, though circles look the same)
};
```

## Runtime Properties

The created component includes all the above properties plus:
- `_body`: The Matter.js Body object configured as static

## Physics Behavior

- **Static**: Colliders never move and are not affected by forces
- **Collision**: Other physics bodies will collide with and bounce off colliders
- **Smooth Curves**: Circular colliders provide natural curved collision surfaces
- **Friction**: Static friction affects how objects slide along the collider surface
- **Performance**: Static bodies are highly optimized in Matter.js

## Common Use Cases

### Pillars and Columns
```typescript
// Building pillar
const pillarCollider: ColliderCircleComponentData = {
  x: 150,
  y: 400,
  radius: 25,
  frictionStatic: 0.5
};
```

### Curved Walls
```typescript
// Rounded corner obstacle
const curvedWall: ColliderCircleComponentData = {
  x: 500,
  y: 150,
  radius: 60,
  frictionStatic: 0.3
};
```

### Bumpers (Pinball-style)
```typescript
// Bouncy circular bumper
const bumper: ColliderCircleComponentData = {
  x: 350,
  y: 250,
  radius: 20,
  frictionStatic: 0.1 // Low friction for bouncing
};
```

## Notes

- Position coordinates represent the center of the circle
- Colliders are always static and cannot be moved by physics forces
- Use low friction values (0-0.1) for slippery surfaces like ice or metal
- Use high friction values (0.8-1.0) for grippy surfaces like rubber
- Rotation doesn't visually change circles, but may be useful for consistency
- Circular colliders provide more natural collision responses than rectangles
- Perfect for rounded obstacles, pillars, and curved boundary elements