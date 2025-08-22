import { SpriteComponent, TextureComponent } from "./Drawable";
import { BodyComponent, RectangularBodyComponent } from "./Physics";
import { TransformComponent } from "./Transformable";

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

export type { DrawableComponent } from "./DrawableComponent";
export type { PhysicsComponent } from "./PhysicsComponent";
// Export component type interfaces
export type { TransformableComponent } from "./TransformableComponent";

// Export concrete components
export {
  SpriteComponent,
  TextureComponent,
  TransformComponent,
  BodyComponent,
  RectangularBodyComponent,
  createComponent,
};
