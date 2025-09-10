# Circle Component

The Circle Component renders circular shapes using PIXI.js Graphics. It provides flexible styling options including fill colors, stroke properties, and standard drawable transformations.

## Purpose

The Circle Component handles:
- Circular shape rendering with customizable radius
- Fill and stroke styling options
- Visual transformations (position, scale, rotation)
- Display properties (alpha, visibility)

## Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `radius` | `number` | Radius of the circle in pixels |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `position` | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Position in world coordinates |
| `scale` | `{ x: number, y: number }` | `{ x: 1, y: 1 }` | Scale multipliers for width/height |
| `rotation` | `number` | `0` | Rotation in radians |
| `alpha` | `number` | `1` | Opacity (0 = transparent, 1 = opaque) |
| `visible` | `boolean` | `true` | Whether the circle is visible |
| `fill` | `{ enabled: boolean, color: string }` | `undefined` | Fill styling options |
| `stroke` | `{ enabled: boolean, color: string, width: number }` | `undefined` | Stroke styling options |

## Usage Examples

### Basic Circle
```typescript
const circleData: CircleComponentData = {
  radius: 50
};
```

### Filled Circle with Custom Color
```typescript
const circleData: CircleComponentData = {
  radius: 30,
  fill: {
    enabled: true,
    color: "#ff6b6b"
  }
};
```

### Circle with Stroke Only
```typescript
const circleData: CircleComponentData = {
  radius: 40,
  stroke: {
    enabled: true,
    color: "#4ecdc4",
    width: 3
  }
};
```

### Styled Circle with Position and Transparency
```typescript
const circleData: CircleComponentData = {
  radius: 25,
  position: { x: 200, y: 150 },
  alpha: 0.7,
  fill: {
    enabled: true,
    color: "#45b7d1"
  },
  stroke: {
    enabled: true,
    color: "#2c3e50",
    width: 2
  }
};
```

## Runtime Properties

The created component includes all the above properties plus internal PIXI.js objects:
- `_resource`: Object containing the radius value
- `_drawable`: The PIXI.js Graphics container

## Notes

- The circle is drawn centered at the origin (0, 0) and positioned using the `position` property
- Color values support hex format with or without `#` prefix (e.g., `"#ff0000"` or `"ff0000"`)
- Both fill and stroke can be used simultaneously for outlined filled circles
- The component uses PIXI.js Graphics for vector-based rendering
- Scale affects both the radius and stroke width proportionally