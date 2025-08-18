import { BodyComponent, RectangularBodyComponent } from "./Body";
import { SpriteComponent } from "./SpriteComponent";
import { TextureComponent } from "./TextureComponent";
import { TransformComponent } from "./TransformComponent";

export abstract class GameComponent {
  static readonly _type: string;
  static readonly prefix: string;
  abstract readonly type: string;
  static jsonToGameObject: JsonToGameObject;
  abstract destroy(): void;
}

export type JsonToGameObject = (json: string | object) => GameComponent;

export type GameComponentJson = {
  readonly type: ComponentType;
  readonly name: string;
  readonly initial_values: object;
};

export type ComponentType =
  | "SpriteComponent"
  | "TextureComponent"
  | "TransformComponent"
  | "BodyComponent"
  | "RectangularBodyComponent";

function createComponent(component_json: GameComponentJson): GameComponent {
  const contructor = COMPONENT_CLASSES[component_json.type];
  if (!contructor) {
    throw Error(`Unknown component type: ${component_json.type}`);
  }
  return contructor(component_json.initial_values);
}

const COMPONENT_CLASSES: Record<ComponentType, (typeof GameComponent)["jsonToGameObject"]> = {
  SpriteComponent: SpriteComponent.jsonToGameObject,
  TextureComponent: TextureComponent.jsonToGameObject,
  TransformComponent: TransformComponent.jsonToGameObject,
  BodyComponent: BodyComponent.jsonToGameObject,
  RectangularBodyComponent: RectangularBodyComponent.jsonToGameObject,
};

export {
  SpriteComponent,
  TextureComponent,
  TransformComponent,
  BodyComponent,
  RectangularBodyComponent,
  createComponent,
};
