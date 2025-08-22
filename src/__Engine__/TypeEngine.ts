import type { RectangularBodyComponent } from "./Component/Body/RectangularBodyComponent";
import type { GameObject } from "./GameObject";
import type { Mouse } from "./InputDevices/Mouse";
import { PhysicsWorldManager } from "./Physics";
import { RenderEngine } from "./Render";
import type { GameScene } from "./Scene";

export class TypeEngine {
  private static instance: TypeEngine | null = null;
  private currentScene: GameScene | null = null;
  private renderEngine: RenderEngine;
  private physicsWorldManager: PhysicsWorldManager;
  private gameLoopId: number | null = null;
  private lastTime: number = 0;

  private constructor() {
    // Private constructor to prevent direct instantiation
    this.renderEngine = new RenderEngine();
    this.physicsWorldManager = new PhysicsWorldManager();
  }

  static getInstance(): TypeEngine {
    if (!TypeEngine.instance) {
      TypeEngine.instance = new TypeEngine();
    }
    return TypeEngine.instance;
  }

  static resetInstance(): void {
    TypeEngine.instance = null;
  }

  loadScene(scene: GameScene): void {
    this.currentScene = scene;

    // Clear previous render data
    this.renderEngine.destroy();
    this.renderEngine = new RenderEngine();

    // Clear and reinitialize physics
    this.physicsWorldManager = new PhysicsWorldManager();

    // Add all sprites to render engine
    scene.components.sprites.forEach((sprite) => {
      this.renderEngine.addSprite(sprite);
    });

    // Add all bodies to physics world
    scene.components.bodies.forEach((body) => {
      this.physicsWorldManager.addBodyComponent(body);
    });
  }

  getCurrentScene(): GameScene | null {
    return this.currentScene;
  }

  getPhysicsManager(): PhysicsWorldManager {
    return this.physicsWorldManager;
  }

  getRenderEngine(): RenderEngine {
    return this.renderEngine;
  }

  update(deltaTime: number): void {
    if (this.currentScene) {
      // Update physics world
      this.physicsWorldManager.update(deltaTime);

      // Update scene (collision detection and game object management)
      const bodiesToRemove = this.currentScene.update(deltaTime);

      // Remove destroyed bodies from physics world
      if (bodiesToRemove) {
        bodiesToRemove.forEach((body) => {
          this.physicsWorldManager.removeBodyComponent(body);
        });
      }
    }
  }

  removeBodyFromPhysics(body: RectangularBodyComponent): void {
    this.physicsWorldManager.removeBodyComponent(body);
  }

  startGameLoop(updateCallback?: (deltaTime: number) => void, mouse?: Mouse): void {
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      if (this.currentScene) {
        // Update all game objects
        this.currentScene.gameObjects.forEach((gameObject: GameObject) => {
          gameObject.update({ deltaTime, mouse: mouse || { position: { x: 0, y: 0 } } });
        });

        // Update scene (includes physics world and collision detection)
        this.update(deltaTime);
      }

      // Call optional update callback
      if (updateCallback) {
        updateCallback(deltaTime);
      }

      // Continue the game loop
      this.gameLoopId = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    this.gameLoopId = requestAnimationFrame(gameLoop);
  }

  stopGameLoop(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  destroy(): void {
    this.stopGameLoop();
    this.renderEngine.destroy();
    this.currentScene = null;
  }
}
