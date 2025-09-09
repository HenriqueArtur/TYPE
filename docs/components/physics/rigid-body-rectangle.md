# Rigid Body Rectangle Component

The Rigid Body Rectangle Component creates dynamic physics bodies using Matter.js. These are movable objects that respond to forces, collisions, and physics simulation.

## Purpose

The Rigid Body Rectangle Component handles:
- Dynamic physics simulation
- Collision response and bouncing
- Force and velocity application
- Physical material properties

## Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | X position of the rigid body center |
| `y` | `number` | Y position of the rigid body center |
| `width` | `number` | Width of the rectangular body |
| `height` | `number` | Height of the rectangular body |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `velocity` | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Initial velocity |
| `angularVelocity` | `number` | `0` | Initial rotational velocity (rad/s) |
| `rotation` | `number` | `0` | Initial rotation in radians |
| `restitution` | `number` | `0.8` | Bounce factor (0 = no bounce, 1 = perfect bounce) |
| `friction` | `number` | `0.001` | Surface friction coefficient |
| `frictionAir` | `number` | `0.01` | Air resistance/drag |
| `density` | `number` | `0.001` | Mass density (affects weight) |

## Usage Examples

### Basic Falling Box
```typescript
const rigidBodyData: RigidBodyRectangleComponentData = {
  x: 200,
  y: 100,
  width: 50,
  height: 50
};
```

### Bouncy Ball Simulation
```typescript
const rigidBodyData: RigidBodyRectangleComponentData = {
  x: 300,
  y: 200,
  width: 30,
  height: 30,
  restitution: 0.95, // Very bouncy
  frictionAir: 0.001, // Low air resistance
  density: 0.002 // Light weight
};
```

### Heavy, Slow Object
```typescript
const rigidBodyData: RigidBodyRectangleComponentData = {
  x: 400,
  y: 150,
  width: 80,
  height: 60,
  velocity: { x: -50, y: 0 }, // Moving left
  restitution: 0.2, // Low bounce
  friction: 0.8, // High friction
  frictionAir: 0.05, // High air resistance
  density: 0.01 // Heavy
};
```

### Spinning Object
```typescript
const rigidBodyData: RigidBodyRectangleComponentData = {
  x: 250,
  y: 300,
  width: 40,
  height: 40,
  angularVelocity: 0.1, // Rotating
  rotation: Math.PI / 4 // 45-degree initial rotation
};
```

## Runtime Properties

The created component includes all the above properties plus:
- `_body`: The Matter.js Body object configured as dynamic

## Physics Properties Explained

### Restitution (Bounce)
- `0.0`: No bounce (completely inelastic)
- `0.5`: Moderate bounce
- `1.0`: Perfect bounce (no energy loss)
- `> 1.0`: Gains energy (not realistic but fun!)

### Friction
- `0.0`: No friction (slides freely)
- `0.5`: Moderate friction
- `1.0`: High friction (sticky surface)

### Density
- `0.001`: Very light object
- `0.01`: Heavy object
- Higher values = more mass = harder to accelerate

### Air Resistance
- `0.001`: Minimal drag (space-like)
- `0.01`: Normal air resistance
- `0.1`: High drag (underwater-like)

## Physics Behavior

- **Dynamic**: Bodies move and rotate based on forces and collisions
- **Gravity**: Affected by world gravity (if enabled)
- **Collisions**: Responds to collisions with other bodies
- **Forces**: Can have forces applied for movement and effects

## Notes

- Position coordinates represent the center of the rectangle
- Velocity is in pixels per second
- Angular velocity is in radians per second
- Bodies automatically respond to gravity and forces
- Higher density objects require more force to accelerate
- Combine with sprite components for visual representation