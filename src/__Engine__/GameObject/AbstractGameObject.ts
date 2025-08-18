import type { GameComponent } from "../Component";
import type { Mouse } from "../InputDevices/Mouse";
import { generateId } from "../Utils/id";

export type GameObjectData = {
  readonly name?: string;
} & Record<string, GameComponent>;

export interface GameObjectUpdate {
  deltaTime: number;
  mouse: Mouse;
}

export abstract class GameObject {
  readonly name: string;

  constructor({ name }: GameObjectData) {
    this.name = name ?? generateId("Unnamed_GameObject");
  }

  onStart?(): void {}
  abstract update(args?: GameObjectUpdate): void;
  destroy(): void {}
}
