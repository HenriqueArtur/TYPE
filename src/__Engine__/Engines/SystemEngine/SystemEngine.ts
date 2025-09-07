import { PhysicsSystem, RenderPixiSystem } from "../../Systems";
import type { System } from "../../Systems/System";
import type { TypeEngine } from "../../TypeEngine";
import type { EventEngine } from "../Event/EventEngine";

export interface SystemEngineOptions {
  projectPath: string;
  EventEngine: import("../Event/EventEngine").EventEngine;
  engine: TypeEngine;
}

export type SystemManageSerialized = Record<string, string>;

/**
 * SystemEngine - Manages system lifecycle and execution
 *
 * Handles adding, removing, updating, and managing the lifecycle of systems
 * within the ECS architecture. Loads systems from project configuration and
 * includes default engine systems.
 */
export class SystemEngine {
  private systems: Map<string, System<TypeEngine>> = new Map();
  private systemsList: System<TypeEngine>[] = [];
  private systemsDefault: string[] = [];
  private EventEngine: EventEngine;
  private engine: TypeEngine;

  constructor({ EventEngine, engine }: SystemEngineOptions) {
    this.systems = new Map();
    this.EventEngine = EventEngine;
    this.engine = engine;
  }

  /**
   * Sets up the SystemEngine by loading system.manage.json and initializing systems
   */
  async setup(): Promise<void> {
    this.addDefaultSystems();
    await this.loadSystemsFromConfig();
    await this.setupSystems();
    this.systemsList.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Adds default systems from the engine
   */
  private addDefaultSystems(): void {
    const physicsSystem = new PhysicsSystem();
    const renderSystem = new RenderPixiSystem();

    this.add(physicsSystem.name, physicsSystem);
    this.add(renderSystem.name, renderSystem);

    this.systemsList.push(physicsSystem);
    this.systemsList.push(renderSystem);

    this.systemsDefault.push(physicsSystem.name);
    this.systemsDefault.push(renderSystem.name);
  }

  /**
   * Loads custom systems from system.manage.json
   */
  private async loadSystemsFromConfig(): Promise<void> {
    try {
      const systemManagePath = `${this.engine.projectPath}/system.manage.json`;
      const systemManageData: SystemManageSerialized =
        await window.electronAPI.readJsonFile(systemManagePath);

      for (const [systemName, systemPath] of Object.entries(systemManageData)) {
        await this.loadCustomSystem(systemName, systemPath);
      }
    } catch (error) {
      // If system.manage.json doesn't exist or fails to load, just use default systems
      console.warn(`Could not load system.manage.json: ${error}. Using default systems only.`);
    }
  }

  /**
   * Loads a custom system from a file path
   */
  private async loadCustomSystem(systemName: string, systemPath: string): Promise<void> {
    try {
      const absolute = await window.electronAPI.absolutePath(
        `${this.engine.projectPath}/${systemPath}`,
      );
      const systemModule = await import(absolute);
      const SystemModule = systemModule.default || systemModule[systemName];
      const System = new SystemModule();
      if (System) {
        this.add(systemName, System);
      }
    } catch (error) {
      console.warn(`Failed to load system ${systemName} from ${systemPath}:`, error);
    }
  }

  /**
   * Initializes all systems
   */
  private async setupSystems(): Promise<void> {
    for (const system of this.systemsList) {
      await system.init(this.engine);
    }
  }

  // ========================================
  // SYSTEM MANAGEMENT
  // ========================================

  /**
   * Adds a system to the engine and sorts systems by priority (legacy method)
   * @param system - The system to add
   */
  private add(name: string, system: System<TypeEngine>): void {
    if (!this.systems.has(name)) {
      this.systems.set(name, system);
      this.systemsList.push(system);
    }
  }

  /**
   * Toggles the enabled state of a system by name
   * @param name - The name of the system to toggle
   */
  toggle(name: string): void {
    const system = this.systems.get(name);
    if (system) {
      system.enabled = !system.enabled;
    }
  }

  /**
   * Gets a system by name
   * @param name - The name of the system
   * @returns The system or undefined if not found
   */
  getSystem(name: string): System<TypeEngine> | undefined {
    return this.systems.get(name);
  }

  /**
   * Gets all systems managed by this engine
   * @returns Array of all systems
   */
  getAll(): System<TypeEngine>[] {
    return Array.from(this.systemsList);
  }

  /**
   * Gets all enabled systems
   * @returns Array of enabled systems
   */
  getEnabled(): System<TypeEngine>[] {
    return Array.from(this.systems.values()).filter((system) => system.enabled);
  }

  /**
   * Sets up scene by enabling only specified systems
   * @param systemNames - Array of system names to enable
   */
  setupScene(systemNames: string[]): void {
    for (const systemName of systemNames) {
      const system = this.systems.get(systemName);
      if (system) {
        system.enabled = true;
      }
    }
  }

  clear() {
    const nonDefaultSystem = this.systemsList.filter((s) => !this.systemsDefault.includes(s.name));
    nonDefaultSystem.forEach((s) => {
      s.enabled = false;
    });
  }

  // ========================================
  // SYSTEM LIFECYCLE
  // ========================================

  /**
   * Updates all enabled systems
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  update(deltaTime: number): void {
    for (const system of this.systems.values()) {
      if (system.enabled) {
        this.EventEngine.emit("system:update:start", system, deltaTime);
        system.update(this.engine, deltaTime);
        this.EventEngine.emit("system:update:end", system, deltaTime);
      }
    }
  }
}
