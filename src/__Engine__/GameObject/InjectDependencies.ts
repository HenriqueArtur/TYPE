import { createComponent, GameComponent, SpriteComponent } from "../Component";
import { GameObject } from "./AbstractGameObject";

type Constructor<T extends GameObject, D> = new (dep: D) => T;

export interface ComponentLoaded<T extends GameObject = GameObject> {
  instance: T,
  sprites: SpriteComponent[]
}

export function InjectDependencies<T extends GameObject, D>(GameObjectClass: Constructor<T, D>, dep: object): ComponentLoaded<T> {
  const components: Record<string, GameComponent> = {}
  const sprites: SpriteComponent[] = []
  for (const [key, value] of Object.entries(dep)) {
    components[key] = createComponent(value)
    if(components[key].type === SpriteComponent._type) {
      sprites.push(components[key] as SpriteComponent)
    }
  }
  return {
    instance: new GameObjectClass(components as D),
    sprites
  }
}
