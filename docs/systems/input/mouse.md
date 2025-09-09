# Mouse System

The Mouse System captures mouse input events from the browser and updates Mouse Components with current position, button states, and scroll wheel data.

::: warning
MouseSystem is currently the only system that interacts with external window APIs. This is necessary for capturing browser input events. Future systems should only update component data.
:::

## Purpose

The Mouse System handles:
- Capturing browser mouse events (move, click, scroll)
- Tracking mouse position in screen and window coordinates  
- Monitoring button press states (left, right, middle)
- Processing scroll wheel input with delta values
- Updating all Mouse Components with current input state

## System Properties

| Property | Value | Description |
|----------|--------|-------------|
| `name` | `"MouseSystem"` | System identifier |
| `priority` | `1` | Executes early (input processing before game logic) |
| `enabled` | `true` | Enabled by default |

## Implementation

```typescript
export class MouseSystem implements System<TypeEngine> {
  name = "MouseSystem";
  priority = 1;
  enabled = true;

  private mouse_position_screen = { x: 0, y: 0 };
  private mouse_position_window = { x: 0, y: 0 };
  private mouse_buttons = { left: false, right: false, middle: false };
  private mouse_wheel = { deltaX: 0, deltaY: 0, deltaZ: 0 };

  async init(_engine: TypeEngine): Promise<void> {
    // Set up browser event listeners for mouse input
  }

  update(engine: TypeEngine, _deltaTime: number): void {
    // Update all MouseComponents with current input state
  }

  destroy(_engine: TypeEngine): void {
    // Clean up event listeners
  }
}
```

## Functionality

### Event Listener Setup
During `init()`, the system sets up browser event listeners:

**Mouse Movement**: `mousemove` event
- Captures `event.screenX/screenY` for screen coordinates
- Captures `event.clientX/clientY` for window coordinates
- Updates internal position tracking variables

**Button Events**: `mousedown` and `mouseup` events
- Maps `event.button` values to button states:
  - `0` = Left button
  - `1` = Middle button (scroll wheel click)
  - `2` = Right button
- Updates internal button state tracking

**Scroll Events**: `wheel` event
- Captures `event.deltaX/deltaY/deltaZ` values
- Resets wheel deltas after one frame (using `setTimeout`)
- Provides frame-based scroll input

**Context Menu**: `contextmenu` event
- Prevents right-click context menu (optional)
- Allows right-click to be used for game input

### Component Updates
During `update()`, the system:

1. **Queries Mouse Entities**: Finds all entities with MouseComponent
2. **Updates Position Data**: Copies current mouse position to all components
3. **Updates Button States**: Copies current button states to all components  
4. **Updates Wheel Data**: Copies current scroll wheel deltas to all components

```typescript
update(engine: TypeEngine, _deltaTime: number): void {
  const mouse_entities = engine.EntityEngine.query<{ MouseComponent: MouseComponent[] }>([
    "MouseComponent",
  ]);

  for (const { components } of mouse_entities) {
    for (const mouse_component of components.MouseComponent) {
      // Update positions
      mouse_component.screenPosition.x = this.mouse_position_screen.x;
      mouse_component.screenPosition.y = this.mouse_position_screen.y;
      mouse_component.windowPosition.x = this.mouse_position_window.x;
      mouse_component.windowPosition.y = this.mouse_position_window.y;

      // Update button states
      mouse_component.buttons.left = this.mouse_buttons.left;
      mouse_component.buttons.right = this.mouse_buttons.right;
      mouse_component.buttons.middle = this.mouse_buttons.middle;

      // Update wheel data
      mouse_component.wheel.deltaX = this.mouse_wheel.deltaX;
      mouse_component.wheel.deltaY = this.mouse_wheel.deltaY;
      mouse_component.wheel.deltaZ = this.mouse_wheel.deltaZ;
    }
  }
}
```

## Input Data Types

### Position Tracking
**Screen Position**: Global screen coordinates
- `screenX/screenY` from mouse events
- Absolute position on entire screen/monitor
- Useful for multi-window applications

**Window Position**: Window-relative coordinates  
- `clientX/clientY` from mouse events
- Position within the game window/canvas
- Most commonly used for game interactions

### Button States
**Button Mapping**:
- `buttons.left`: Left mouse button (primary click)
- `buttons.right`: Right mouse button (secondary click) 
- `buttons.middle`: Middle mouse button (scroll wheel click)

**State Tracking**:
- `true`: Button currently pressed down
- `false`: Button not pressed or was released

### Scroll Wheel Data
**Delta Values**:
- `deltaX`: Horizontal scroll amount
- `deltaY`: Vertical scroll amount (most common)
- `deltaZ`: Z-axis scroll (rarely used)

**Frame Behavior**:
- Deltas are captured for one frame only
- Automatically reset to 0 after processing
- Provides discrete scroll events rather than continuous values

## Usage Examples

### Basic Mouse Input
```typescript
// Create entity with mouse component
const mouseEntity = createEntity([{
  name: "MouseComponent", 
  data: {} // Uses all defaults
}]);

// Mouse system automatically updates the component
// Other systems can read mouse input from the component
```

### Game Logic Integration
```typescript
class PlayerControlSystem implements System<TypeEngine> {
  update(engine: TypeEngine, deltaTime: number): void {
    const playerEntities = engine.EntityEngine.query([
      "PlayerComponent", "MouseComponent", "TransformComponent"
    ]);

    for (const { components } of playerEntities) {
      const mouse = components.MouseComponent[0];
      const transform = components.TransformComponent[0];

      // Move player towards mouse position
      if (mouse.buttons.left) {
        const targetX = mouse.windowPosition.x;
        const targetY = mouse.windowPosition.y;
        
        // Move towards mouse
        transform.position.x += (targetX - transform.position.x) * 0.1;
        transform.position.y += (targetY - transform.position.y) * 0.1;
      }

      // Handle scroll wheel for zoom
      if (mouse.wheel.deltaY !== 0) {
        const zoomFactor = mouse.wheel.deltaY > 0 ? 0.9 : 1.1;
        transform.scale.x *= zoomFactor;
        transform.scale.y *= zoomFactor;
      }
    }
  }
}
```

### Click Detection
```typescript
class ClickHandlerSystem implements System<TypeEngine> {
  private wasPressed = false;

  update(engine: TypeEngine, deltaTime: number): void {
    const clickEntities = engine.EntityEngine.query([
      "MouseComponent", "ClickableComponent"
    ]);

    for (const { components } of clickEntities) {
      const mouse = components.MouseComponent[0];
      const clickable = components.ClickableComponent[0];

      // Detect click event (press -> release)
      const isPressed = mouse.buttons.left;
      
      if (this.wasPressed && !isPressed) {
        // Mouse was just released - this is a click!
        clickable.onClick(mouse.windowPosition.x, mouse.windowPosition.y);
      }
      
      this.wasPressed = isPressed;
    }
  }
}
```

### Right-Click Context Menu
```typescript
class ContextMenuSystem implements System<TypeEngine> {
  update(engine: TypeEngine, deltaTime: number): void {
    const entities = engine.EntityEngine.query(["MouseComponent"]);

    for (const { components } of entities) {
      const mouse = components.MouseComponent[0];

      if (mouse.buttons.right) {
        // Handle right-click context actions
        this.showContextMenu(mouse.windowPosition.x, mouse.windowPosition.y);
      }
    }
  }
}
```

## Event Lifecycle

### Initialization
1. System checks for browser environment (`typeof window !== "undefined"`)
2. Creates bound event handler references for cleanup
3. Registers event listeners on `window` object
4. Initializes internal state variables

### Runtime
1. Browser events update internal system state
2. `update()` copies internal state to all MouseComponents
3. Other systems read input from MouseComponents
4. Wheel deltas are automatically reset after each frame

### Cleanup
1. `destroy()` removes all event listeners using bound references
2. Prevents memory leaks from orphaned event handlers
3. Cleans up internal state

## Performance Considerations

### Event Handling
- Uses bound method references to avoid memory leaks
- Single system handles all mouse input globally
- Efficient event listener management

### Component Updates
- Updates all MouseComponents with same data
- Minimal processing per component
- No expensive calculations or DOM queries

### Frame Timing
- Scroll wheel data is frame-synchronized
- Position updates are immediate from events
- Button states persist until changed

## Browser Compatibility

### Modern Browsers
- Uses standard mouse events supported by all modern browsers
- WebGL context menu prevention works universally
- Touch devices may emulate mouse events

### Coordinate Systems
- Screen coordinates: Global across all monitors
- Window coordinates: Relative to game canvas/window
- Coordinate origin typically at top-left (0,0)

## Notes

- System runs early (priority 1) to provide input for game logic systems
- Handles all mouse input centrally for consistent behavior
- Automatically prevents right-click context menu for better game experience
- Provides frame-synchronized scroll wheel input
- Cleans up event listeners properly to prevent memory leaks
- Works with multiple MouseComponents simultaneously
- Browser-dependent coordinate systems may vary between platforms