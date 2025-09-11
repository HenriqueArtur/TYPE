# OnCollisionEventComponent

The OnCollisionEventComponent is a specialized event component that handles collision events in the physics system. It automatically triggers when the entity collides with other physics bodies and passes collision data to the event handler.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `scriptPath` | `string` | ✅ | Project-relative path to the collision event handler script file (must end with `.js` for runtime usage) |

## Collision Event Script File Pattern

Collision event handler files must follow this specific pattern:

### File Naming Convention
```
<CollisionEventName>.event.ts
```

### File Structure
```typescript
import type { TypeEngine } from "path/to/TypeEngine";
import type { EntityFetchResult } from "path/to/EntityFetchResult";

interface CollisionEventHandler {
  handler: (engine: TypeEngine, collisionEntity: EntityFetchResult) => void;
}

const eventHandler: CollisionEventHandler = {
  handler: (engine: TypeEngine, collisionEntity: EntityFetchResult): void => {
    // Collision handler logic
    // collisionEntity is the EntityFetchResult of the entity that was collided with
  }
};

export default eventHandler;
```

## Automatic Physics Event Integration

The OnCollisionEventComponent automatically integrates with the Physics System. When a collision occurs:

1. **Physics System detects collision** between two physics bodies
2. **Automatic event emission**: Physics System emits `physics:collision:enter:<entityId>` event
3. **Handler execution**: OnCollisionEventComponent automatically calls your handler function
4. **Entity data provided**: The collided entity's data is passed to your handler

### Event Pattern
```
physics:collision:enter:<entityId>
```
Where `<entityId>` is the ID of the entity with the OnCollisionEventComponent.

## Handler Function Signature

```typescript
handler: (engine: TypeEngine, collisionEntity: EntityFetchResult) => void
```

- **`engine`**: The main TypeEngine instance providing access to all game systems
- **`collisionEntity`**: The EntityFetchResult of the entity that collided with this entity

### EntityFetchResult Structure

```typescript
interface EntityFetchResult {
  entity: Entity;
  components: {
    [ComponentName: string]: ComponentType[];
  };
}
```

## Usage

### 1. Create Collision Handler Script

Create a collision event handler file. For example, `PlayerWallCollision.event.ts`:

```typescript
// PlayerWallCollision.event.ts
import type { TypeEngine } from "path/to/TypeEngine";
import type { EntityFetchResult } from "path/to/EntityFetchResult";

interface CollisionEventHandler {
  event: "collision";
  handler: (engine: TypeEngine, collisionEntity: EntityFetchResult) => void;
}

const eventHandler: CollisionEventHandler = {
  handler: (engine: TypeEngine, collisionEntity: EntityFetchResult): void => {
    console.log("Player collided with something!");
    
    // Check what type of entity we collided with
    const { entity, components } = collisionEntity;
    
    // Handle wall collision
    if (components.WallComponent) {
      const wall = components.WallComponent[0];
      console.log(`Hit a ${wall.type} wall!`);
      
      // Play impact sound
      engine.AudioEngine?.playSound("wall-hit.wav");
      
      // Reduce player health
      const playerEntities = engine.EntityEngine.query<{
        PlayerComponent: PlayerComponent[];
      }>(["PlayerComponent"]);
      
      for (const { components } of playerEntities) {
        for (const player of components.PlayerComponent) {
          player.health -= 10;
        }
      }
    }
    
    // Handle enemy collision
    if (components.EnemyComponent) {
      const enemy = components.EnemyComponent[0];
      console.log(`Collided with ${enemy.type} enemy!`);
      
      // Trigger combat system
      engine.EventEngine.emit("combatStart", entity, enemy);
    }
    
    // Handle collectible collision
    if (components.CollectibleComponent) {
      const collectible = components.CollectibleComponent[0];
      console.log(`Collected ${collectible.type}!`);
      
      // Remove collectible from scene
      engine.EntityEngine.remove(entity);
      
      // Add to inventory
      engine.EventEngine.emit("itemCollected", collectible.type, collectible.value);
    }
  }
};

export default eventHandler;
```

### 2. Add Component to Physics Entity

In your scene or blueprint JSON:

```json
{
  "name": "Player",
  "components": [
    {
      "name": "RigidBodyRectangleComponent",
      "data": {
        "x": 100,
        "y": 100,
        "width": 32,
        "height": 32
      }
    },
    {
      "name": "OnCollisionEventComponent",
      "data": {
        "scriptPath": "./PlayerWallCollision.event.js"
      }
    }
  ]
}
```

### 3. Physics System Integration

The OnCollisionEventComponent is automatically integrated with the Physics System. When a collision occurs:

1. **Physics System detects collision** between physics bodies
2. **Event emission**: Physics System emits `physics:collision:enter:<entityId>` event
3. **Automatic handler execution**: OnCollisionEventComponent listens for this event and calls your handler
4. **Entity data provided**: The collided entity's EntityFetchResult is passed to your handler

**No manual event registration needed** - the component automatically handles the physics collision events for you.

## Examples

### Collectible Item Handler

```typescript
// CollectibleCollision.event.ts
import type { TypeEngine } from "path/to/TypeEngine";
import type { EntityFetchResult } from "path/to/EntityFetchResult";

interface CollisionEventHandler {
  handler: (engine: TypeEngine, collisionEntity: EntityFetchResult) => void;
}

const eventHandler: CollisionEventHandler = {
  handler: (engine: TypeEngine, collisionEntity: EntityFetchResult): void => {
    const { entityId, components } = collisionEntity;
    
    // Only handle collectible items
    if (!components.CollectibleComponent) return;
    
    const collectible = components.CollectibleComponent[0];
    const sprite = components.SpriteComponent?.[0];
    
    // Play collection effect
    if (sprite) {
      // Animate collection
      sprite.scale.x = 1.5;
      sprite.scale.y = 1.5;
      sprite.alpha = 0.5;
      
      // Remove after animation
      setTimeout(() => {
        engine.EntityEngine.remove(entityId);
      }, 200);
    } else {
      // Remove immediately if no sprite
      engine.EntityEngine.remove(entityId);
    }
    
    // Update game state based on collectible type
    const playerEntities = engine.EntityEngine.query<{
      PlayerComponent: PlayerComponent[];
    }>(["PlayerComponent"]);
    
    for (const { components } of playerEntities) {
      for (const player of components.PlayerComponent) {
        switch (collectible.type) {
          case "coin":
            player.coins += collectible.value || 1;
            engine.AudioEngine?.playSound("coin.wav");
            break;
            
          case "health":
            player.health = Math.min(player.maxHealth, player.health + collectible.value);
            engine.AudioEngine?.playSound("heal.wav");
            break;
            
          case "key":
            player.keys += 1;
            engine.EventEngine.emit("keyCollected", collectible.keyType);
            break;
        }
      }
    }
  }
};

export default eventHandler;
```

## Physics Component Requirements

The OnCollisionEventComponent requires the entity to have a physics component:

- **RigidBodyRectangleComponent** - For dynamic collision detection
- **RigidBodyCircleComponent** - For dynamic circular collision detection
- **SensorRectangleComponent** - For trigger-based collision detection
- **SensorCircleComponent** - For trigger-based circular collision detection

Static colliders (ColliderRectangleComponent, ColliderCircleComponent) cannot trigger collision events as they don't move.

## Best Practices

1. **Check component existence**: Always verify components exist before accessing them
2. **Handle multiple component types**: Use conditional logic for different collision scenarios
3. **Avoid expensive operations**: Keep collision handlers lightweight for performance
4. **Use collision filtering**: Set up physics layers to avoid unnecessary collision checks
5. **Cleanup resources**: Remove entities or components when no longer needed
6. **Debounce rapid collisions**: Prevent multiple triggers for the same collision

