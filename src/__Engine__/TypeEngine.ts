import type { EntityEngine, EventEngine, RenderEngine, TimeEngine } from "./Engines";
import type { Scene } from "./Engines/Scene/Scene";
import type { SceneEngine } from "./Engines/Scene/SceneEngine";
import type { SceneName } from "./Engines/Scene/SceneManageSerialized";
import type { System } from "./Systems/System";

export interface TypeEngineOptions {
  renderEngine: RenderEngine;
  entityEngine: EntityEngine;
  eventEngine: EventEngine;
  sceneEngine: SceneEngine;
  timeEngine: TimeEngine;
  systemsList: System<TypeEngine>[];
}

/**
 * TypeEngine - Entity Component System (ECS) architecture implementation
 *
 * The main engine class that manages systems and coordinates between different engine components.
 * Uses dependency injection for better testability and modularity.
 */
export class TypeEngine {
  private systems: System<TypeEngine>[];
  private eventEngine: EventEngine;
  private Entity: EntityEngine;
  private sceneEngine: SceneEngine;
  private timeEngine: TimeEngine;
  private isRunning = false;
  private updateAddedToTimeEngine = false;

  constructor(options: TypeEngineOptions) {
    this.Entity = options.entityEngine;
    this.eventEngine = options.eventEngine;
    this.sceneEngine = options.sceneEngine;
    this.timeEngine = options.timeEngine;
    this.systems = options.systemsList;
  }

  // ========================================
  // EVENT BUS ACCESS
  // ========================================

  /**
   * Gets the EventEngine instance for event communication
   * @returns The EventEngine instance
   */
  getEventEngine(): EventEngine {
    return this.eventEngine;
  }

  // ========================================
  // TIME MANAGEMENT (DELEGATED)
  // ========================================

  /**
   * Adds a function to be called on each update with deltaTime
   * @param func - Function that receives deltaTime as parameter
   */
  addTimeFunction(func: (deltaTime: number) => void): void {
    this.timeEngine.add(func);
  }

  /**
   * Removes a function from the update loop
   * @param func - Function to remove
   */
  removeTimeFunction(func: (deltaTime: number) => void): void {
    this.timeEngine.remove(func);

    // Reset flag if the removed function is our update method
    if (func === this.update.bind(this)) {
      this.updateAddedToTimeEngine = false;
    }
  }

  /**
   * Adds a function to be called at fixed intervals
   * @param func - Function that receives fixed deltaTime as parameter
   */
  addFixedTimeFunction(func: (fixedDeltaTime: number) => void): void {
    this.timeEngine.addFixed(func);
  }

  /**
   * Removes a function from the fixed timestep update loop
   * @param func - Function to remove
   */
  removeFixedTimeFunction(func: (fixedDeltaTime: number) => void): void {
    this.timeEngine.removeFixed(func);
  }

  /**
   * Gets the current running state of the time engine
   * @returns True if the time engine is currently running
   */
  getTimeEngineRunning(): boolean {
    return this.timeEngine.getIsRunning();
  }

  /**
   * Gets the number of registered time functions
   * @returns Number of functions in the update loop
   */
  getTimeFunctionCount(): number {
    return this.timeEngine.getFunctionCount();
  }

  /**
   * Gets the number of registered fixed timestep functions
   * @returns Number of fixed functions in the update loop
   */
  getFixedTimeFunctionCount(): number {
    return this.timeEngine.getFixedFunctionCount();
  }

  /**
   * Gets the current fixed timestep in milliseconds
   * @returns Fixed timestep duration in milliseconds
   */
  getFixedTimeStep(): number {
    return this.timeEngine.getFixedTimeStep();
  }

  /**
   * Clears all registered time functions (both variable and fixed timestep)
   */
  clearTimeFunctions(): void {
    this.timeEngine.clear();
    this.updateAddedToTimeEngine = false;
  }

  // ========================================
  // SCENE MANAGEMENT (DELEGATED)
  // ========================================

  /**
   * Gets the current active scene
   * @returns The current Scene instance or null if no scene is active
   */
  getCurrentScene(): Scene | null {
    return this.sceneEngine.getCurrentScene();
  }

  /**
   * Transitions to a new scene
   * @param sceneName - The name of the scene to transition to
   * @throws Error if the scene doesn't exist
   */
  async transition(sceneName: SceneName): Promise<void> {
    await this.sceneEngine.transition(sceneName, this);
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

  /**
   * Adds a system to the engine and sorts systems by priority
   * @param system - The system to add
   */
  addSystem(system: System<TypeEngine>, ...opt: unknown[]): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
    system.init(this, ...opt);
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
   * Starts the engine and time engine, enabling system updates
   * Automatically adds the update method to TimeEngine if not already added
   */
  start(): void {
    this.isRunning = true;

    if (!this.updateAddedToTimeEngine) {
      this.timeEngine.add(this.update.bind(this));
      this.updateAddedToTimeEngine = true;
    }

    this.timeEngine.start();
  }

  /**
   * Stops the engine and time engine, disabling system updates
   */
  stop(): void {
    this.isRunning = false;
    this.timeEngine.stop();
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
    this.eventEngine.emit("engine:update:start", deltaTime);
    this.eventEngine.processEvents();
    for (const system of this.systems) {
      if (system.enabled) {
        this.eventEngine.emit("system:update:start", system, deltaTime);
        system.update(this, deltaTime);
        this.eventEngine.emit("system:update:end", system, deltaTime);
      }
    }
    this.eventEngine.processEvents();
    this.eventEngine.emit("engine:update:end", deltaTime);
    this.eventEngine.processEvents();
  }
}
