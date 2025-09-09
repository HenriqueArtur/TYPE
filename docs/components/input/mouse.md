# Mouse Component

The Mouse Component handles mouse input state, tracking position, button states, and scroll wheel data. It provides comprehensive mouse interaction capabilities for game entities.

## Purpose

The Mouse Component handles:
- Mouse cursor position tracking
- Button state detection (left, right, middle)
- Scroll wheel input
- Screen and window coordinate mapping

## Properties

### Optional Properties (All have defaults)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `screenPosition` | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Mouse position in screen coordinates |
| `windowPosition` | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Mouse position in window coordinates |
| `buttons` | `{ left: boolean, right: boolean, middle: boolean }` | All `false` | Current button press states |
| `wheel` | `{ deltaX: number, deltaY: number, deltaZ: number }` | All `0` | Scroll wheel delta values |

## Usage Examples

### Basic Mouse Component
```typescript
const mouseData: MouseComponentData = {};
// All properties use defaults
```

### Mouse with Initial Position
```typescript
const mouseData: MouseComponentData = {
  screenPosition: { x: 100, y: 150 },
  windowPosition: { x: 100, y: 150 }
};
```

### Mouse with Button States
```typescript
const mouseData: MouseComponentData = {
  buttons: {
    left: true,
    right: false,
    middle: false
  }
};
```

### Complete Mouse State
```typescript
const mouseData: MouseComponentData = {
  screenPosition: { x: 250, y: 300 },
  windowPosition: { x: 250, y: 300 },
  buttons: {
    left: false,
    right: true,
    middle: false
  },
  wheel: {
    deltaX: 0,
    deltaY: -1, // Scrolled up
    deltaZ: 0
  }
};
```

## Runtime Properties

The created component includes all the above properties as required (no optional properties in the final type).

## Property Descriptions

### Position Properties

- **screenPosition**: Global screen coordinates
- **windowPosition**: Coordinates relative to the game window

### Button Properties

- **left**: Left mouse button state
- **right**: Right mouse button state  
- **middle**: Middle mouse button (scroll wheel click) state

### Wheel Properties

- **deltaX**: Horizontal scroll amount
- **deltaY**: Vertical scroll amount (positive = down, negative = up)
- **deltaZ**: Z-axis scroll (rarely used)

## Common Usage Patterns

### Click Detection
```typescript
// Check if left button is pressed
if (mouseComponent.buttons.left) {
  // Handle left click
}
```

### Position-based Interaction
```typescript
// Get mouse position for targeting
const mouseX = mouseComponent.windowPosition.x;
const mouseY = mouseComponent.windowPosition.y;
```

### Scroll Input
```typescript
// Handle zoom with scroll wheel
if (mouseComponent.wheel.deltaY !== 0) {
  const zoomDirection = mouseComponent.wheel.deltaY > 0 ? -1 : 1;
  // Apply zoom
}
```

### Right-click Context Menu
```typescript
// Detect right-click for context actions
if (mouseComponent.buttons.right) {
  // Show context menu or perform alternate action
}
```

## Notes

- Button states represent current press status, not click events
- Position coordinates depend on your coordinate system setup
- Wheel delta values reset after each frame/update
- The component stores state but doesn't generate events
- Combine with input systems to create interactive gameplay
- Useful for UI elements, targeting systems, and camera controls