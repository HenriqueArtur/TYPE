import type { SpriteComponent } from "../../__Engine__/Component/Drawable/SpriteComponent";
import type { MouseComponent } from "../../__Engine__/Component/Input/MouseComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";

export class ExampleSystem implements System {
  name = "ExampleSystem";
  priority = 3;
  enabled = true;
  init(_engine: TypeEngine): void | Promise<void> {}
  update(engine: TypeEngine, _deltaTime: number): void {
    // Query entities that have both SpriteComponent and MouseComponent
    const sprite_entities = engine.EntityEngine.query<{
      SpriteComponent: [SpriteComponent];
      MouseComponent: [MouseComponent];
    }>(["SpriteComponent", "MouseComponent"]);

    for (const { components } of sprite_entities) {
      const sprite = components.SpriteComponent[0];
      const mouse = components.MouseComponent[0];

      // Calculate angle from sprite position to mouse position
      const dx = mouse.windowPosition.x - sprite.position.x;
      const dy = mouse.windowPosition.y - sprite.position.y;

      // Calculate rotation angle in radians (atan2 gives angle from -PI to PI)
      sprite.rotation = Math.atan2(dy, dx);
    }
  }
  destroy(_engine: TypeEngine): void {}
}
