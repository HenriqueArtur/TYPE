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
  private _filePath: string;
  private _systemsEnabled: string[] = [];

  private constructor(name: string, filePath: string) {
    this._name = name;
    this._filePath = filePath;
  }

  /**
   * Creates a Scene from a file path using Electron's path operations
   */
  static async fromPath(scenePath: string): Promise<Scene> {
    const parsed = await window.electronAPI.pathParse(scenePath);
    const name = parsed.name.replace(".scene", "");
    const filePath = await window.electronAPI.pathJoin(parsed.dir, `${name}.scene.json`);
    return new Scene(name, filePath);
  }

  /**
   * Gets the scene name
   */
  get name(): string {
    return this._name;
  }

  get systemsEnabled(): string[] {
    return [...this._systemsEnabled];
  }

  /**
   * Loads scene data and initializes systems and entities in the engine
   */
  async load(): Promise<{ systemsEnabled: string[]; entities: GameObjectSerialized[] }> {
    const sceneData: SceneSerialized = await window.electronAPI.readJsonFile(this._filePath);
    this._systemsEnabled = sceneData.systems;
    return {
      systemsEnabled: sceneData.systems,
      entities: this.loadGameObjects(sceneData.gameObjects),
    };
  }

  private loadGameObjects(
    gameObjects: (GameObjectSerialized | GroupGameObjectSerialized)[],
  ): GameObjectSerialized[] {
    const entities: GameObjectSerialized[] = [];
    for (const gameObjectData of gameObjects) {
      if ("list" in gameObjectData) {
        entities.push(...this.loadGameObjects(gameObjectData.list));
      } else {
        entities.push(gameObjectData);
      }
    }
    return entities;
  }
}
