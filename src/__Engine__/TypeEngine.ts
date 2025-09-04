import type { EntityEngine, EventEngine, PhysicsEngine, RenderEngine, TimeEngine } from "./Engines";
import type { SceneEngine } from "./Engines/Scene/SceneEngine";
import type { SceneName } from "./Engines/Scene/SceneManageSerialized";
import type { System } from "./Systems/System";

export interface TypeEngineOptions {
  renderEngine: RenderEngine;
  entityEngine: EntityEngine;
  eventEngine: EventEngine;
  physicsEngine: PhysicsEngine;
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
  readonly EventEngine: EventEngine;
  readonly EntityEngine: EntityEngine;
  readonly PhysicsEngine: PhysicsEngine;
  readonly SceneEngine: SceneEngine;
  readonly TimeEngine: TimeEngine;
  readonly RenderEngine: RenderEngine;
  private systems: System<TypeEngine>[];
  private isRunning = false;
  private updateAddedToTimeEngine = false;

  constructor(options: TypeEngineOptions) {
    this.EntityEngine = options.entityEngine;
    this.EventEngine = options.eventEngine;
    this.PhysicsEngine = options.physicsEngine;
    this.SceneEngine = options.sceneEngine;
    this.TimeEngine = options.timeEngine;
    this.RenderEngine = options.renderEngine;
    this.systems = options.systemsList;
  }

  async setup() {
    await this.RenderEngine.start();
    await this.PhysicsEngine.setup(this);
    await this.transition("Initial");
    await this.setupSystems();
  }

  // ========================================
  // SCENE MANAGEMENT (DELEGATED)
  // ========================================

  /**
   * Transitions to a new scene
   * @param sceneName - The name of the scene to transition to
   * @throws Error if the scene doesn't exist
   */
  async transition(sceneName: SceneName): Promise<void> {
    await this.SceneEngine.transition(sceneName, this);
    await this.RenderEngine.loadAllSprites(this);
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
  }

  async setupSystems() {
    for (const system of this.systems) {
      await system.init(this);
    }
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
  // ENGINE LIFECYCLE
  // ========================================

  /**
   * Starts the engine and time engine, enabling system updates
   * Automatically adds the update method to TimeEngine if not already added
   */
  start(): void {
    this.isRunning = true;
    if (!this.updateAddedToTimeEngine) {
      this.TimeEngine.add(this.update.bind(this));
      this.updateAddedToTimeEngine = true;
    }
    this.TimeEngine.start();
  }

  /**
   * Stops the engine and time engine, disabling system updates
   */
  stop(): void {
    this.isRunning = false;
    this.TimeEngine.stop();
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
    this.EventEngine.emit("engine:update:start", deltaTime);
    this.EventEngine.processEvents();
    for (const system of this.systems) {
      if (system.enabled) {
        this.EventEngine.emit("system:update:start", system, deltaTime);
        system.update(this, deltaTime);
        this.EventEngine.emit("system:update:end", system, deltaTime);
      }
    }
    this.EventEngine.processEvents();
    this.EventEngine.emit("engine:update:end", deltaTime);
    this.EventEngine.processEvents();
  }
}
