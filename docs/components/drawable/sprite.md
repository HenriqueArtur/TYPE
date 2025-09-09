# Sprite Component

The Sprite Component renders textures and images using PIXI.js. It's the primary visual component for displaying 2D graphics in your game.

## Purpose

The Sprite Component handles:
- Texture rendering from image files
- Visual transformations (position, scale, rotation)
- Display properties (alpha, tint, visibility)
- Anchor point positioning

## Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `texture_path` | `string` | Path to the texture/image file |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `position` | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Position in world coordinates |
| `scale` | `{ x: number, y: number }` | `{ x: 1, y: 1 }` | Scale multipliers for width/height |
| `rotation` | `number` | `0` | Rotation in radians |
| `alpha` | `number` | `1` | Opacity (0 = transparent, 1 = opaque) |
| `tint` | `number` | `undefined` | Color tint applied to sprite (hex color) |
| `visible` | `boolean` | `true` | Whether the sprite is visible |
| `anchor` | `number` | `0.5` | Anchor point (0 = top-left, 0.5 = center, 1 = bottom-right) |

## Usage Examples

### Basic Sprite
```typescript
const spriteData: SpriteComponentData = {
  texture_path: "assets/player.png"
};
```

### Positioned Sprite with Custom Properties
```typescript
const spriteData: SpriteComponentData = {
  texture_path: "assets/enemy.png",
  position: { x: 100, y: 50 },
  scale: { x: 2, y: 2 },
  rotation: Math.PI / 4, // 45 degrees
  alpha: 0.8,
  tint: 0xff0000, // Red tint
  anchor: 0 // Top-left anchor
};
```

### Invisible Sprite (for delayed reveal)
```typescript
const spriteData: SpriteComponentData = {
  texture_path: "assets/hidden-item.png",
  visible: false
};
```

## Runtime Properties

The created component includes all the above properties plus internal PIXI.js objects:
- `_resource`: The texture path string
- `_drawable`: The PIXI.js Sprite container

## Notes

- Texture paths are relative to your project's asset directory
- The component uses PIXI.js Sprite internally for hardware-accelerated rendering
- Anchor values between 0 and 1 position the sprite relative to its bounds
- Tint values use hexadecimal color format (e.g., 0xff0000 for red)
- Rotation is measured in radians (use `Math.PI / 180 * degrees` to convert from degrees)