import {
  createComponent,
  type GameComponent,
  type RectangularBodyComponent,
  SpriteComponent,
} from "../Component";
import type { GameObject } from "./AbstractGameObject";

type Constructor<T extends GameObject, D> = new (dep: D) => T;

export interface ComponentLoaded<T extends GameObject = GameObject> {
  instance: T;
  sprites: SpriteComponent[];
  bodies: RectangularBodyComponent[];
}

export function InjectDependencies<T extends GameObject, D>(
  GameObjectClass: Constructor<T, D>,
  dep: object,
): ComponentLoaded<T> {
  const components: Record<string, GameComponent> = {};
  const sprites: SpriteComponent[] = [];
  const bodies: RectangularBodyComponent[] = [];
  for (const [key, value] of Object.entries(dep)) {
    components[key] = createComponent(value);
    if (components[key].type === SpriteComponent._type) {
      sprites.push(components[key] as SpriteComponent);
    }
    if (components[key].type === "RectangularBodyComponent") {
      bodies.push(components[key] as RectangularBodyComponent);
    }
  }
  return {
    instance: new GameObjectClass(components as D),
    sprites,
    bodies,
  };
}
