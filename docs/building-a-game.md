# Building a Game

Welcome to the comprehensive guide for building games with **TYPE**! This tutorial will walk you through the step-by-step process of creating your first game using the ECS (Entity Component System) architecture.

::: tip Your Game Development Area
All game development happens in the `src/__Project__/` folder. This directory simulates any project folder and contains all the essential files for your game.
:::

## Understanding the Project Structure

Before building your game, you need to understand the key files that define your game's structure:

```
src/__Project__/
├── component.manage.json     # 🧩 Component registry
├── scenes.manage.json        # 🎬 Scene configuration  
├── system.manage.json        # ⚙️ System registry
├── Initial.scene.json        # 🎯 Scene definitions
├── Bunny.blueprint.json      # 📐 Entity blueprints
├── ExampleComponent.component.ts  # 💎 Custom components
├── ExampleSystem.system.ts        # 🔧 Custom systems
└── bunny.png                      # 🎨 Game assets
```

## Step 1: Understanding Management Files

### component.manage.json
This file registers all custom components available in your game:

```json
{
  "ExampleComponent": "ExampleComponent.component.js"
}
```

**Key Points:**
- Maps component names to their JavaScript files (`.js` extension, not `.ts`)
- Loaded during `EntityEngine.setup()` before any entities are created
- Custom components extend the available component types
- Components must follow the `ComponentInstanceManage` interface

### scenes.manage.json
This file defines your game's scene configuration:

```json
{
  "initialScene": "Initial",
  "scenes": {
    "Initial": "Initial.scene.json"
  }
}
```

**Key Points:**
- `initialScene`: Defines which scene loads first when the game starts
- `scenes`: Maps scene names to their JSON file paths
- Game automatically loads the initial scene during startup
- Used by SceneEngine for scene management and transitions

### system.manage.json
This file registers all custom systems that process game logic:

```json
{
  "ExampleSystem": "ExampleSystem.system.js"
}
```

**Key Points:**
- Maps system names to their JavaScript files (`.js` extension, not `.ts`)
- Systems are loaded and managed by SystemEngine
- Systems process entities with matching components
- Custom systems extend the available game logic processors

## Step 2: Creating Scene Files

### Scene Structure (`<SceneName>.scene.json`)
Scene files define the game world, entities, and their initial state:

```json
{
  "name": "Initial",
  "path": "Initial.scene.json",
  "systems": [],
  "gameObjects": [
    {
      "name": "Bunny",
      "blueprint": {
        "name": "Bunny",
        "path": "Bunny.blueprint.json"
      },
      "components": [
        {
          "name": "SpriteComponent",
          "data": {
            "texture_path": "bunny.png",
            "position": { "x": 400, "y": 300 },
            "scale": { "x": 1, "y": 1 },
            "rotation": 0,
            "alpha": 1,
            "visible": true,
            "anchor": 0.5
          }
        }
      ]
    }
  ]
}
```

**Scene Properties:**
- `name`: Scene identifier
- `path`: Self-reference to the scene file
- `systems`: Array of systems enabled for this scene
- `gameObjects`: Array of entities with their components and data

## Step 3: Creating Blueprint Files

### Blueprint Structure (`<Blueprint>.blueprint.json`)
Blueprints are reusable entity templates that define component combinations:

```json
{
  "name": "Bunny",
  "path": "Bunny.blueprint.json",
  "components": [
    {
      "name": "SpriteComponent",
      "data": {
        "texture_path": "bunny.png",
        "position": { "x": 400, "y": 300 },
        "scale": { "x": 1, "y": 1 },
        "rotation": 0,
        "alpha": 1,
        "visible": true,
        "anchor": 0.5
      }
    },
    {
      "name": "MouseComponent",
      "data": {
        "screenPosition": { "x": 0, "y": 0 },
        "windowPosition": { "x": 0, "y": 0 },
        "buttons": {
          "left": false,
          "right": false,
          "middle": false
        },
        "wheel": {
          "deltaX": 0,
          "deltaY": 0,
          "deltaZ": 0
        }
      }
    }
  ]
}
```

**Blueprint Benefits:**
- **Reusability**: Create templates for common entity types
- **Consistency**: Ensure entities start with the same configuration
- **Editor Integration**: Blueprints can be used in the visual editor
- **Component Prefabs**: Define default component data

## Step 4: Building Your First Game

Let's create a simple game step by step:

### 1. Set Up Your Scene Configuration
First, configure your scenes in `scenes.manage.json`:

```json
{
  "initialScene": "MainMenu",
  "scenes": {
    "MainMenu": "MainMenu.scene.json",
    "GameLevel": "GameLevel.scene.json"
  }
}
```

### 2. Create a Main Menu Scene
Create `MainMenu.scene.json`:

```json
{
  "name": "MainMenu",
  "path": "MainMenu.scene.json",
  "systems": [],
  "gameObjects": [
    {
      "name": "StartButton",
      "blueprint": {
        "name": "Button",
        "path": "Button.blueprint.json"
      },
      "components": [
        {
          "name": "SpriteComponent",
          "data": {
            "texture_path": "start-button.png",
            "position": { "x": 400, "y": 300 },
            "scale": { "x": 1, "y": 1 },
            "anchor": 0.5
          }
        },
        {
          "name": "MouseComponent",
          "data": {
            "buttons": { "left": false, "right": false, "middle": false }
          }
        }
      ]
    }
  ]
}
```

### 3. Create a Button Blueprint
Create `Button.blueprint.json`:

```json
{
  "name": "Button",
  "path": "Button.blueprint.json",
  "components": [
    {
      "name": "SpriteComponent",
      "data": {
        "position": { "x": 0, "y": 0 },
        "scale": { "x": 1, "y": 1 },
        "rotation": 0,
        "alpha": 1,
        "visible": true,
        "anchor": 0.5
      }
    },
    {
      "name": "MouseComponent",
      "data": {
        "screenPosition": { "x": 0, "y": 0 },
        "windowPosition": { "x": 0, "y": 0 },
        "buttons": { "left": false, "right": false, "middle": false }
      }
    }
  ]
}
```

### 4. Create a Game Level Scene
Create `GameLevel.scene.json`:

```json
{
  "name": "GameLevel",
  "path": "GameLevel.scene.json",
  "systems": ["MovementSystem"],
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
            "position": { "x": 100, "y": 300 },
            "scale": { "x": 1, "y": 1 }
          }
        }
      ]
    }
  ]
}
```

## Step 5: Adding Custom Components

### 1. Create a Custom Component
Create `PlayerMovement.component.ts`:

```typescript
import type {
  ComponentInstanceManage,
  ComponentSerialized,
} from "../../__Engine__/Component/ComponentInstanceManage";

export interface PlayerMovementData {
  speed?: number;
  direction: { x: number; y: number };
}

export interface PlayerMovementComponent {
  speed: number;
  direction: { x: number; y: number };
}

export default {
  name: "PlayerMovementComponent",
  create: (data: PlayerMovementData): PlayerMovementComponent => ({
    speed: data.speed ?? 100,
    direction: { ...data.direction },
  }),
  serialize: (
    component: PlayerMovementComponent,
  ): ComponentSerialized<"PlayerMovementComponent", PlayerMovementData> => ({
    name: "PlayerMovementComponent",
    data: {
      speed: component.speed,
      direction: component.direction,
    },
  }),
} as ComponentInstanceManage<"PlayerMovementComponent", PlayerMovementData, PlayerMovementComponent>;
```

### 2. Register the Component
Add to `component.manage.json`:

```json
{
  "ExampleComponent": "ExampleComponent.component.js",
  "PlayerMovementComponent": "PlayerMovement.component.js"
}
```

## Step 6: Adding Custom Systems

### 1. Create a Movement System
Create `Movement.system.ts`:

```typescript
import type { SpriteComponent } from "../../__Engine__/Component/Drawable/SpriteComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { PlayerMovementComponent } from "./PlayerMovement.component";

export class MovementSystem implements System<TypeEngine> {
  name = "MovementSystem";
  priority = 1;
  enabled = true;

  async init(_engine: TypeEngine): Promise<void> {
    // never use
  }

  update(engine: TypeEngine, deltaTime: number): void {
    const entities = engine.EntityEngine.query<{
      SpriteComponent: SpriteComponent[];
      PlayerMovementComponent: PlayerMovementComponent[];
    }>(["SpriteComponent", "PlayerMovementComponent"]);

    for (const { components } of entities) {
      for (let i = 0; i < components.SpriteComponent.length; i++) {
        const sprite = components.SpriteComponent[i];
        const movement = components.PlayerMovementComponent[i];

        // Update position based on movement
        sprite.position.x += movement.direction.x * movement.speed * deltaTime;
        sprite.position.y += movement.direction.y * movement.speed * deltaTime;
      }
    }
  }
}
```

### 2. Register the System
Add to `system.manage.json`:

```json
{
  "ExampleSystem": "ExampleSystem.system.js",
  "MovementSystem": "Movement.system.js"
}
```

## Step 7: Testing Your Game

### 1. Build and Run
```bash
# Type check your code
pnpm test:type

# Lint your code
pnpm lint

# Run tests
pnpm test

# Build the game
pnpm build

# Start development mode
pnpm dev
```

### 2. Development Workflow
1. **Write Tests First**: Create `.spec.ts` files for your components and systems
2. **Red Phase**: Ensure tests fail initially
3. **Green Phase**: Implement minimal code to pass tests
4. **Refactor Phase**: Improve code while maintaining test coverage

## Best Practices

### File Organization
- Keep related blueprints and scenes together
- Use descriptive names for your files
- Organize assets in subdirectories if needed

### Component Design
- Keep components focused on single responsibilities
- Use primitive objects (interfaces) instead of classes
- Implement proper serialization/deserialization
- Components should be pure data structures

### System Architecture
- Systems should have `name`, `priority`, `enabled`, `init`, and `update` methods
- `enabled` should always be set to `true`
- `init` method should be implemented but never used (comment: `// never use`)
- No additional state should be stored in systems
- Engine is always passed as first argument to update method
- Use deltaTime for frame-rate independent updates
- Avoid tight coupling between systems

### Scene Management
- Design scenes for specific game states (menu, gameplay, pause)
- Use systems array to enable/disable logic per scene
- Keep scene files focused and manageable

## Next Steps

Now that you understand the basics:

1. **Explore Advanced Components**: Learn about [physics components](/components/physics/rigid-body-rectangle) and [input components](/components/input/mouse)
2. **Study System Architecture**: Dive deeper into [system management](/systems) and the [SystemEngine](/architecture/system-engine)
3. **Understand Entity Lifecycle**: Learn about [entity creation and management](/architecture/entity-engine)
4. **Build Complex Scenes**: Experiment with [scene transitions](/architecture/scene-engine) and multi-scene games

::: warning File Extensions
Remember that management files (`.manage.json`) reference `.js` files, not `.ts` files. The build process compiles TypeScript to JavaScript automatically.
:::

::: tip Asset Management
Place all game assets (images, sounds) directly in the `src/__Project__/` folder or organized subdirectories for easy referencing in your components.
:::