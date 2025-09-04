import type { System } from "../../Systems/System";
import type { TypeEngine } from "../../TypeEngine";
import type {
  GameObjectSerialized,
  GroupGameObjectSerialized,
} from "../Entity/GameObjectSerialized";
import type { SceneSerialized } from "./SceneSerialized";

/**
 * Scene - Represents a game scene with a name and file path
 *
 * File path follows the convention: <path>/<scene_name>.scene.json
 */
export class Scene {
  private _name: string;
  private _path: string;
  private _filePath: string;

  private constructor(name: string, path: string, filePath: string) {
    this._name = name;
    this._path = path;
    this._filePath = filePath;
  }

  /**
   * Creates a Scene from a file path using Electron's path operations
   */
  static async fromPath(scenePath: string): Promise<Scene> {
    const parsed = await window.electronAPI.pathParse(scenePath);
    const name = parsed.name.replace(".scene", "");
    const filePath = await window.electronAPI.pathJoin(parsed.dir, `${name}.scene.json`);

    return new Scene(name, parsed.dir, filePath);
  }

  /**
   * Gets the scene name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Gets the scene path (directory path)
   */
  get path(): string {
    return this._path;
  }

  /**
   * Gets the full file path for the scene file
   * Format: <path>/<scene_name>.scene.json
   */
  get filePath(): string {
    return this._filePath;
  }

  /**
   * Loads scene data and initializes systems and entities in the engine
   * @param engine - The TypeEngine instance to load scene data into
   */
  async load(engine: TypeEngine): Promise<void> {
    const sceneData: SceneSerialized = await window.electronAPI.readJsonFile(this._filePath);
    await this.loadSystems(engine, sceneData.systems);
    await this.loadGameObjects(engine, sceneData.gameObjects);
  }

  private async loadSystems(engine: TypeEngine, systems: Record<string, string>): Promise<void> {
    for (const [systemName, systemPath] of Object.entries(systems)) {
      try {
        const systemModule = await import(systemPath);
        const SystemClass = systemModule.default || systemModule[systemName];

        if (SystemClass) {
          const systemInstance: System<TypeEngine> = new SystemClass();
          engine.addSystem(systemInstance);
        }
      } catch (error) {
        console.warn(`Failed to load system ${systemName} from ${systemPath}:`, error);
      }
    }
  }

  private async loadGameObjects(
    engine: TypeEngine,
    gameObjects: (GameObjectSerialized | GroupGameObjectSerialized)[],
  ): Promise<void> {
    for (const gameObjectData of gameObjects) {
      if ("list" in gameObjectData) {
        await this.loadGameObjects(engine, gameObjectData.list);
      } else {
        await this.loadGameObject(engine, gameObjectData);
      }
    }
  }

  private async loadGameObject(
    engine: TypeEngine,
    gameObjectData: GameObjectSerialized,
  ): Promise<void> {
    const entityId = engine.EntityEngine.createEntity();
    for (const componentData of gameObjectData.components) {
      engine.EntityEngine.addComponent(entityId, componentData.name, componentData.data);
    }
  }
}
