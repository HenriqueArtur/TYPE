import type { RectangleComponent } from "../../__Engine__/Component/Drawable/Shapes/RectangleComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";

export class RotationSystem implements System<TypeEngine> {
  name = "RotationSystem";
  priority = 6;
  enabled = true;

  async init(_engine: TypeEngine): Promise<void> {
    // System initialization
  }

  update(engine: TypeEngine, deltaTime: number): void {
    const entities = engine.EntityEngine.query<{ RectangleComponent: RectangleComponent[] }>([
      "RectangleComponent",
    ]);

    for (const { components } of entities) {
      for (const rectangle of components.RectangleComponent) {
        // Rotate the rectangle by 1 radian per second (smoother)
        rectangle.rotation += 0.01 * deltaTime;
      }
    }
  }
}
