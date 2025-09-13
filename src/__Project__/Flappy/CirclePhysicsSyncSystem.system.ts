import type { CircleComponent } from "../../__Engine__/Component/Drawable/Shapes/CircleComponent";
import type { RigidBodyCircleComponent } from "../../__Engine__/Component/Physics/RigidBodyCircleComponent";
import type { System } from "../../__Engine__/Systems/System";
import type { TypeEngine } from "../../__Engine__/TypeEngine";

export class CirclePhysicsSyncSystem implements System<TypeEngine> {
  name = "CirclePhysicsSyncSystem";
  priority = 4;
  enabled = true;

  async init(_engine: TypeEngine): Promise<void> {
    // System initialization
  }

  update(engine: TypeEngine, _deltaTime: number): void {
    const physicsCircleEntities = engine.EntityEngine.query<{
      RigidBodyCircleComponent: RigidBodyCircleComponent[];
      CircleComponent: CircleComponent[];
    }>(["RigidBodyCircleComponent", "CircleComponent"]);

    for (const { components } of physicsCircleEntities) {
      const physicsBody = components.RigidBodyCircleComponent[0];
      const visualCircle = components.CircleComponent[0];

      visualCircle.position.x = physicsBody.x;
      visualCircle.position.y = physicsBody.y;
      visualCircle.rotation = physicsBody.rotation;

      if (physicsBody.radius !== visualCircle.radius) {
        visualCircle.radius = physicsBody.radius;
      }
    }
  }

  destroy(_engine: TypeEngine): void {
    // Cleanup resources if needed
  }
}
