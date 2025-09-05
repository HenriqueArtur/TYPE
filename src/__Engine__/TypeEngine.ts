import { EntityEngine, EventEngine, PhysicsEngine, RenderEngine, TimeEngine } from "./Engines";
import type { PhysicsEngineOptions } from "./Engines/Physics/PhysicsEngine";
import type { RenderEngineOptions } from "./Engines/Render/RenderEngine";
import { SceneEngine } from "./Engines/Scene/SceneEngine";
import type { System } from "./Systems/System";

export interface TypeEngineOptions {
  projectPath: string;
  Render: Omit<RenderEngineOptions, "engine" | "EventEngine">;
  Physics?: Omit<PhysicsEngineOptions, "engine" | "EventEngine">;
  systemsList: System<TypeEngine>[];
}

/**
 * TypeEngine - Entity Component System (ECS) architecture implementation
 *
 * The main engine class that manages systems and coordinates between different engine components.
 * Uses dependency injection for better testability and modularity.
 */
export class TypeEngine {
  readonly projectPath: string;
  readonly EventEngine: EventEngine;
  readonly EntityEngine: EntityEngine;
  readonly PhysicsEngine: PhysicsEngine;
  readonly SceneEngine: SceneEngine;
  readonly TimeEngine: TimeEngine;
  readonly RenderEngine: RenderEngine;
  private systems: System<TypeEngine>[];
  private isRunning = false;
  private updateAddedToTimeEngine = false;

  constructor({ Render, Physics, systemsList, projectPath }: TypeEngineOptions) {
    this.projectPath = projectPath;
    this.EventEngine = new EventEngine();
    this.EntityEngine = new EntityEngine({ EventEngine: this.EventEngine });
    this.PhysicsEngine = new PhysicsEngine({
      engine: this,
      EventEngine: this.EventEngine,
      ...Physics,
    });
    this.SceneEngine = new SceneEngine({ engine: this });
    this.RenderEngine = new RenderEngine({
      engine: this,
      EventEngine: this.EventEngine,
      ...Render,
    });
    this.TimeEngine = new TimeEngine();
    this.systems = systemsList;
  }

  async setup() {
    await this.PhysicsEngine.setup();
    await this.RenderEngine.setup();
    await this.SceneEngine.setup();
    await this.SceneEngine.transition("Initial");
    await this.setupSystems();
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
