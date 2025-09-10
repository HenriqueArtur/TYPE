# Sensor Circle Component

The Sensor Circle Component creates circular trigger areas using Matter.js physics engine. These are invisible zones that detect when other physics bodies enter or exit, without blocking movement.

## Purpose

The Sensor Circle Component handles:
- Circular trigger zone detection
- Radial area-based events (entering/exiting zones)
- Invisible collision detection with smooth boundaries
- Game mechanics like proximity detection, power-ups, or danger zones

## Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | X position of the sensor center |
| `y` | `number` | Y position of the sensor center |
| `radius` | `number` | Radius of the circular sensor |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `rotation` | `number` | `0` | Rotation in radians |

## Usage Examples

### Basic Circular Trigger
```typescript
const sensorData: SensorCircleComponentData = {
  x: 300,
  y: 400,
  radius: 50
};
```

### Small Proximity Detector
```typescript
const sensorData: SensorCircleComponentData = {
  x: 500,
  y: 200,
  radius: 75
};
```

### Large Area Sensor
```typescript
const sensorData: SensorCircleComponentData = {
  x: 400,
  y: 300,
  radius: 100 // Large detection area
};
```

### Rotated Sensor
```typescript
const sensorData: SensorCircleComponentData = {
  x: 250,
  y: 350,
  radius: 60,
  rotation: Math.PI / 4 // 45 degrees (for consistency)
};
```

## Runtime Properties

The created component includes all the above properties plus:
- `_body`: The Matter.js Body object configured as a static sensor

## Sensor Behavior

- **Static**: Sensors never move and are not affected by forces
- **Non-blocking**: Other bodies pass through sensors without collision
- **Detection**: Triggers collision events when bodies enter/exit
- **Invisible**: Sensors have no visual representation by default
- **Smooth Boundaries**: Circular sensors provide natural curved detection areas

## Common Use Cases

### Proximity Detection
```typescript
// Player detection area around NPC
const npcProximity: SensorCircleComponentData = {
  x: 250,
  y: 350,
  radius: 80
};
```

### Collectible Pickup Areas
```typescript
// Power-up collection radius
const powerUpSensor: SensorCircleComponentData = {
  x: 400,
  y: 200,
  radius: 30
};
```

### Explosion/Damage Zones
```typescript
// Bomb blast radius
const blastRadius: SensorCircleComponentData = {
  x: 600,
  y: 300,
  radius: 120
};
```

### Light/Vision Cones
```typescript
// Flashlight illumination area
const lightArea: SensorCircleComponentData = {
  x: 200,
  y: 250,
  radius: 150
};
```

### Safe Zones
```typescript
// Protected area around spawn point
const safeZone: SensorCircleComponentData = {
  x: 100,
  y: 100,
  radius: 90
};
```

### Audio Trigger Zones
```typescript
// Music transition area
const musicTrigger: SensorCircleComponentData = {
  x: 500,
  y: 400,
  radius: 200
};
```

## Gameplay Applications

### RPG Mechanics
```typescript
// Shop interaction area
const shopArea: SensorCircleComponentData = {
  x: 300, y: 200, radius: 60
};

// Quest objective marker
const questArea: SensorCircleComponentData = {
  x: 700, y: 350, radius: 40
};
```

### Action Games
```typescript
// Enemy aggro range
const aggroRange: SensorCircleComponentData = {
  x: 450, y: 300, radius: 100
};

// Healing fountain effect
const healingArea: SensorCircleComponentData = {
  x: 200, y: 150, radius: 70
};
```

### Puzzle Games
```typescript
// Pressure plate activation area
const pressurePlate: SensorCircleComponentData = {
  x: 350, y: 400, radius: 25
};

// Switch detection zone
const switchZone: SensorCircleComponentData = {
  x: 150, y: 300, radius: 45
};
```

## Event Detection

To detect when objects enter or exit sensors, you'll need to implement collision event handling in your game systems. The circular sensor will trigger collision events without preventing movement, providing smooth entry/exit detection.

## Advantages of Circular Sensors

- **Natural Boundaries**: Smooth, curved detection areas feel more natural
- **Distance-Based**: Perfect for proximity-based mechanics
- **Radial Effects**: Ideal for explosion, light, or sound effects
- **Smooth Transitions**: No sharp corners for gentler trigger behavior

## Notes

- Position coordinates represent the center of the circle
- Sensors are always static and cannot be moved by physics forces  
- Bodies can overlap and move through sensors freely
- Use sensors for game logic triggers, not physical barriers
- Rotation doesn't visually change circles, but may be useful for consistency
- Circular sensors are perfect for proximity-based game mechanics
- Combine with game logic systems to create interactive gameplay elements
- Ideal for natural, distance-based trigger systems