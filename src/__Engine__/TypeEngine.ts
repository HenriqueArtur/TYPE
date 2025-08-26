import { EventBus } from "./EventBus";
import type { System } from "./Systems";
import { generateId } from "./Utils/id";

/**
 * TypeEngine - Entity Component System (ECS) architecture implementation
 *
 * The main engine class that manages entities, components, and systems in an ECS pattern.
 * Provides a singleton instance for global access and lifecycle management.
 */
export class TypeEngine {
  private static instance: TypeEngine | null = null;
  private entities: Map<string, Set<string>>;
  private components: Map<string, Map<string, unknown>>;
  private systems: Array<System<TypeEngine>>;
  private isRunning: boolean;
  private componentFactories: Map<string, (...args: unknown[]) => unknown>;
  private eventBus: EventBus;

  private constructor() {
    this.entities = new Map();
    this.components = new Map();
    this.systems = [];
    this.isRunning = false;
    this.componentFactories = new Map();
    this.eventBus = EventBus.getInstance();
  }

  // ========================================
  // SINGLETON MANAGEMENT
  // ========================================

  /**
   * Gets the singleton instance of TypeEngine
   * @returns The TypeEngine instance
   */
  static getInstance(): TypeEngine {
    if (!TypeEngine.instance) {
      TypeEngine.instance = new TypeEngine();
    }
    return TypeEngine.instance;
  }

  /**
   * Resets the singleton instance (primarily for testing)
   */
  static resetInstance(): void {
    TypeEngine.instance = null;
  }

  // ========================================
  // EVENT BUS ACCESS
  // ========================================

  /**
   * Gets the EventBus instance for event communication
   * @returns The EventBus instance
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  // ========================================
  // ENTITY MANAGEMENT
  // ========================================

  /**
   * Creates a new entity with optional custom ID
   * @param id - Optional custom entity ID, auto-generates with "ENT_" prefix if not provided
   * @returns The entity ID
   */
  createEntity(id?: string): string {
    const entity_id = id || generateId("ENT");
    this.entities.set(entity_id, new Set());

    // Emit entity created event
    this.eventBus.emit("entity:created", entity_id);

    return entity_id;
  }

  /**
   * Removes an entity and all its associated components
   * @param entityId - The ID of the entity to remove
   */
  removeEntity(entityId: string): void {
    if (!this.entities.has(entityId)) {
      return;
    }

    const entityComponents = this.entities.get(entityId);
    if (!entityComponents) {
      return;
    }

    // Emit entity removing event (before removal)
    this.eventBus.emit("entity:removing", entityId, Array.from(entityComponents));

    // Remove entity from all component maps
    for (const componentName of entityComponents) {
      const componentMap = this.components.get(componentName);
      if (componentMap) {
        componentMap.delete(entityId);
      }
    }

    // Remove entity from entities map
    this.entities.delete(entityId);

    // Emit entity removed event (after removal)
    this.eventBus.emit("entity:removed", entityId);
  }

  // ========================================
  // COMPONENT REGISTRATION
  // ========================================

  /**
   * Registers a new component type with the engine
   * @param name - The name of the component type
   * @param func - The factory function for creating component instances
   * @returns This TypeEngine instance for method chaining
   */
  registerComponent(name: string, func: (...args: unknown[]) => unknown): this {
    this.componentFactories.set(name, func);
    this.components.set(name, new Map());
    return this;
  }

  /**
   * Gets a list of all registered component names
   * @returns Array of registered component names
   */
  getRegisteredComponents(): string[] {
    return Array.from(this.componentFactories.keys());
  }

  // ========================================
  // COMPONENT MANAGEMENT
  // ========================================

  /**
   * Adds a component to an entity
   * @template T - The type of the component data
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @param componentData - The component data
   * @throws Error if entity doesn't exist or component type isn't registered
   */
  addComponent<T>(entityId: string, componentName: string, componentData: T): void {
    if (!this.entities.has(entityId)) {
      throw new Error(`Entity with ID ${entityId} does not exist`);
    }

    if (!this.components.has(componentName)) {
      throw new Error(`Component ${componentName} is not registered`);
    }

    const componentMap = this.components.get(componentName);
    const entityComponents = this.entities.get(entityId);

    if (componentMap && entityComponents) {
      componentMap.set(entityId, componentData);
      entityComponents.add(componentName);

      // Emit component added event
      this.eventBus.emit("component:added", entityId, componentName, componentData);
    }
  }

  /**
   * Gets a component from an entity
   * @template T - The expected type of the component data
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns The component data or undefined if not found
   */
  getComponent<T>(entityId: string, componentName: string): T | undefined {
    const componentMap = this.components.get(componentName);
    if (!componentMap) {
      return undefined;
    }
    return componentMap.get(entityId) as T;
  }

  /**
   * Checks if an entity has a specific component
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns True if the entity has the component, false otherwise
   */
  hasComponent(entityId: string, componentName: string): boolean {
    const componentMap = this.components.get(componentName);
    if (!componentMap) {
      return false;
    }
    return componentMap.has(entityId);
  }

  /**
   * Removes a component from an entity
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   */
  removeComponent(entityId: string, componentName: string): void {
    const componentMap = this.components.get(componentName);
    let componentData: unknown;

    if (componentMap) {
      componentData = componentMap.get(entityId);
      componentMap.delete(entityId);
    }

    const entityComponents = this.entities.get(entityId);
    if (entityComponents) {
      entityComponents.delete(componentName);
    }

    // Emit component removed event
    if (componentData !== undefined) {
      this.eventBus.emit("component:removed", entityId, componentName, componentData);
    }
  }

  // ========================================
  // SYSTEM MANAGEMENT
  // ========================================

  /**
   * Adds a system to the engine and sorts systems by priority
   * @param system - The system to add
   */
  addSystem(system: System<TypeEngine>): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
    system.init(this);
  }

  /**
   * Removes a system from the engine
   * @param system - The system to remove
   */
  removeSystem(system: System<TypeEngine>): void {
    const index = this.systems.indexOf(system);
    if (index > -1) {
      if (system.destroy) {
        system.destroy(this);
      }
      this.systems.splice(index, 1);
    }
  }

  /**
   * Toggles the enabled state of a system
   * @param system - The system to toggle
   */
  systemToggle(system: System<TypeEngine>): void {
    const foundSystem = this.systems.find((s) => s === system);
    if (foundSystem) {
      foundSystem.enabled = !foundSystem.enabled;
    }
  }

  // ========================================
  // ENTITY QUERYING
  // ========================================

  /**
   * Queries entities that have ALL specified components
   * @template T - The expected shape of the component data
   * @param componentNames - Array of component names to match
   * @returns Array of entities with their component data
   */
  queryEntities<T extends Record<string, unknown>>(
    componentNames: string[],
  ): Array<{ entityId: string; components: T }> {
    const result: Array<{ entityId: string; components: T }> = [];

    for (const [entityId, entityComponents] of this.entities) {
      const hasAllComponents = componentNames.every((componentName) =>
        entityComponents.has(componentName),
      );

      if (hasAllComponents) {
        const components: Record<string, unknown> = {};
        for (const componentName of componentNames) {
          components[componentName] = this.getComponent(entityId, componentName);
        }
        result.push({ entityId, components: components as T });
      }
    }

    return result;
  }

  /**
   * Queries entities that have ANY of the specified components
   * @template T - The expected shape of the component data
   * @param componentNames - Array of component names to match
   * @returns Array of entities with their component data
   */
  queryEntitiesWithAny<T extends Record<string, unknown>>(
    componentNames: string[],
  ): Array<{ entityId: string; components: T }> {
    const result: Array<{ entityId: string; components: T }> = [];

    for (const [entityId, entityComponents] of this.entities) {
      const hasAnyComponent = componentNames.some((componentName) =>
        entityComponents.has(componentName),
      );

      if (hasAnyComponent) {
        const components: Record<string, unknown> = {};
        for (const componentName of componentNames) {
          if (entityComponents.has(componentName)) {
            components[componentName] = this.getComponent(entityId, componentName);
          }
        }
        result.push({ entityId, components: components as T });
      }
    }

    return result;
  }

  // ========================================
  // ENGINE LIFECYCLE
  // ========================================

  /**
   * Starts the engine, enabling system updates
   */
  start(): void {
    this.isRunning = true;
  }

  /**
   * Stops the engine, disabling system updates
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Updates all enabled systems if the engine is running
   * Processes queued events before and after system updates
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  update(deltaTime: number): void {
    if (!this.isRunning) {
      return;
    }

    // Emit engine update start event
    this.eventBus.emit("engine:update:start", deltaTime);

    // Process any queued events before system updates
    this.eventBus.processEvents();

    // Update all enabled systems
    for (const system of this.systems) {
      if (system.enabled) {
        // Emit system update start event
        this.eventBus.emit("system:update:start", system, deltaTime);

        system.update(this, deltaTime);

        // Emit system update end event
        this.eventBus.emit("system:update:end", system, deltaTime);
      }
    }

    // Process any events that were queued during system updates
    this.eventBus.processEvents();

    // Emit engine update end event
    this.eventBus.emit("engine:update:end", deltaTime);
  }
}
