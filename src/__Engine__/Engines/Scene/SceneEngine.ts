import type { TypeEngine } from "../../TypeEngine";
import { Scene } from "./Scene";
import type { SceneManageSerialized, SceneName } from "./SceneManageSerialized";

export interface SceneEngineOptions {
  engine: TypeEngine;
}

/**
 * SceneEngine - Manages scene transitions and scene state
 *
 * Handles loading and switching between different game scenes.
 */
export class SceneEngine {
  private engine: TypeEngine;
  private scenes: Map<SceneName, string> = new Map();
  private currentScene: Scene | null = null;

  constructor({ engine }: SceneEngineOptions) {
    this.engine = engine;
  }

  async setup() {
    const path = `${this.engine.projectPath}/scenes.manage.json`;
    const sceneManageData: SceneManageSerialized = await window.electronAPI.readJsonFile(path);
    this.scenes = new Map(Object.entries(sceneManageData.scenes));

    const initialScenePath = sceneManageData.scenes[sceneManageData.initialScene];
    if (initialScenePath) {
      Scene.fromPath(initialScenePath).then((scene) => {
        this.currentScene = scene;
      });
    }
  }

  /**
   * Checks if a scene exists in the scene registry
   * @param sceneName - The name of the scene to check
   * @returns True if the scene exists, false otherwise
   */
  has(sceneName: SceneName): boolean {
    return this.scenes.has(sceneName);
  }

  /**
   * Transitions to a new scene
   * @param sceneName - The name of the scene to transition to
   * @param engine - The TypeEngine instance to load the scene into
   * @throws Error if the scene doesn't exist
   */
  async transition(sceneName: SceneName): Promise<void> {
    if (!this.has(sceneName)) {
      throw new Error(`Scene "${sceneName}" does not exist`);
    }

    const scenePath = this.scenes.get(sceneName);
    if (!scenePath) {
      throw new Error(`Scene path not found for "${sceneName}"`);
    }
    this.engine.PhysicsEngine.clear();
    this.engine.RenderEngine.clear();

    const scene = await Scene.fromPath(scenePath);
    this.currentScene = scene;
    await scene.load(this.engine);
  }

  /**
   * Gets the current active scene
   * @returns The current Scene instance or null if no scene is active
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }
}
