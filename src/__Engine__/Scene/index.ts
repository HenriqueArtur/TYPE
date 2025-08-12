import { TextureComponent, createComponent } from "../Component";
import type { SpriteComponent, SpriteComponentDataJson } from "../Component/SpriteComponent";
import type { GameObject, GameObjectDataJson } from "../GameObject";
import { ConcreteGameObject } from "../GameObject/ConcreteGameObject";
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
  sprites: SpriteComponent[];
}

export class GameScene {
  static readonly type = "GameScene";
  static readonly prefix = "SC";
  readonly id: string;
  readonly name: string;
  readonly gameObjects: GameObject[];
  readonly components: SceneComponents;

  constructor(data: GameSceneData) {
    this.id = generateId(GameScene.prefix);
    this.name = data.name;
    this.gameObjects = data.gameObjects;
    this.components = data.components;
  }

  static async load(sceneData: string | object): Promise<GameScene> {
    const scene: SceneData = typeof sceneData === "string" ? JSON.parse(sceneData) : sceneData;
    const components: SceneComponents = {
      sprites: [],
    };
    const game_objects: GameObject[] = [];
    for (const obj of scene.gameObjects) {
      if (obj.script) {
        const constructor_args: Record<string, unknown> = {};
        for (const [, value] of Object.entries(obj.components)) {
          if (value.type === "SpriteComponent") {
            const texture = new TextureComponent({ path: (value.initial_values as SpriteComponentDataJson).texture });
            constructor_args.sprite = { ...value.initial_values, texture };
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
}
