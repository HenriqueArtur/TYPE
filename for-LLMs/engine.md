# Engine Architecture Documentation

## Overview
This is a component-based game engine built with TypeScript and PIXI.js. The engine follows an Entity-Component-System (ECS) architecture where game objects are entities with attached components.

## Core Systems

### Components (`src/__Engine__/Component/`)
Components are data containers that define properties and behaviors for game objects.

#### Available Components
- **TransformComponent**: Position, rotation, and scale data
- **SpriteComponent**: Visual sprite rendering with PIXI.js integration
- **TextureComponent**: Texture loading and management
- **BodyComponent**: Abstract base for Matter.js physics bodies
- **RectangularBodyComponent**: Rectangular physics body implementation

#### Component Registry
All components must be registered in `COMPONENT_CLASSES` registry (`src/__Engine__/Component/index.ts`) with their JSON deserialization functions.

#### Adding New Components
1. Create component class extending `GameComponent`
2. Implement `jsonToGameObject` static method
3. Add to `ComponentType` union type
4. Register in `COMPONENT_CLASSES` registry
5. Document component in this file

#### Body Components (`src/__Engine__/Component/Body/`)
Physics components that integrate with Matter.js for realistic physics simulation.

##### BodyComponent (Abstract)
Abstract base class for all physics body components.

**Features:**
- Matter.js Body integration
- Configurable physics properties (friction, restitution, density, static state)
- Abstract createBody() method for subclass implementation
- Body property synchronization and updates

**Properties:**
- `is_static`: Whether the body is static or dynamic
- `friction`: Surface friction coefficient (0.0 - 1.0)
- `restitution`: Bounciness factor (0.0 - 1.0) 
- `density`: Mass density for physics calculations

**Methods:**
- `getBody()`: Returns the underlying Matter.js Body
- `set(data)`: Updates physics properties and synchronizes with Matter.js
- `value()`: Returns current component state for serialization

##### RectangularBodyComponent
Concrete implementation creating rectangular physics bodies.

**Features:**
- Rectangular Matter.js body creation
- Position and dimension control
- Dynamic body shape updates
- Proper constructor initialization order

**Additional Properties:**
- `width`: Rectangle width in pixels
- `height`: Rectangle height in pixels
- `x`: Body position X coordinate
- `y`: Body position Y coordinate

**Usage Example:**
```typescript
const bodyComponent = new RectangularBodyComponent({
  width: 100,
  height: 50,
  x: 400,
  y: 300,
  is_static: false,
  friction: 0.7,
  restitution: 0.3
});
```

**JSON Configuration:**
```json
{
  "type": "RectangularBodyComponent",
  "name": "physics_body",
  "initial_values": {
    "width": 100,
    "height": 50,
    "x": 400,
    "y": 300,
    "is_static": false,
    "friction": 0.7,
    "restitution": 0.3,
    "density": 0.001
  }
}
```

### Game Objects (`src/__Engine__/GameObject/`)
Game objects are entities that hold components and implement game logic.

#### Types
- **AbstractGameObject**: Base class for all game objects
- **ConcreteGameObject**: Generic object for JSON-defined entities
- **Custom GameObjects**: TypeScript classes with specific behaviors

#### Creation Methods
- **JSON-based**: Defined in `.obj.json` files, loaded via `ConcreteGameObject`
- **Script-based**: Custom TypeScript classes with logic and component composition

### Scene System (`src/__Engine__/Scene/`)
Manages collections of game objects and provides scene-level operations.

#### GameScene Features
- Game object hierarchy management
- Component aggregation and tracking
- JSON-based scene serialization
- Dynamic script loading for custom game objects

#### Scene Loading
Scenes are loaded from JSON files and can contain:
- Direct component definitions
- References to custom game object scripts
- Asset paths and configurations

### Input Devices (`src/__Engine__/InputDevices/`)
Handles input from various devices.

#### Available Input
- **Mouse**: Basic mouse input handling (`Mouse/`)

#### Extending Input
- Create device-specific modules
- Implement event handling and state management
- Integrate with game object input systems

### Utilities (`src/__Engine__/Utils/`)
Common utilities and helpers used throughout the engine.

#### Available Utilities
- **Angle**: Angle calculations and conversions
- **id**: Unique ID generation for engine objects

#### Adding Utilities
- Create focused, single-purpose utility modules
- Include comprehensive tests
- Document public APIs

## Data Flow

### Asset Loading Pipeline
```
JSON Files → Component Factory → Game Objects → Scene Assembly → Rendering
```

### Component Lifecycle
1. **Definition**: Component class with data properties
2. **Registration**: Added to component registry
3. **Serialization**: JSON representation in project files
4. **Deserialization**: `jsonToGameObject` creates instances
5. **Runtime**: Component operates within game object

### Game Object Creation
1. **JSON Definition**: `.obj.json` defines initial state
2. **Script Loading**: `.ts` file provides custom logic (optional)
3. **Component Assembly**: Components attached based on configuration
4. **Scene Integration**: Object added to scene hierarchy

## File Structure Requirements

### Game Object Triplets
Custom game objects require three files with matching base names:
- `.ts`: TypeScript class definition with game logic
- `.obj.json`: Serialized initial component values
- `.loaded.ts`: Loading logic and initialization

### Component Files
- Component implementation: `ComponentName.ts`
- Component tests: `ComponentName.spec.ts`
- Registration in `index.ts`

## Development Guidelines

### Component Design
- Components should be data-focused, minimal logic
- Use composition over inheritance
- Implement clean JSON serialization
- Include comprehensive type definitions

### Game Object Design
- Separate data (components) from behavior (methods)
- Use dependency injection for component access
- Follow single responsibility principle
- Test both individual components and composed objects

### Scene Management
- Keep scenes focused and manageable
- Use consistent naming conventions
- Leverage JSON for data-driven design
- Test scene loading and object creation

### Input Handling
- Implement device-agnostic interfaces
- Support both polling and event-driven patterns
- Consider performance for real-time input
- Provide clear input state APIs

## Testing Strategy
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component composition and interaction
- **Scene Tests**: Full scene loading and object creation
- **Input Tests**: Device simulation and response validation

## Performance Considerations
- Component pooling for frequently created/destroyed objects
- Efficient scene traversal and culling
- Minimal garbage collection during gameplay
- Optimized asset loading and caching

## Extension Points
- **Custom Components**: Extend `GameComponent` for new data types
- **Input Devices**: Add new device modules to `InputDevices/`
- **Utilities**: Create reusable helper functions in `Utils/`
- **Game Objects**: Build complex behaviors with component composition