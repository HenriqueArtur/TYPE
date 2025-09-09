# Render PIXI System

The Render PIXI System synchronizes sprite component data with PIXI.js drawable objects, updating visual properties every frame to render sprites on screen.

## Purpose

The Render PIXI System handles:
- Synchronizing component data with PIXI.js sprites
- Updating visual properties (position, scale, rotation, alpha, tint)
- Managing sprite visibility and anchor points
- Providing hardware-accelerated rendering through PIXI.js

## System Properties

| Property | Value | Description |
|----------|--------|-------------|
| `name` | `"RenderPixiSystem"` | System identifier |
| `priority` | `2` | Executes after physics (rendering comes last) |
| `enabled` | `true` | Enabled by default |

## Implementation

```typescript
export class RenderPixiSystem implements System<TypeEngine> {
  name = "RenderPixiSystem";
  priority = 2;
  enabled = true;

  async init(_engine: TypeEngine) {
    // Rendering system initialization
    // PIXI.js application is already set up
  }

  update(engine: TypeEngine, _deltaTime: number): void {
    // Query entities with sprite components
    const sprite_entities = engine.EntityEngine.query<{ SpriteComponent: SpriteComponent[] }>([
      "SpriteComponent",
    ]);
    
    // Update each sprite's visual properties
    for (const { components } of sprite_entities) {
      for (const current of components.SpriteComponent) {
        current._drawable.position.set(current.position.x, current.position.y);
        current._drawable.scale.set(current.scale.x, current.scale.y);
        current._drawable.rotation = current.rotation;
        current._drawable.alpha = current.alpha;
        current._drawable.visible = current.visible;
        current._drawable.anchor.set(current.anchor);
        if (current.tint !== undefined) {
          current._drawable.tint = current.tint;
        }
      }
    }
  }

  destroy(_engine: TypeEngine): void {
    // Rendering cleanup if needed
  }
}
```

## Functionality

### Entity Querying
The system queries for entities with `SpriteComponent`:
```typescript
const sprite_entities = engine.EntityEngine.query<{ SpriteComponent: SpriteComponent[] }>([
  "SpriteComponent",
]);
```

### Property Synchronization
For each sprite component, the system updates the PIXI.js sprite object:

**Position**: `current._drawable.position.set(current.position.x, current.position.y)`
- Updates sprite screen position from component data
- Allows other systems to modify position through component

**Scale**: `current._drawable.scale.set(current.scale.x, current.scale.y)`
- Updates sprite size scaling from component data
- Enables dynamic resizing and scaling effects

**Rotation**: `current._drawable.rotation = current.rotation`
- Updates sprite rotation from component data (in radians)
- Supports rotation animations and directional sprites

**Alpha**: `current._drawable.alpha = current.alpha`
- Updates sprite opacity from component data (0.0 to 1.0)
- Enables fade effects and transparency

**Visibility**: `current._drawable.visible = current.visible`
- Controls sprite visibility from component data
- Allows hiding/showing sprites without destroying them

**Anchor**: `current._drawable.anchor.set(current.anchor)`
- Updates sprite anchor point from component data
- Controls rotation and positioning origin

**Tint**: `current._drawable.tint = current.tint` (optional)
- Applies color tint to sprite if specified
- Enables color effects and variations

## Visual Properties

### Position
- **Component Data**: `{ x: number, y: number }`
- **PIXI.js Update**: `sprite.position.set(x, y)`
- **Usage**: Screen coordinates for sprite placement

### Scale  
- **Component Data**: `{ x: number, y: number }`
- **PIXI.js Update**: `sprite.scale.set(x, y)`
- **Usage**: Width/height multipliers (1.0 = normal size)

### Rotation
- **Component Data**: `number` (radians)
- **PIXI.js Update**: `sprite.rotation = rotation`
- **Usage**: Clockwise rotation around anchor point

### Alpha
- **Component Data**: `number` (0.0 to 1.0)
- **PIXI.js Update**: `sprite.alpha = alpha`  
- **Usage**: Opacity level (0 = invisible, 1 = opaque)

### Visibility
- **Component Data**: `boolean`
- **PIXI.js Update**: `sprite.visible = visible`
- **Usage**: Show/hide sprite completely

### Anchor
- **Component Data**: `number` (0.0 to 1.0)
- **PIXI.js Update**: `sprite.anchor.set(anchor)`
- **Usage**: Origin point (0 = top-left, 0.5 = center, 1 = bottom-right)

### Tint
- **Component Data**: `number` (hex color, optional)
- **PIXI.js Update**: `sprite.tint = tint`
- **Usage**: Color multiplication (0xffffff = normal, 0xff0000 = red tint)

## Usage Examples

### Basic Rendering
```typescript
// Entities with SpriteComponent are automatically rendered
// No additional system configuration needed

const spriteEntity = createEntity([{
  name: "SpriteComponent",
  data: {
    texture_path: "player.png",
    position: { x: 100, y: 200 }
  }
}]);
// Sprite will be rendered at position (100, 200)
```

### Dynamic Visual Updates
```typescript
// Other systems can modify sprite appearance
const sprite = entity.components.SpriteComponent[0];

// Move sprite
sprite.position.x += 50;

// Scale sprite
sprite.scale.x = 2.0; // Double width

// Fade sprite
sprite.alpha = 0.5; // 50% opacity

// Tint sprite red
sprite.tint = 0xff0000;

// Changes will be reflected in next frame
```


## Performance Considerations

### Rendering Pipeline
- System runs after physics and game logic (priority 2)
- Updates visual state based on current component data
- PIXI.js handles efficient GPU rendering

### Optimization
- Only updates visible sprites (visibility culling by PIXI.js)
- Batches sprite updates for performance
- Hardware acceleration through WebGL when available

### Memory Management
- PIXI.js manages texture memory automatically
- Sprites are reused when component data changes
- Garbage collection handles unused resources

## Integration Patterns

### Physics-Visual Sync
```typescript
// Physics System updates positions (priority 1)
PhysicsSystem.update(); // Updates component.position from physics body

// Render System displays updated positions (priority 2)  
RenderPixiSystem.update(); // Updates sprite.position from component
```

### Multi-System Updates
```typescript
// Multiple systems can modify the same sprite component
MovementSystem.update();   // Changes position
ScaleSystem.update();      // Changes scale  
FadeSystem.update();       // Changes alpha
RenderPixiSystem.update(); // Displays all changes
```

## Notes

- System priority ensures rendering happens after game logic
- Works with any number of sprite components per entity
- Automatically handles optional properties (like tint)
- Provides one-way sync from component data to PIXI.js objects
- Integrates seamlessly with PIXI.js rendering pipeline
- Enables separation of game logic from rendering implementation