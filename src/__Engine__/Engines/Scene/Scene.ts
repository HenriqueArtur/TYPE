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
}
