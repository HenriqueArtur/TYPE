import type { CircleComponent } from "../../Component/Drawable/Shapes/CircleComponent";
import type { RectangleComponent } from "../../Component/Drawable/Shapes/RectangleComponent";
import type { SpriteComponent } from "../../Component/Drawable/SpriteComponent";
import type { TypeEngine } from "../../TypeEngine";
import type { System } from "../System";

export class RenderPixiSystem implements System<TypeEngine> {
  name = "RenderPixiSystem";
  priority = 2;
  enabled = true;

  async init(_engine: TypeEngine) {}

  update(engine: TypeEngine, _deltaTime: number): void {
    const drawable_entities = engine.EntityEngine.queryWithAny<{
      SpriteComponent: SpriteComponent[];
      RectangleComponent: RectangleComponent[];
      CircleComponent: CircleComponent[];
    }>(["SpriteComponent", "RectangleComponent", "CircleComponent"]);

    for (const { components } of drawable_entities) {
      // Handle SpriteComponent
      if (components.SpriteComponent) {
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

      // Handle RectangleComponent
      if (components.RectangleComponent) {
        for (const current of components.RectangleComponent) {
          current._drawable.position.set(current.position.x, current.position.y);
          current._drawable.scale.set(current.scale.x, current.scale.y);
          current._drawable.rotation = current.rotation;
          current._drawable.alpha = current.alpha;
          current._drawable.visible = current.visible;
        }
      }

      // Handle CircleComponent
      if (components.CircleComponent) {
        for (const current of components.CircleComponent) {
          current._drawable.position.set(current.position.x, current.position.y);
          current._drawable.scale.set(current.scale.x, current.scale.y);
          current._drawable.rotation = current.rotation;
          current._drawable.alpha = current.alpha;
          current._drawable.visible = current.visible;
        }
      }
    }
  }

  destroy(_engine: TypeEngine): void {}
}
