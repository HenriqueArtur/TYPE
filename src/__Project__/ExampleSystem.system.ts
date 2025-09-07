import type { SpriteComponent } from "../__Engine__/Component/Drawable/SpriteComponent";
import type { System } from "../__Engine__/Systems/System";
import type { TypeEngine } from "../__Engine__/TypeEngine";

export class ExampleSystem implements System {
  name = "ExampleSystem";
  priority = 3;
  enabled = true;
  init(_engine: TypeEngine): void | Promise<void> {}
  update(engine: TypeEngine, deltaTime: number): void {
    const sprite_entities = engine.EntityEngine.query<{ SpriteComponent: [SpriteComponent] }>([
      "SpriteComponent",
    ]);
    for (const { components } of sprite_entities) {
      components.SpriteComponent[0].rotation += 0.01 * deltaTime;
    }
  }
  destroy(_engine: TypeEngine): void {}
}
