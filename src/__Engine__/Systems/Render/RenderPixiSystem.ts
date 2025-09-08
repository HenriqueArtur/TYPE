import type { SpriteComponent } from "../../Component/Drawable/SpriteComponent";
import type { TypeEngine } from "../../TypeEngine";
import type { System } from "../System";

export class RenderPixiSystem implements System<TypeEngine> {
  name = "RenderPixiSystem";
  priority = 2;
  enabled = true;

  async init(_engine: TypeEngine) {}

  update(engine: TypeEngine, _deltaTime: number): void {
    const sprite_entities = engine.EntityEngine.query<{ SpriteComponent: SpriteComponent[] }>([
      "SpriteComponent",
    ]);
    for (const { components } of sprite_entities) {
      for (const current of components.SpriteComponent) {
        current._drawable.position.set(current.position.x, current.position.y);
        current._drawable.scale.set(current.scale.x, current.scale.y);
        current._drawable.rotation = current.rotation;
        current._drawable.alpha = current.alpha;
        current._drawable.visible = current.visible;
        current._drawable.anchor.set(current.anchor);
        if (current.tint !== undefined) {
          current._drawable.tint = current.tint;
        }
      }
    }
  }

  destroy(_engine: TypeEngine): void {}
}
