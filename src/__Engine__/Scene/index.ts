import { createComponent, type RectangularBodyComponent, TextureComponent } from "../Component";
import type {
  SpriteComponent,
  SpriteComponentDataJson,
} from "../Component/Drawable/SpriteComponent";
import type { DrawableComponent } from "../Component/DrawableComponent";
import type { PhysicsComponent } from "../Component/PhysicsComponent";
import type { GameObject, GameObjectDataJson } from "../GameObject";
import { ConcreteGameObject } from "../GameObject/ConcreteGameObject";
import { type CollidableGameObject, CollisionManager } from "../Utils/CollisionManager";
import { generateId } from "../Utils/id";

export interface GameSceneData {
  readonly name: string;
  readonly gameObjects: GameObject[];
  readonly components: SceneComponents;
}

interface SceneData {
  name: string;
  gameObjects: GameObjectDataJson[];
}

interface SceneComponents {
  sprites: DrawableComponent[];
  bodies: PhysicsComponent[];
}

export class GameScene {
  static readonly type = "GameScene";
  static readonly prefix = "SC";
  readonly id: string;
  readonly name: string;
  readonly gameObjects: GameObject[];
  readonly components: SceneComponents;
  readonly collisionManager: CollisionManager;

  constructor(data: GameSceneData) {
    this.id = generateId(GameScene.prefix);
    this.name = data.name;
    this.gameObjects = data.gameObjects;
    this.components = data.components;
    this.collisionManager = new CollisionManager();

    // Add collidable objects to collision manager
    this.gameObjects.forEach((obj) => {
      if ("body" in obj && "destroy" in obj && typeof obj.destroy === "function") {
        this.collisionManager.addObject(obj as unknown as CollidableGameObject);
      }
    });
  }

  static async load(sceneData: string | object): Promise<GameScene> {
    const scene: SceneData = typeof sceneData === "string" ? JSON.parse(sceneData) : sceneData;
    const components: SceneComponents = {
      sprites: [],
      bodies: [],
    };
    const game_objects: GameObject[] = [];
    for (const obj of scene.gameObjects) {
      if (obj.script) {
        const constructor_args: Record<string, unknown> = {};
        for (const [_key, value] of Object.entries(obj.components)) {
          if (value.type === "SpriteComponent") {
            const texture = new TextureComponent({
              path: (value.initial_values as SpriteComponentDataJson).texture,
            });
            constructor_args.sprite = { ...value.initial_values, texture };
          } else if (value.type === "RectangularBodyComponent") {
            const component = createComponent(value) as RectangularBodyComponent;
            constructor_args.body = component;
            components.bodies.push(component);
          }
        }

        const scriptPath = `../../__Project__/${obj.script.replace(".js", ".ts")}`;
        const module = await import(scriptPath);
        const GameObjectClass = module[obj.name];
        const instance = new GameObjectClass(constructor_args);
        if (instance.sprite) {
          components.sprites.push(instance.sprite);
        }
        game_objects.push(instance);
      } else {
        const components_json = Object.entries(obj.components).map(([key, value]) => {
          const new_component = createComponent(value);
          if (new_component.type === "SpriteComponent") {
            components.sprites.push(new_component as SpriteComponent);
          } else if (new_component.type === "RectangularBodyComponent") {
            components.bodies.push(new_component as RectangularBodyComponent);
          }
          return [key, new_component];
        });
        const obj_components = Object.fromEntries(components_json);
        game_objects.push(new ConcreteGameObject(obj_components));
      }
    }
    return new GameScene({
      name: scene.name,
      gameObjects: game_objects,
      components,
    });
  }

  update(_deltaTime: number = 16.67): PhysicsComponent[] {
    // Check for collisions and handle destruction
    const destroyedObjects = this.collisionManager.checkCollisions();
    const physicsComponentsToRemove: PhysicsComponent[] = [];

    if (destroyedObjects.length > 0) {
      // Remove destroyed objects from gameObjects array
      for (const destroyedObj of destroyedObjects) {
        const index = this.gameObjects.indexOf(destroyedObj as unknown as GameObject);
        if (index > -1) {
          this.gameObjects.splice(index, 1);
        }

        // Remove sprite from components if object has one
        if ("sprite" in destroyedObj) {
          const sprite = (destroyedObj as unknown as { sprite: DrawableComponent }).sprite;
          const spriteIndex = this.components.sprites.indexOf(sprite);
          if (spriteIndex > -1) {
            this.components.sprites.splice(spriteIndex, 1);
          }
        }

        // Remove physics component from components if object has one
        if ("body" in destroyedObj) {
          const physicsComponent = (destroyedObj as unknown as { body: PhysicsComponent }).body;
          const bodyIndex = this.components.bodies.indexOf(physicsComponent);
          if (bodyIndex > -1) {
            this.components.bodies.splice(bodyIndex, 1);
            physicsComponentsToRemove.push(physicsComponent);
          }
        }
      }
    }

    return physicsComponentsToRemove;
  }

  // Game object categorization methods
  getCollidableObjects(): CollidableGameObject[] {
    return this.gameObjects.filter(
      (obj) => "body" in obj && "destroy" in obj && typeof obj.destroy === "function",
    ) as unknown as CollidableGameObject[];
  }

  getObjectsWithSprites(): GameObject[] {
    return this.gameObjects.filter((obj) => "sprite" in obj);
  }

  getObjectsWithBodies(): GameObject[] {
    return this.gameObjects.filter((obj) => "body" in obj);
  }

  getObjectsByType<T extends GameObject>(predicate: (obj: GameObject) => obj is T): T[] {
    return this.gameObjects.filter(predicate);
  }

  addGameObject(gameObject: GameObject): void {
    this.gameObjects.push(gameObject);

    // Add to collision manager if collidable
    if (
      "body" in gameObject &&
      "destroy" in gameObject &&
      typeof gameObject.destroy === "function"
    ) {
      this.collisionManager.addObject(gameObject as unknown as CollidableGameObject);
    }

    // Add drawable component if object has one
    if ("sprite" in gameObject) {
      const drawable = (gameObject as unknown as { sprite: DrawableComponent }).sprite;
      this.components.sprites.push(drawable);
    }

    // Add physics component if object has one
    if ("body" in gameObject) {
      const physicsComponent = (gameObject as unknown as { body: PhysicsComponent }).body;
      this.components.bodies.push(physicsComponent);
    }
  }

  removeGameObject(gameObject: GameObject): PhysicsComponent | null {
    const index = this.gameObjects.indexOf(gameObject);
    if (index === -1) return null;

    this.gameObjects.splice(index, 1);

    // Remove from collision manager if collidable
    if (
      "body" in gameObject &&
      "destroy" in gameObject &&
      typeof gameObject.destroy === "function"
    ) {
      this.collisionManager.removeObject(gameObject as unknown as CollidableGameObject);
    }

    // Remove drawable from components if object has one
    if ("sprite" in gameObject) {
      const drawable = (gameObject as unknown as { sprite: DrawableComponent }).sprite;
      const spriteIndex = this.components.sprites.indexOf(drawable);
      if (spriteIndex > -1) {
        this.components.sprites.splice(spriteIndex, 1);
      }
    }

    // Remove physics component from components if object has one
    let physicsComponentToRemove: PhysicsComponent | null = null;
    if ("body" in gameObject) {
      const physicsComponent = (gameObject as unknown as { body: PhysicsComponent }).body;
      const bodyIndex = this.components.bodies.indexOf(physicsComponent);
      if (bodyIndex > -1) {
        this.components.bodies.splice(bodyIndex, 1);
        physicsComponentToRemove = physicsComponent;
      }
    }

    return physicsComponentToRemove;
  }
}
