# Architecture Overview

The Type Game Engine implements a sophisticated **multi-engine architecture** with Entity Component System (ECS) design patterns. This page provides a comprehensive overview of the engine's architectural decisions and design patterns.

## TypeEngine - Central Coordinator

The TypeEngine serves as the main coordinator that manages all sub-engines through dependency injection:

```mermaid
graph TB
    subgraph "TypeEngine - Main Coordinator"
        TE["🎛️ TypeEngine<br/>• Engine lifecycle<br/>• Scene coordination<br/>• Update loop<br/>• Dependency injection"]
    end
    
    subgraph "Sub-Engines"
        EE["👥 EntityEngine<br/>• Entity management<br/>• Component registration<br/>• Entity lifecycle"]
        RE["🖼️ RenderEngine<br/>• Sprite management<br/>• PIXI.js coordination<br/>• Visual rendering"]
        PE["⚡ PhysicsEngine<br/>• Matter.js integration<br/>• Body management<br/>• Physics simulation"]
        ScE["🎬 SceneEngine<br/>• Scene loading<br/>• Scene transitions<br/>• Asset coordination"]
        SysE["⚙️ SystemEngine<br/>• System management<br/>• Update coordination<br/>• System lifecycle"]
        EvE["📡 EventEngine<br/>• Event dispatching<br/>• Inter-engine communication<br/>• Event queuing"]
        TiE["⏰ TimeEngine<br/>• Frame timing<br/>• Delta calculation<br/>• Update scheduling"]
    end
    
    TE --> EE
    TE --> RE
    TE --> PE
    TE --> ScE
    TE --> SysE
    TE --> EvE
    TE --> TiE
```

## Data Flow Architecture

The engine follows a clear data flow pattern that ensures separation of concerns:

```mermaid
sequenceDiagram
    participant Project as 📁 __Project__ Files
    participant TypeEngine as 🎛️ TypeEngine
    participant Systems as ⚙️ Systems
    participant Components as 🔧 Components
    
    Project->>TypeEngine: Load game data
    TypeEngine->>Systems: Initialize systems
    Systems->>Components: Process components
    
    loop Game Loop
        TypeEngine->>Systems: Update (deltaTime)
        Systems->>Components: Transform data
        Components->>TypeEngine: State changes
    end
```

## ECS Architecture

The Entity Component System is built with three core layers:

```mermaid
graph TB
    subgraph "Systems Layer"
        RS["🎨 RenderPixiSystem<br/>• Sprite rendering<br/>• Visual updates"]
        PS["🏃 PhysicsSystem<br/>• Physics updates<br/>• Collision detection"]
        MS["🖱️ MouseSystem<br/>• Input handling<br/>• Mouse events"]
    end
    
    subgraph "Components Layer"
        DC["🖼️ Drawable Components<br/>• SpriteComponent"]
        PC["⚡ Physics Components<br/>• RigidBodyRectangle<br/>• ColliderRectangle<br/>• SensorRectangle"]
        IC["🎯 Input Components<br/>• MouseComponent"]
    end
    
    subgraph "Entities Layer"
        E["🎮 Game Entities<br/>• Composition of components<br/>• Unique identifiers<br/>• Lifecycle management"]
    end
    
    RS --> DC
    PS --> PC
    MS --> IC
    DC --> E
    PC --> E
    IC --> E
```

## Design Principles

### 1. Separation of Concerns
Each sub-engine has a single, well-defined responsibility:
- **RenderEngine**: Only handles visual rendering
- **PhysicsEngine**: Only manages physics simulation
- **EntityEngine**: Only manages entities and components

### 2. Dependency Injection
All sub-engines receive their dependencies through constructors, enabling:
- Easy testing with mocks
- Flexible configuration
- Clear dependency relationships

### 3. Event-Driven Communication
Sub-engines communicate through the EventEngine, providing:
- Loose coupling between components
- Extensible communication patterns
- Easy debugging and monitoring

### 4. Modular Systems
Game logic is implemented through systems that:
- Operate on specific component types
- Have configurable priorities
- Can be enabled/disabled dynamically

## Performance Considerations

### ECS Optimization
- **Component Locality**: Components are stored efficiently for cache performance
- **System Priorities**: Systems execute in optimal order
- **Batch Operations**: Multiple entities processed together

### Rendering Performance
- **Sprite Batching**: PIXI.js handles sprite batching automatically
- **Culling**: Off-screen sprites are culled from rendering
- **Asset Management**: Efficient texture loading and caching

### Physics Performance  
- **Spatial Partitioning**: Matter.js uses efficient collision detection
- **Sleep States**: Inactive bodies are automatically optimized
- **Update Scheduling**: Physics updates run at optimal frequency

---

::: tip Architecture Benefits
This multi-engine approach provides excellent **modularity**, **testability**, and **performance** while maintaining clear separation of concerns throughout the codebase.
:::

::: info Next Steps
Learn more about specific engines:
- [TypeEngine Details](/architecture/type-engine)
- [Sub-Engines](/architecture/sub-engines) 
- [ECS Implementation](/architecture/ecs)
:::