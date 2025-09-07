import {
  EntityEngine,
  EventEngine,
  PhysicsEngine,
  RenderEngine,
  SystemEngine,
  TimeEngine,
} from "./Engines";
import type { PhysicsEngineOptions } from "./Engines/Physics/PhysicsEngine";
import type { RenderEngineOptions } from "./Engines/Render/RenderEngine";
import { SceneEngine } from "./Engines/Scene/SceneEngine";

export interface TypeEngineOptions {
  projectPath: string;
  Render: Omit<RenderEngineOptions, "engine" | "EventEngine">;
  Physics?: Omit<PhysicsEngineOptions, "engine" | "EventEngine">;
}

/**
 * TypeEngine - Entity Component System (ECS) architecture implementation
 *
 * The main engine class that manages systems and coordinates between different engine components.
 * Uses dependency injection for better testability and modularity.
 */
export class TypeEngine {
  // ** DATA ** //
  readonly projectPath: string;
  private isRunning = false;
  private updateAddedToTimeEngine = false;

  // ** ENGINES ** //
  readonly EventEngine: EventEngine;
  readonly EntityEngine: EntityEngine;
  readonly PhysicsEngine: PhysicsEngine;
  readonly SceneEngine: SceneEngine;
  readonly SystemEngine: SystemEngine;
  readonly TimeEngine: TimeEngine;
  readonly RenderEngine: RenderEngine;

  constructor({ Render, Physics, projectPath }: TypeEngineOptions) {
    this.projectPath = projectPath;
    this.EventEngine = new EventEngine();
    this.EntityEngine = new EntityEngine({ EventEngine: this.EventEngine });
    this.PhysicsEngine = new PhysicsEngine({
      engine: this,
      EventEngine: this.EventEngine,
      ...Physics,
    });
    this.SceneEngine = new SceneEngine({ engine: this });
    this.SystemEngine = new SystemEngine({
      projectPath,
      EventEngine: this.EventEngine,
      engine: this,
    });
    this.RenderEngine = new RenderEngine({
      engine: this,
      EventEngine: this.EventEngine,
      ...Render,
    });
    this.TimeEngine = new TimeEngine();
  }

  async setup() {
    await this.PhysicsEngine.setup();
    await this.RenderEngine.setup();
    await this.SystemEngine.setup();
    const { systemsEnabled, entities } = await this.SceneEngine.setup();
    this.SystemEngine.setupScene(systemsEnabled);
    this.EntityEngine.setupScene(entities);
    this.RenderEngine.setupScene();
    this.PhysicsEngine.setupScene();
  }

  async transitionScene(sceneName: string) {
    this.PhysicsEngine.clear();
    this.RenderEngine.clear();
    this.EntityEngine.clear();
    this.SystemEngine.clear();
    const { systemsEnabled, entities } = await this.SceneEngine.transition(sceneName);
    this.SystemEngine.setupScene(systemsEnabled);
    this.EntityEngine.setupScene(entities);
    this.RenderEngine.setupScene();
    this.PhysicsEngine.setupScene();
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
    this.SystemEngine.update(deltaTime);
    this.EventEngine.processEvents();
    this.EventEngine.emit("engine:update:end", deltaTime);
    this.EventEngine.processEvents();
  }
}
