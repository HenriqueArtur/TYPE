import { createComponent } from "../Component";
import type { SpriteComponent } from "../Component/SpriteComponent";
import type { GameObject, GameObjectDadaJson } from "../GameObject";
import { ConcreteGameObject } from "../GameObject/ConcreteGameObject";
import { generateId } from "../Utils/id";

export interface GameSceneData {
  readonly name: string;
  readonly gameObjects: GameObject[];
  readonly components: SceneComponents;
}

interface SceneData {
  scene: {
    id: string;
    name: string;
    gameObjects: GameObjectDadaJson[];
  };
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

  private constructor(data: GameSceneData) {
    this.id = generateId(GameScene.prefix);
    this.name = data.name;
    this.gameObjects = data.gameObjects;
    this.components = data.components;
  }

  static load(sceneData: string | object): GameScene {
    const scene: SceneData = typeof sceneData === "string" ? JSON.parse(sceneData) : sceneData;
    const components: SceneComponents = {
      sprites: [],
    };

    const gameObjects: GameObject[] = scene.scene.gameObjects.map((obj) => {
      const components_json = Object.values(obj.components).map((value, i) => {
        const new_component = createComponent(value);
        if (new_component.type === "SpriteComponent") {
          components.sprites.push(new_component as SpriteComponent);
        }
        return [i, new_component];
      });

      return new ConcreteGameObject({ ...Object.fromEntries(components_json) });
    });

    return new GameScene({
      name: scene.scene.name,
      gameObjects,
      components,
    });
  }
}
