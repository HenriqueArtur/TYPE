import type { SpriteComponent } from "../../Component/Drawable/SpriteComponent";
import type { RenderEngine } from "../../Engines";
import type { TypeEngine } from "../../TypeEngine";
import type { System } from "../System";

export class RenderPixiSystem implements System<TypeEngine> {
  priority = 2;
  enabled = true;

  async init(engine: TypeEngine, render_engine: RenderEngine) {
    await render_engine.loadAllSprites(engine);
  }

  update(engine: TypeEngine, _deltaTime: number): void {
    const sprite_entities = engine.queryEntities<{ SpriteComponent: SpriteComponent }>([
      "SpriteComponent",
    ]);
    for (const { components } of sprite_entities) {
      components.SpriteComponent._sprite.position.set(
        components.SpriteComponent.position.x,
        components.SpriteComponent.position.y,
      );
      components.SpriteComponent._sprite.scale.set(
        components.SpriteComponent.scale.x,
        components.SpriteComponent.scale.y,
      );
      components.SpriteComponent._sprite.rotation = components.SpriteComponent.rotation;
      components.SpriteComponent._sprite.alpha = components.SpriteComponent.alpha;
      components.SpriteComponent._sprite.visible = components.SpriteComponent.visible;
      components.SpriteComponent._sprite.anchor.set(components.SpriteComponent.anchor);
      if (components.SpriteComponent.tint !== undefined) {
        components.SpriteComponent._sprite.tint = components.SpriteComponent.tint;
      }
    }
  }

  destroy(_engine: TypeEngine): void {}
}
