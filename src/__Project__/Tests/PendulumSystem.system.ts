import type { CircleComponent } from "../../__Engine__/Component/Drawable/Shapes/CircleComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";
import type { PendulumComponent } from "./PendulumComponent.component";

export class PendulumSystem implements System<TypeEngine> {
  name = "PendulumSystem";
  priority = 5;
  enabled = true;

  async init(_engine: TypeEngine): Promise<void> {
    // never use
  }

  update(engine: TypeEngine, deltaTime: number): void {
    const entities = engine.EntityEngine.query<{
      CircleComponent: CircleComponent[];
      PendulumComponent: PendulumComponent[];
    }>(["CircleComponent", "PendulumComponent"]);

    for (const { components } of entities) {
      for (let i = 0; i < components.CircleComponent.length; i++) {
        const circle = components.CircleComponent[i];
        const pendulum = components.PendulumComponent[i];

        // Update time
        pendulum.time += deltaTime;

        // Calculate pendulum position using sine wave
        const offset =
          Math.sin(pendulum.time * pendulum.frequency * 0.01 * Math.PI) * pendulum.amplitude;
        circle.position.x = pendulum.baseX + offset;
      }
    }
  }
}
