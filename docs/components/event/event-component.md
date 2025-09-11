# EventComponent

The EventComponent is a general-purpose component that allows you to attach JavaScript event handlers to game entities. It provides a flexible way to add custom behavior through external script files.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `scriptPath` | `string` | ✅ | Project-relative path to the event handler script file (must end with `.js` for runtime usage) |

## Event Script File Pattern

Event handler files must follow this specific pattern:

### File Naming Convention
```
<EventName>.event.ts
```

### File Structure
```typescript
import type { TypeEngine } from "path/to/TypeEngine";

interface EventHandler {
  event: string;
  handler: (engine: TypeEngine, ...args: unknown[]) => void;
}

const eventHandler: EventHandler = {
  event: "eventName",  // The event name to listen for
  handler: (engine: TypeEngine, ...args: unknown[]): void => {
    // Event handler logic
  }
};

export default eventHandler;
```

## Usage

### 1. Create Event Handler Script

Create a file following the naming pattern. For example, `PlayerJump.event.ts`:

```typescript
// PlayerJump.event.ts
import type { TypeEngine } from "path/to/TypeEngine";

interface EventHandler {
  event: string;
  handler: (engine: TypeEngine, ...args: unknown[]) => void;
}

const eventHandler: EventHandler = {
  event: "playerJump",
  handler: (engine: TypeEngine, jumpHeight: number, direction: string): void => {
    console.log(`Player jumped ${jumpHeight} units in direction ${direction}`);
    
    // Access game systems through engine
    const soundEngine = engine.SoundEngine;
    soundEngine?.playSound("jump.wav");
    
    // Modify game state
    const entities = engine.EntityEngine.query<{
      PlayerComponent: PlayerComponent[];
    }>(["PlayerComponent"]);
    
    for (const { components } of entities) {
      for (const player of components.PlayerComponent) {
        player.energy -= 10; // Jumping costs energy
      }
    }
  }
};

export default eventHandler;
```

### 2. Add Component to Game Object

In your scene or blueprint JSON:

```json
{
  "name": "Player",
  "components": [
    {
      "name": "EventComponent",
      "data": {
        "scriptPath": "./PlayerJump.event.js"
      }
    }
  ]
}
```

### 3. Trigger Events (Example System)

```typescript
// In a custom system
export class JumpSystem implements System<TypeEngine> {
  name = "JumpSystem";
  priority = 1;
  enabled = true;

  async init(_engine: TypeEngine): Promise<void> {
    // never use
  }

  update(engine: TypeEngine, deltaTime: number): void {
    const entities = engine.EntityEngine.query<{
      EventComponent: EventComponent[];
      KeyboardComponent: KeyboardComponent[];
    }>(["EventComponent", "KeyboardComponent"]);

    for (const { entity, components } of entities) {
      const keyboard = components.KeyboardComponent[0];
      
      if (keyboard.keys.space && !keyboard.keys.previousSpace) {
        // Trigger the event with custom arguments
        engine.EventEngine.emit("playerJump", 50, "up");
      }
    }
  }
}
```

## Event Handler Function Signature

```typescript
handler: (engine: TypeEngine, ...args: unknown[]) => void
```

- **`engine`**: The main TypeEngine instance providing access to all game systems
- **`...args`**: Variable arguments passed when the event is triggered


## Examples

### Simple Sound Effect Handler

```typescript
// CoinCollect.event.ts
import type { TypeEngine } from "path/to/TypeEngine";

interface EventHandler {
  event: string;
  handler: (engine: TypeEngine, ...args: unknown[]) => void;
}

const eventHandler: EventHandler = {
  event: "coinCollected",
  handler: (engine: TypeEngine, coinValue: number): void => {
    // Play collection sound
    engine.AudioEngine?.playSound("coin.wav");
    
    // Update player score
    const players = engine.EntityEngine.query<{
      PlayerComponent: PlayerComponent[];
    }>(["PlayerComponent"]);
    
    for (const { components } of players) {
      for (const playerComp of components.PlayerComponent) {
        playerComp.score += coinValue;
      }
    }
  }
};

export default eventHandler;
```

### Complex State Management Handler

```typescript
// LevelComplete.event.ts
import type { TypeEngine } from "path/to/TypeEngine";

interface GameState {
  level: number;
  time: number;
  bonus: number;
  timestamp: number;
}

interface EventHandler {
  event: string;
  handler: (engine: TypeEngine, ...args: unknown[]) => void;
}

const eventHandler: EventHandler = {
  event: "levelComplete",
  handler: (engine: TypeEngine, levelNumber: number, completionTime: number, bonusPoints: number): void => {
    console.log(`Level ${levelNumber} completed in ${completionTime}s with ${bonusPoints} bonus!`);
    
    // Save progress
    const gameState: GameState = {
      level: levelNumber,
      time: completionTime,
      bonus: bonusPoints,
      timestamp: Date.now()
    };
    
    // Trigger scene transition after delay
    setTimeout(() => {
      engine.SceneEngine.loadScene("NextLevel");
    }, 2000);
    
    // Update UI components
    const uiEntities = engine.EntityEngine.query<{
      UIComponent: UIComponent[];
    }>(["UIComponent"]);
    
    for (const { components } of uiEntities) {
      for (const ui of components.UIComponent) {
        if (ui.type === "completion-screen") {
          ui.visible = true;
          ui.data = gameState;
        }
      }
    }
  }
};

export default eventHandler;
```

## Best Practices

1. **Keep handlers focused**: Each event handler should handle one specific type of event
2. **Use descriptive file names**: File names should clearly indicate what event they handle
3. **Validate arguments**: Check argument types and values before using them
4. **Handle errors gracefully**: Wrap handler logic in try-catch blocks for production
5. **Avoid heavy computation**: Event handlers should be lightweight and fast
6. **Use engine APIs**: Access game state through the provided engine systems

