import type { TypeEngine } from "../../TypeEngine";
import { Scene } from "./Scene";
import type { SceneManageSerialized, SceneName } from "./SceneManageSerialized";

/**
 * SceneEngine - Manages scene transitions and scene state
 *
 * Handles loading and switching between different game scenes.
 */
export class SceneEngine {
  private scenes: Map<SceneName, string>;
  private currentScene: Scene | null = null;

  constructor(sceneManageData: SceneManageSerialized) {
    this.scenes = new Map(Object.entries(sceneManageData.scenes));

    // Set initial scene as current scene
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
  async transition(sceneName: SceneName, engine: TypeEngine): Promise<void> {
    if (!this.has(sceneName)) {
      throw new Error(`Scene "${sceneName}" does not exist`);
    }

    const scenePath = this.scenes.get(sceneName);
    if (!scenePath) {
      throw new Error(`Scene path not found for "${sceneName}"`);
    }
    const scene = await Scene.fromPath(scenePath);

    this.currentScene = scene;
    await scene.load(engine);
  }

  /**
   * Gets the current active scene
   * @returns The current Scene instance or null if no scene is active
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }
}
