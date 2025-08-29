import type { EntityEngine, RenderEngine } from "./Engines";
import type { EventBus } from "./EventBus";
import { RenderPixiSystem } from "./Systems";
import type { System } from "./Systems/System";

export interface TypeEngineOptions {
  renderEngine: RenderEngine;
  entityEngine: EntityEngine;
  eventBus: EventBus;
}

/**
 * TypeEngine - Entity Component System (ECS) architecture implementation
 *
 * The main engine class that manages systems and coordinates between different engine components.
 * Uses dependency injection for better testability and modularity.
 */
export class TypeEngine {
  private systems: Array<System<TypeEngine>>;
  private isRunning: boolean;
  private eventBus: EventBus;
  private Render: RenderEngine;
  private Entity: EntityEngine;
  private DefaultSystems = {
    Render: new RenderPixiSystem(),
  };

  constructor(options: TypeEngineOptions) {
    this.Render = options.renderEngine;
    this.Entity = options.entityEngine;
    this.eventBus = options.eventBus;
    this.isRunning = false;
    this.systems = [];
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
  // ENTITY MANAGEMENT (DELEGATED)
  // ========================================

  /**
   * Creates a new entity with optional custom ID
   * @param id - Optional custom entity ID, auto-generates with "ENT_" prefix if not provided
   * @returns The entity ID
   */
  createEntity(id?: string): string {
    return this.Entity.createEntity(id);
  }

  /**
   * Removes an entity and all its associated components
   * @param entityId - The ID of the entity to remove
   */
  removeEntity(entityId: string): void {
    this.Entity.removeEntity(entityId);
  }

  // ========================================
  // COMPONENT REGISTRATION (DELEGATED)
  // ========================================

  /**
   * Registers a new component type with the engine
   * @param name - The name of the component type
   * @param func - The factory function for creating component instances
   * @returns This TypeEngine instance for method chaining
   */
  registerComponent(name: string, func: (...args: unknown[]) => unknown): this {
    this.Entity.registerComponent(name, func);
    return this;
  }

  /**
   * Gets a list of all registered component names
   * @returns Array of registered component names
   */
  getRegisteredComponents(): string[] {
    return this.Entity.getRegisteredComponents();
  }

  // ========================================
  // COMPONENT MANAGEMENT (DELEGATED)
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
    this.Entity.addComponent(entityId, componentName, componentData);
  }

  /**
   * Gets a component from an entity
   * @template T - The expected type of the component data
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns The component data or undefined if not found
   */
  getComponent<T>(entityId: string, componentName: string): T | undefined {
    return this.Entity.getComponent<T>(entityId, componentName);
  }

  /**
   * Checks if an entity has a specific component
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   * @returns True if the entity has the component, false otherwise
   */
  hasComponent(entityId: string, componentName: string): boolean {
    return this.Entity.hasComponent(entityId, componentName);
  }

  /**
   * Removes a component from an entity
   * @param entityId - The ID of the entity
   * @param componentName - The name of the component type
   */
  removeComponent(entityId: string, componentName: string): void {
    this.Entity.removeComponent(entityId, componentName);
  }

  // ========================================
  // SYSTEM MANAGEMENT
  // ========================================

  async initDefaultSystems() {
    await this.DefaultSystems.Render.init(this, this.Render);
  }

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
  // ENTITY QUERYING (DELEGATED)
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
    return this.Entity.queryEntities<T>(componentNames);
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
    return this.Entity.queryEntitiesWithAny<T>(componentNames);
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
