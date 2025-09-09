# Sensor Rectangle Component

The Sensor Rectangle Component creates trigger areas using Matter.js physics engine. These are invisible zones that detect when other physics bodies enter or exit, without blocking movement.

## Purpose

The Sensor Rectangle Component handles:
- Trigger zone detection
- Area-based events (entering/exiting zones)
- Invisible collision detection
- Game mechanics like checkpoints, power-ups, or danger zones

## Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | X position of the sensor center |
| `y` | `number` | Y position of the sensor center |
| `width` | `number` | Width of the rectangular sensor |
| `height` | `number` | Height of the rectangular sensor |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `rotation` | `number` | `0` | Rotation in radians |

## Usage Examples

### Basic Trigger Zone
```typescript
const sensorData: SensorRectangleComponentData = {
  x: 300,
  y: 400,
  width: 100,
  height: 50
};
```

### Rotated Detection Area
```typescript
const sensorData: SensorRectangleComponentData = {
  x: 500,
  y: 200,
  width: 150,
  height: 75,
  rotation: Math.PI / 4 // 45 degrees
};
```

### Large Area Sensor
```typescript
const sensorData: SensorRectangleComponentData = {
  x: 400,
  y: 300,
  width: 200,
  height: 300 // Tall, narrow sensor
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

## Common Use Cases

### Checkpoint Systems
```typescript
// Checkpoint trigger
const checkpointSensor: SensorRectangleComponentData = {
  x: 250,
  y: 350,
  width: 50,
  height: 100
};
```

### Power-up Collection
```typescript
// Power-up pickup area
const powerUpSensor: SensorRectangleComponentData = {
  x: 400,
  y: 200,
  width: 40,
  height: 40
};
```

### Danger Zones
```typescript
// Lava pit or spike trap
const dangerSensor: SensorRectangleComponentData = {
  x: 600,
  y: 450,
  width: 120,
  height: 30
};
```

### Exit/Entry Doors
```typescript
// Door trigger zone
const doorSensor: SensorRectangleComponentData = {
  x: 100,
  y: 300,
  width: 30,
  height: 80
};
```

## Event Detection

To detect when objects enter or exit sensors, you'll need to implement collision event handling in your game systems. The sensor will trigger collision events without preventing movement.

## Notes

- Position coordinates represent the center of the rectangle
- Sensors are always static and cannot be moved by physics forces
- Bodies can overlap and move through sensors freely
- Use sensors for game logic triggers, not physical barriers
- Rotation is measured in radians around the center point
- Combine with game logic systems to create interactive gameplay elements