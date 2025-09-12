# How to Build a Game with TYPE Engine

This comprehensive guide walks you through building games using the TYPE Game Engine's Entity-Component-System (ECS) architecture. All game development happens in the `src/__Project__/` directory.

## Overview: Game Development Workflow

1. **Plan Your Game**: Define scenes, entities, and behaviors
2. **Set Up Management Files**: Configure components, systems, and scenes
3. **Create Scenes**: Define game worlds and entity placement
4. **Build Blueprints**: Create reusable entity templates
5. **Develop Custom Components**: Add game-specific data containers
6. **Implement Systems**: Program game logic and behavior
7. **Test and Iterate**: Build, test, and refine your game

---

## Step 1: Understanding the Project Structure

### Essential Files in `src/__Project__/`

```
src/__Project__/
├── 📋 component.manage.json    # Custom component registry
├── 🎬 scenes.manage.json       # Scene configuration
├── ⚙️ system.manage.json        # Custom system registry
├── 🎯 *.scene.json             # Scene definitions
├── 📐 *.blueprint.json         # Entity blueprints
├── 💎 *.component.ts           # Custom components
├── 🔧 *.system.ts              # Custom systems
└── 🎨 assets/                  # Game assets (images, sounds)
```

### File Relationships
- **Management files** register your custom components and systems
- **Scene files** define game worlds and entity placement
- **Blueprint files** create reusable entity templates
- **Component files** define custom data structures
- **System files** implement game logic and behavior

---

## Step 2: Set Up Management Files

### component.manage.json
Registers all custom components available in your game:

```json
{
  "PlayerHealthComponent": "PlayerHealthComponent.component.js",
  "WeaponComponent": "WeaponComponent.component.js",
  "EnemyAIComponent": "EnemyAIComponent.component.js"
}
```

**Key Points:**
- Use `.js` extension (TypeScript compiles to JavaScript)
- Maps component names to their compiled files
- Loaded during `EntityEngine.setup()` before entities are created
- Components must follow `ComponentInstanceManage` interface

### scenes.manage.json
Defines your game's scene configuration:

```json
{
  "initialScene": "MainMenu",
  "scenes": {
    "MainMenu": "MainMenu.scene.json",
    "Level1": "Level1.scene.json", 
    "Level2": "Level2.scene.json",
    "GameOver": "GameOver.scene.json"
  }
}
```

**Key Points:**
- `initialScene`: First scene loaded when game starts
- `scenes`: Maps scene names to their JSON files
- Used by SceneEngine for scene transitions
- Scene names are used in `engine.SceneEngine.loadScene("SceneName")`

### system.manage.json
Registers all custom systems that process game logic:

```json
{
  "PlayerMovementSystem": "PlayerMovementSystem.system.js",
  "EnemyAISystem": "EnemyAISystem.system.js",
  "CombatSystem": "CombatSystem.system.js",
  "UISystem": "UISystem.system.js"
}
```

**Key Points:**
- Use `.js` extension (TypeScript compiles to JavaScript)
- Maps system class names to their compiled files
- Systems are loaded and managed by SystemEngine
- Systems process entities with matching components

---

## Step 3: Create Scene Files

### Basic Scene Structure
Scene files define game worlds, entities, and their initial state:

```json
{
  "name": "Level1",
  "path": "Level1.scene.json",
  "systems": ["PlayerMovementSystem", "EnemyAISystem", "CombatSystem"],
  "gameObjects": [
    {
      "name": "Player",
      "blueprint": {
        "name": "Player",
        "path": "Player.blueprint.json"
      },
      "components": [
        {
          "name": "SpriteComponent",
          "data": {
            "texture_path": "player.png",
            "position": { "x": 100, "y": 400 }
          }
        },
        {
          "name": "RigidBodyRectangleComponent",
          "data": {
            "x": 100,
            "y": 400,
            "width": 32,
            "height": 48,
            "density": 0.005
          }
        }
      ]
    },
    {
      "name": "Ground",
      "components": [
        {
          "name": "RectangleComponent",
          "data": {
            "width": 800,
            "height": 50,
            "position": { "x": 400, "y": 575 },
            "fill": { "enabled": true, "color": "#8B4513" }
          }
        },
        {
          "name": "ColliderRectangleComponent",
          "data": {
            "x": 400,
            "y": 575,
            "width": 800,
            "height": 50
          }
        }
      ]
    }
  ]
}
```

### Scene Properties Explained
- **name**: Scene identifier used for transitions
- **path**: Self-reference to the scene file
- **systems**: Array of custom systems enabled for this scene
- **gameObjects**: Array of entities with their components

### Entity Structure in Scenes
Each game object can have:
- **name**: Unique identifier for the entity
- **blueprint** (optional): Template to base the entity on
- **components**: Array of component instances with their data

---

## Step 4: Create Blueprint Files

### Blueprint Structure
Blueprints are reusable entity templates:

```json
{
  "name": "Player",
  "path": "Player.blueprint.json",
  "components": [
    {
      "name": "SpriteComponent",
      "data": {
        "texture_path": "player.png",
        "position": { "x": 0, "y": 0 },
        "anchor": 0.5
      }
    },
    {
      "name": "RigidBodyRectangleComponent",
      "data": {
        "x": 0,
        "y": 0,
        "width": 32,
        "height": 48,
        "density": 0.005,
        "friction": 0.001
      }
    },
    {
      "name": "PlayerHealthComponent",
      "data": {
        "maxHealth": 100,
        "currentHealth": 100,
        "regenerationRate": 2
      }
    },
    {
      "name": "WeaponComponent", 
      "data": {
        "weaponType": "sword",
        "damage": 25,
        "attackRange": 50,
        "attackSpeed": 1.5
      }
    }
  ]
}
```

### Blueprint Benefits
- **Reusability**: Create multiple instances of the same entity type
- **Consistency**: Ensure entities start with proper configuration
- **Maintenance**: Update blueprint to affect all instances
- **Editor Integration**: Blueprints work with visual editors

### Common Blueprint Patterns

**Enemy Blueprint:**
```json
{
  "name": "Enemy",
  "path": "Enemy.blueprint.json",
  "components": [
    {
      "name": "SpriteComponent",
      "data": { "texture_path": "enemy.png", "tint": 0xff4444 }
    },
    {
      "name": "RigidBodyRectangleComponent", 
      "data": { "width": 24, "height": 32, "density": 0.003 }
    },
    {
      "name": "EnemyAIComponent",
      "data": { "aggroRange": 100, "speed": 50, "patrolDistance": 80 }
    }
  ]
}
```

**Collectible Item Blueprint:**
```json
{
  "name": "Coin",
  "path": "Coin.blueprint.json", 
  "components": [
    {
      "name": "SpriteComponent",
      "data": { "texture_path": "coin.png", "scale": { "x": 0.5, "y": 0.5 } }
    },
    {
      "name": "SensorCircleComponent",
      "data": { "radius": 16 }
    },
    {
      "name": "EventComponent",
      "data": { "scriptPath": "CoinCollected.event.js" }
    }
  ]
}
```

---

## Step 5: Create Custom Components

### Component File Structure
Create components following the naming pattern `ComponentName.component.ts`:

```typescript
// PlayerHealthComponent.component.ts
import type {
  ComponentInstanceManage,
  ComponentSerialized,
} from "../../__Engine__/Component/ComponentInstanceManage";

export interface PlayerHealthComponentData {
  maxHealth: number;
  currentHealth?: number;
  regenerationRate?: number;
  invulnerabilityTime?: number;
}

export interface PlayerHealthComponent {
  maxHealth: number;
  currentHealth: number;
  regenerationRate: number;
  invulnerabilityTime: number;
  lastDamageTime: number;
}

export default {
  name: "PlayerHealthComponent",
  create: (data: PlayerHealthComponentData): PlayerHealthComponent => ({
    maxHealth: data.maxHealth,
    currentHealth: data.currentHealth ?? data.maxHealth,
    regenerationRate: data.regenerationRate ?? 0,
    invulnerabilityTime: data.invulnerabilityTime ?? 1000, // 1 second
    lastDamageTime: 0,
  }),
  serialize: (
    component: PlayerHealthComponent,
  ): ComponentSerialized<"PlayerHealthComponent", PlayerHealthComponentData> => ({
    name: "PlayerHealthComponent",
    data: {
      maxHealth: component.maxHealth,
      currentHealth: component.currentHealth,
      regenerationRate: component.regenerationRate,
      invulnerabilityTime: component.invulnerabilityTime,
    },
  }),
} as ComponentInstanceManage<"PlayerHealthComponent", PlayerHealthComponentData, PlayerHealthComponent>;
```

### Component Design Principles
1. **Data Only**: Components contain no methods, only properties
2. **Interfaces**: Define both data input and runtime component types
3. **Default Values**: Provide sensible defaults for optional properties
4. **Serializable**: All data must be JSON serializable
5. **TypeScript**: Use strict typing for all properties

### Common Component Patterns

**AI Component:**
```typescript
export interface EnemyAIComponentData {
  aggroRange: number;
  speed: number;
  patrolDistance?: number;
  attackRange?: number;
  attackDamage?: number;
}

export interface EnemyAIComponent {
  aggroRange: number;
  speed: number;
  patrolDistance: number;
  attackRange: number;
  attackDamage: number;
  state: "patrol" | "chase" | "attack" | "return";
  targetPosition: { x: number; y: number };
  basePosition: { x: number; y: number };
  lastAttackTime: number;
}
```

**Inventory Component:**
```typescript
export interface InventoryComponentData {
  maxSlots?: number;
  items?: Array<{ id: string; quantity: number }>;
}

export interface InventoryComponent {
  maxSlots: number;
  items: Array<{ id: string; quantity: number; slot: number }>;
  selectedSlot: number;
}
```

---

## Step 6: Implement Custom Systems

### System File Structure
Create systems following the naming pattern `SystemName.system.ts`:

```typescript
// PlayerMovementSystem.system.ts
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { SpriteComponent } from "../../__Engine__/Component/Drawable/SpriteComponent";
import type { RigidBodyRectangleComponent } from "../../__Engine__/Component/Physics/RigidBodyRectangleComponent";
import type { MouseComponent } from "../../__Engine__/Component/Input/MouseComponent";

export class PlayerMovementSystem implements System<TypeEngine> {
  name = "PlayerMovementSystem";
  priority = 1; // Execute early for input processing
  enabled = true;

  async init(_engine: TypeEngine): Promise<void> {
    // Internal engine use only (will be removed in future version)
  }

  update(engine: TypeEngine, deltaTime: number): void {
    // Query entities with required components
    const playerEntities = engine.EntityEngine.query<{
      SpriteComponent: SpriteComponent[];
      RigidBodyRectangleComponent: RigidBodyRectangleComponent[];
      MouseComponent: MouseComponent[];
    }>(["SpriteComponent", "RigidBodyRectangleComponent", "MouseComponent"]);

    for (const { components } of playerEntities) {
      const sprite = components.SpriteComponent[0];
      const rigidBody = components.RigidBodyRectangleComponent[0];
      const mouse = components.MouseComponent[0];

      // Handle input
      let velocityX = 0;
      const speed = 200; // pixels per second

      // Check for movement keys (assuming keyboard input added)
      if (this.isKeyPressed("ArrowLeft") || this.isKeyPressed("a")) {
        velocityX = -speed;
      } else if (this.isKeyPressed("ArrowRight") || this.isKeyPressed("d")) {
        velocityX = speed;
      }

      // Apply movement to physics body
      rigidBody._body.velocity.x = velocityX;

      // Handle jumping
      if (this.isKeyPressed(" ") && Math.abs(rigidBody._body.velocity.y) < 1) {
        rigidBody._body.velocity.y = -400; // Jump force
      }

      // Sync sprite position with physics body
      sprite.position.x = rigidBody._body.position.x;
      sprite.position.y = rigidBody._body.position.y;
      sprite.rotation = rigidBody._body.angle;
    }
  }

  // Helper method (you'd implement keyboard input)
  private isKeyPressed(key: string): boolean {
    // This would check keyboard state
    return false; // Placeholder
  }
}
```

### System Architecture Requirements
1. **Implement System Interface**: Include `name`, `priority`, `enabled`, `init`, `update`
2. **Component Queries**: Use `engine.EntityEngine.query()` to find relevant entities
3. **Delta Time**: Use for frame-rate independent updates
4. **Engine Access**: Access all sub-engines through the main TypeEngine
5. **Priority**: Lower numbers execute first (1 = input, 2 = rendering, etc.)

### Common System Patterns

**Enemy AI System:**
```typescript
export class EnemyAISystem implements System<TypeEngine> {
  name = "EnemyAISystem";
  priority = 2;
  enabled = true;

  async init(_engine: TypeEngine): Promise<void> {}

  update(engine: TypeEngine, deltaTime: number): void {
    const enemies = engine.EntityEngine.query<{
      SpriteComponent: SpriteComponent[];
      RigidBodyRectangleComponent: RigidBodyRectangleComponent[];
      EnemyAIComponent: EnemyAIComponent[];
    }>(["SpriteComponent", "RigidBodyRectangleComponent", "EnemyAIComponent"]);

    const players = engine.EntityEngine.query<{
      SpriteComponent: SpriteComponent[];
    }>(["SpriteComponent"]);

    for (const { components: enemyComps } of enemies) {
      const enemySprite = enemyComps.SpriteComponent[0];
      const enemyBody = enemyComps.RigidBodyRectangleComponent[0];
      const enemyAI = enemyComps.EnemyAIComponent[0];

      // Find nearest player
      let nearestPlayer: SpriteComponent | null = null;
      let nearestDistance = Number.MAX_VALUE;

      for (const { components: playerComps } of players) {
        const playerSprite = playerComps.SpriteComponent[0];
        const distance = Math.sqrt(
          Math.pow(playerSprite.position.x - enemySprite.position.x, 2) +
          Math.pow(playerSprite.position.y - enemySprite.position.y, 2)
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPlayer = playerSprite;
        }
      }

      // AI behavior based on distance and state
      if (nearestPlayer && nearestDistance < enemyAI.aggroRange) {
        // Chase player
        const direction = {
          x: nearestPlayer.position.x - enemySprite.position.x,
          y: nearestPlayer.position.y - enemySprite.position.y
        };
        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        
        if (magnitude > 0) {
          direction.x /= magnitude;
          direction.y /= magnitude;
          
          enemyBody._body.velocity.x = direction.x * enemyAI.speed;
          enemyAI.state = "chase";
        }
      } else {
        // Return to patrol
        enemyBody._body.velocity.x = 0;
        enemyAI.state = "patrol";
      }
    }
  }
}
```

**Collision Handling System:**
```typescript
export class CollisionSystem implements System<TypeEngine> {
  name = "CollisionSystem";
  priority = 1;
  enabled = true;

  async init(engine: TypeEngine): Promise<void> {
    // Listen for collision events
    engine.EventEngine.on("collision", this.handleCollision.bind(this));
  }

  update(_engine: TypeEngine, _deltaTime: number): void {
    // Collision detection handled by physics engine events
  }

  private handleCollision(engine: TypeEngine, bodyA: Body, bodyB: Body): void {
    // Find entities with these bodies
    const entityA = this.findEntityByBody(engine, bodyA);
    const entityB = this.findEntityByBody(engine, bodyB);

    if (entityA && entityB) {
      // Handle specific collision types
      this.processCollision(engine, entityA, entityB);
    }
  }

  private findEntityByBody(engine: TypeEngine, body: Body): any {
    // Implementation to find entity by physics body
  }

  private processCollision(engine: TypeEngine, entityA: any, entityB: any): void {
    // Handle collision logic
  }
}
```

---

## Step 7: Complete Game Example

### Simple Platformer Game

**1. scenes.manage.json:**
```json
{
  "initialScene": "Level1",
  "scenes": {
    "Level1": "Level1.scene.json"
  }
}
```

**2. component.manage.json:**
```json
{
  "PlayerControllerComponent": "PlayerControllerComponent.component.js"
}
```

**3. system.manage.json:**
```json
{
  "PlayerMovementSystem": "PlayerMovementSystem.system.js"
}
```

**4. Level1.scene.json:**
```json
{
  "name": "Level1",
  "path": "Level1.scene.json", 
  "systems": ["PlayerMovementSystem"],
  "gameObjects": [
    {
      "name": "Player",
      "blueprint": { "name": "Player", "path": "Player.blueprint.json" },
      "components": [
        {
          "name": "SpriteComponent",
          "data": { "texture_path": "player.png", "position": { "x": 100, "y": 300 } }
        },
        {
          "name": "RigidBodyRectangleComponent",
          "data": { "x": 100, "y": 300, "width": 32, "height": 48 }
        },
        {
          "name": "PlayerControllerComponent",
          "data": { "speed": 200, "jumpForce": 400 }
        }
      ]
    },
    {
      "name": "Ground",
      "components": [
        {
          "name": "RectangleComponent",
          "data": {
            "width": 800, "height": 50, "position": { "x": 400, "y": 575 },
            "fill": { "enabled": true, "color": "#654321" }
          }
        },
        {
          "name": "ColliderRectangleComponent",
          "data": { "x": 400, "y": 575, "width": 800, "height": 50 }
        }
      ]
    }
  ]
}
```

---

## Development Best Practices

### Testing and Debugging
1. **Build Early, Test Often**: Use `pnpm build` frequently
2. **Component Validation**: Verify components load correctly
3. **System Priorities**: Ensure systems execute in correct order
4. **Performance**: Monitor entity counts and system complexity

### File Organization
```
src/__Project__/
├── components/
│   ├── PlayerHealthComponent.component.ts
│   ├── WeaponComponent.component.ts
│   └── EnemyAIComponent.component.ts
├── systems/
│   ├── PlayerMovementSystem.system.ts
│   ├── CombatSystem.system.ts
│   └── EnemyAISystem.system.ts
├── scenes/
│   ├── MainMenu.scene.json
│   ├── Level1.scene.json
│   └── GameOver.scene.json
├── blueprints/
│   ├── Player.blueprint.json
│   ├── Enemy.blueprint.json
│   └── Collectible.blueprint.json
├── assets/
│   ├── images/
│   ├── sounds/
│   └── fonts/
├── component.manage.json
├── system.manage.json
└── scenes.manage.json
```

### Common Pitfalls
1. **File Extensions**: Use `.js` in management files, not `.ts`
2. **Component Registration**: Components must be registered before use
3. **System Priority**: Input systems should have priority 1
4. **Asset Paths**: Ensure asset paths are relative to project folder
5. **JSON Syntax**: Validate JSON files for syntax errors

### Performance Tips
1. **Entity Queries**: Cache query results when possible
2. **Component Design**: Keep components lightweight
3. **System Efficiency**: Avoid expensive operations in update loops
4. **Asset Management**: Optimize images and audio files

---

## Quick Reference

### Essential Commands
- `pnpm dev` - Start development mode
- `pnpm build` - Build for testing
- `pnpm test:type` - TypeScript validation
- `pnpm lint` - Code formatting

### File Extensions
- **Source**: `.component.ts`, `.system.ts`
- **Compiled**: `.component.js`, `.system.js`
- **Data**: `.scene.json`, `.blueprint.json`
- **Management**: `.manage.json`

### Key Interfaces
- **ComponentInstanceManage**: Component definition interface
- **System<TypeEngine>**: System implementation interface
- **ComponentSerialized**: Component data serialization

This guide provides everything needed to build complete games using the TYPE Game Engine. Start simple, test frequently, and gradually add complexity as you become comfortable with the ECS architecture.