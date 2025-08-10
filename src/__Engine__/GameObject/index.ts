import type { GameComponentJson } from "../Component";
import { GameObject } from "./AbstractGameObject";
import { ConcreteGameObject } from "./ConcreteGameObject";

export type GameObjectDataJson = {
  readonly id: string;
  readonly name: string;
  readonly script?: string;
  readonly components: Record<string, GameComponentJson>;
};

export { GameObject, ConcreteGameObject };
