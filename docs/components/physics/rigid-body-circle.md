# Rigid Body Circle Component

The Rigid Body Circle Component creates dynamic circular physics bodies using Matter.js. These are movable objects that respond to forces, collisions, and physics simulation with natural circular behavior.

## Purpose

The Rigid Body Circle Component handles:
- Dynamic circular physics simulation
- Natural rolling and spinning motion
- Collision response and bouncing
- Force and velocity application for circular objects

## Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | X position of the rigid body center |
| `y` | `number` | Y position of the rigid body center |
| `radius` | `number` | Radius of the circular body |

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

### Basic Bouncing Ball
```typescript
const rigidBodyData: RigidBodyCircleComponentData = {
  x: 200,
  y: 100,
  radius: 25
};
```

### Highly Bouncy Rubber Ball
```typescript
const rigidBodyData: RigidBodyCircleComponentData = {
  x: 300,
  y: 150,
  radius: 20,
  restitution: 0.95, // Very bouncy
  frictionAir: 0.001, // Low air resistance
  density: 0.002 // Light weight
};
```

### Heavy Bowling Ball
```typescript
const rigidBodyData: RigidBodyCircleComponentData = {
  x: 400,
  y: 200,
  radius: 35,
  velocity: { x: -30, y: 0 }, // Rolling left
  restitution: 0.3, // Low bounce
  friction: 0.8, // High friction for rolling
  frictionAir: 0.02, // Some air resistance
  density: 0.015 // Heavy
};
```

### Spinning Wheel
```typescript
const rigidBodyData: RigidBodyCircleComponentData = {
  x: 250,
  y: 300,
  radius: 30,
  angularVelocity: 0.2, // Fast spinning
  friction: 0.6 // Good rolling friction
};
```

### Bubble (Light and Floaty)
```typescript
const rigidBodyData: RigidBodyCircleComponentData = {
  x: 350,
  y: 400,
  radius: 15,
  velocity: { x: 10, y: -20 }, // Floating upward
  restitution: 0.9, // Very bouncy
  frictionAir: 0.05, // High air resistance
  density: 0.0005 // Very light
};
```

## Runtime Properties

The created component includes all the above properties plus:
- `_body`: The Matter.js Body object configured as dynamic

## Physics Properties Explained

### Restitution (Bounce)
- `0.0`: No bounce (completely inelastic, like clay)
- `0.5`: Moderate bounce (like a tennis ball)
- `0.8`: High bounce (like a rubber ball)
- `1.0`: Perfect bounce (no energy loss)
- `> 1.0`: Gains energy (not realistic but fun!)

### Friction
- `0.0`: No friction (slides like on ice)
- `0.3`: Low friction (smooth surfaces)
- `0.6`: Good rolling friction (rubber on concrete)
- `1.0`: High friction (sticky surface)

### Density
- `0.0005`: Very light object (bubble, balloon)
- `0.001`: Light object (ping pong ball)
- `0.005`: Medium object (tennis ball)
- `0.015`: Heavy object (bowling ball)
- Higher values = more mass = harder to accelerate

### Air Resistance
- `0.001`: Minimal drag (space-like)
- `0.01`: Normal air resistance
- `0.05`: High drag (underwater-like or light objects)

## Physics Behavior

- **Dynamic**: Bodies move and rotate based on forces and collisions
- **Rolling**: Circular bodies naturally roll when friction is applied
- **Gravity**: Affected by world gravity (if enabled)
- **Collisions**: Responds naturally to collisions with curved surfaces
- **Forces**: Can have forces applied for movement and effects

## Common Use Cases

### Game Balls
```typescript
// Soccer ball
const soccerBall: RigidBodyCircleComponentData = {
  x: 400, y: 300, radius: 25,
  restitution: 0.7, friction: 0.4, density: 0.003
};

// Basketball
const basketball: RigidBodyCircleComponentData = {
  x: 300, y: 200, radius: 30,
  restitution: 0.8, friction: 0.6, density: 0.004
};
```

### Projectiles
```typescript
// Cannonball
const cannonball: RigidBodyCircleComponentData = {
  x: 100, y: 300, radius: 15,
  velocity: { x: 150, y: -50 },
  restitution: 0.2, friction: 0.3, density: 0.02
};
```

### Collectibles
```typescript
// Coin
const coin: RigidBodyCircleComponentData = {
  x: 500, y: 150, radius: 12,
  angularVelocity: 0.1, // Spinning
  restitution: 0.6, friction: 0.2, density: 0.008
};
```

## Notes

- Position coordinates represent the center of the circle
- Velocity is in pixels per second
- Angular velocity is in radians per second
- Circular bodies naturally roll due to their geometry
- Higher friction enables better rolling behavior
- Bodies automatically respond to gravity and forces
- Perfect for balls, wheels, coins, and any round objects
- Combine with sprite components for visual representation
- Circular bodies provide more realistic physics for round objects