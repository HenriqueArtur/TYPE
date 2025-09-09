# Components

Components are the building blocks of game entities in TYPE Game Engine. They follow the Entity-Component-System (ECS) architecture pattern, where components store only data for game objects. All behavior and logic is handled by [Systems](/systems), which operate on the component data.

## Component Types

TYPE Game Engine provides several categories of components:

### Drawable Components
Visual components that handle rendering and display:
- **[Sprite Component](/components/drawable/sprite)** - Renders textures and images

### Physics Components  
Physics simulation components using Matter.js:
- **[Collider Rectangle Component](/components/physics/collider-rectangle)** - Static collision bodies
- **[Rigid Body Rectangle Component](/components/physics/rigid-body-rectangle)** - Dynamic physics bodies
- **[Sensor Rectangle Component](/components/physics/sensor-rectangle)** - Trigger detection areas

### Input Components
Components that handle user input:
- **[Mouse Component](/components/input/mouse)** - Mouse input handling

## Component Architecture

Components in TYPE are pure data containers with no behavior. The actual component is the `ComponentType`, which contains the data properties that [Systems](/systems) read and modify.

### Component Structure
- **ComponentType**: The actual component containing data properties
- **ComponentData Interface**: Defines the input structure for creating components
- **ComponentInstanceManage**: Runtime utility for serialization and deserialization during game development

### Component Instance Manager
The `ComponentInstanceManage` is used by the engine during development for:
- Creating components from data
- Serializing components to JSON files
- Deserializing components from saved data

```typescript
export const COMPONENT_NAME: ComponentInstanceManage<
  "ComponentName",
  ComponentDataInterface,
  ComponentType
> = {
  name: "ComponentName",
  create: (data: ComponentDataInterface): ComponentType => {
    // Component creation logic with default values
  },
  serialize: (component: ComponentType): ComponentSerialized => {
    // Serialization logic for saving/loading
  }
}
```

### Data-Only Design
Components contain only data properties:
- Position, rotation, scale values
- Configuration settings
- State information
- Resource references (textures, sounds)

All logic and behavior is implemented in [Systems](/systems) that process component data.

### Default Values
All components provide sensible default values for optional properties, making them easy to use with minimal configuration.

## Creating Custom Components

To create custom components in your game project:

### 1. Create Component File
Create a TypeScript file in your project folder following the naming pattern:
```
<ComponentNameInPascalCase>.component.ts
```

Example: `PlayerHealthComponent.component.ts`

### 2. Component Implementation
Export an object that follows the `ComponentInstanceManage` interface:

```typescript
// PlayerHealthComponent.component.ts
import type { ComponentInstanceManage, ComponentSerialized } from "path/to/ComponentInstanceManage";

export interface PlayerHealthComponentData {
  maxHealth: number;
  currentHealth?: number;
  regenerationRate?: number;
}

export type PlayerHealthComponent = Required<PlayerHealthComponentData>;

export const PLAYER_HEALTH_COMPONENT: ComponentInstanceManage<
  "PlayerHealthComponent",
  PlayerHealthComponentData,
  PlayerHealthComponent
> = {
  name: "PlayerHealthComponent",
  create: (data: PlayerHealthComponentData): PlayerHealthComponent => ({
    maxHealth: data.maxHealth,
    currentHealth: data.currentHealth ?? data.maxHealth,
    regenerationRate: data.regenerationRate ?? 0
  }),
  serialize: (component: PlayerHealthComponent): ComponentSerialized<
    "PlayerHealthComponent", 
    PlayerHealthComponentData
  > => ({
    name: "PlayerHealthComponent",
    data: {
      maxHealth: component.maxHealth,
      currentHealth: component.currentHealth,
      regenerationRate: component.regenerationRate
    }
  })
};
```

### 3. Register in component.manage.json
Add your component to the `component.manage.json` file with the component name and relative path (using `.js` extension):

```json
{
  "PlayerHealthComponent": "./PlayerHealthComponent.component.js"
}
```

::: warning
Use `.js` extension in the registration file, even though your source file is `.ts`. This is because the build system compiles TypeScript to JavaScript.
:::

### 4. Component Structure Requirements
Your custom component must include:
- **Data Interface**: Input data structure with optional properties having `?`
- **Component Type**: Runtime component type (usually `Required<DataInterface>`)
- **ComponentInstanceManage**: Object with `name`, `create`, and `serialize` methods

## Usage

Components are attached to game objects during creation or runtime. Each component serves as a data container that [Systems](/systems) operate on to create game behaviors and functionality.

See the individual component documentation for detailed usage examples and property options.