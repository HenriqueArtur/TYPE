import type { RectangularBodyComponent } from "./Component/Body/RectangularBodyComponent";
import type { SpriteComponent } from "./Component/SpriteComponent";
import type { GameObject } from "./GameObject";
import type { Mouse } from "./InputDevices/Mouse";
import type { PhysicsWorldManager } from "./Physics";
import { RenderEngine } from "./Render";
import type { GameScene } from "./Scene";
import { Angle } from "./Utils/Angle";

export class TypeEngine {
  private static instance: TypeEngine | null = null;
  private currentScene: GameScene | null = null;
  private renderEngine: RenderEngine;
  private spriteBodyLinks = new Map<SpriteComponent, RectangularBodyComponent>();
  private gameLoopId: number | null = null;
  private lastTime: number = 0;

  private constructor() {
    // Private constructor to prevent direct instantiation
    this.renderEngine = new RenderEngine();
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
    this.spriteBodyLinks.clear();

    // Add all sprites to render engine
    scene.components.sprites.forEach((sprite) => {
      this.renderEngine.addSprite(sprite);
    });

    // Link sprites to their corresponding bodies for render updates
    scene.gameObjects.forEach((obj) => {
      if ("sprite" in obj && "body" in obj) {
        const gameObj = obj as unknown as {
          sprite: SpriteComponent;
          body: RectangularBodyComponent;
        };
        this.spriteBodyLinks.set(gameObj.sprite, gameObj.body);
      }
    });
  }

  getCurrentScene(): GameScene | null {
    return this.currentScene;
  }

  getPhysicsManager(): PhysicsWorldManager | null {
    return this.currentScene?.physicsWorldManager ?? null;
  }

  getRenderEngine(): RenderEngine {
    return this.renderEngine;
  }

  update(deltaTime: number): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
      // Update sprite positions based on physics
      this.updateSpritePositions();
    }
  }

  private updateSpritePositions(): void {
    // Sync sprites with their linked physics bodies
    for (const [sprite, bodyComponent] of this.spriteBodyLinks) {
      const body = bodyComponent.getBody();

      // Update sprite transform to match physics body position and rotation
      sprite.transform({
        position: {
          x: body.position.x,
          y: body.position.y,
        },
        rotation: Angle.fromRadians(body.angle),
      });
    }
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
    this.spriteBodyLinks.clear();
    this.currentScene = null;
  }
}
