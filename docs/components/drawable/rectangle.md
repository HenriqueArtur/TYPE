# Rectangle Component

The Rectangle Component renders rectangular shapes using PIXI.js Graphics. It provides flexible styling options including fill colors, stroke properties, anchor positioning, and standard drawable transformations.

## Purpose

The Rectangle Component handles:
- Rectangular shape rendering with customizable dimensions
- Fill and stroke styling options
- Anchor point positioning for flexible alignment
- Visual transformations (position, scale, rotation)
- Display properties (alpha, visibility)

## Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `width` | `number` | Width of the rectangle in pixels |
| `height` | `number` | Height of the rectangle in pixels |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `position` | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Position in world coordinates |
| `scale` | `{ x: number, y: number }` | `{ x: 1, y: 1 }` | Scale multipliers for width/height |
| `rotation` | `number` | `0` | Rotation in radians |
| `alpha` | `number` | `1` | Opacity (0 = transparent, 1 = opaque) |
| `visible` | `boolean` | `true` | Whether the rectangle is visible |
| `anchor` | `number` | `0.5` | Anchor point (0 = top-left, 0.5 = center, 1 = bottom-right) |
| `fill` | `{ enabled: boolean, color: string }` | `undefined` | Fill styling options |
| `stroke` | `{ enabled: boolean, color: string, width: number }` | `undefined` | Stroke styling options |

## Usage Examples

### Basic Rectangle
```typescript
const rectangleData: RectangleComponentData = {
  width: 100,
  height: 60
};
```

### Filled Rectangle with Custom Color
```typescript
const rectangleData: RectangleComponentData = {
  width: 80,
  height: 40,
  fill: {
    enabled: true,
    color: "#e74c3c"
  }
};
```

### Rectangle with Stroke Only
```typescript
const rectangleData: RectangleComponentData = {
  width: 120,
  height: 80,
  stroke: {
    enabled: true,
    color: "#2ecc71",
    width: 4
  }
};
```

### Styled Rectangle with Top-Left Anchor
```typescript
const rectangleData: RectangleComponentData = {
  width: 150,
  height: 100,
  position: { x: 300, y: 200 },
  anchor: 0, // Top-left anchor
  fill: {
    enabled: true,
    color: "#9b59b6"
  },
  stroke: {
    enabled: true,
    color: "#34495e",
    width: 2
  }
};
```

### Rotated Semi-Transparent Rectangle
```typescript
const rectangleData: RectangleComponentData = {
  width: 200,
  height: 50,
  position: { x: 400, y: 300 },
  rotation: Math.PI / 4, // 45 degrees
  alpha: 0.6,
  anchor: 0.5, // Center anchor
  fill: {
    enabled: true,
    color: "#f39c12"
  }
};
```

## Runtime Properties

The created component includes all the above properties plus internal PIXI.js objects:
- `_resource`: Object containing width and height values
- `_drawable`: The PIXI.js Graphics container

## Notes

- The rectangle is drawn relative to its anchor point, which determines the origin for positioning and rotation
- Anchor values: `0` = top-left, `0.5` = center, `1` = bottom-right
- Color values support hex format with or without `#` prefix (e.g., `"#ff0000"` or `"ff0000"`)
- Both fill and stroke can be used simultaneously for outlined filled rectangles
- The component uses PIXI.js Graphics for vector-based rendering
- Scale affects both the dimensions and stroke width proportionally
- Rotation occurs around the anchor point