import type { GameComponent, GameComponentJson } from "../Component";
import { generateId } from "../Utils/id";

export type GameObjectData = {
  readonly id?: string;
  readonly name?: string;
} & Record<string, GameComponent>;

export type GameObjectDadaJson = {
  readonly id: string;
  readonly components: Record<string, GameComponentJson>;
};

export abstract class GameObject {
  readonly id: string;
  readonly name: string;

  constructor({ id, name }: GameObjectData) {
    this.id = id ?? generateId("BO_NO_ID");
    this.name = name ?? generateId("Unnamed_GameObject");
  }

  onStart(): void {}
  abstract update(): void;
  onDestroy(): void {}
}
