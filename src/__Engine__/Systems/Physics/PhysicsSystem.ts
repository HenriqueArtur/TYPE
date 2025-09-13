import { PHYSICS_COMPONENTS } from "../../Component/Physics/__const__";
import type { ColliderCircleComponent } from "../../Component/Physics/ColliderCircleComponent";
import type { ColliderRectangleComponent } from "../../Component/Physics/ColliderRectangleComponent";
import type { RigidBodyCircleComponent } from "../../Component/Physics/RigidBodyCircleComponent";
import type { RigidBodyRectangleComponent } from "../../Component/Physics/RigidBodyRectangleComponent";
import type { SensorCircleComponent } from "../../Component/Physics/SensorCircleComponent";
import type { SensorRectangleComponent } from "../../Component/Physics/SensorRectangleComponent";
import type { TypeEngine } from "../../TypeEngine";
import type { System } from "../System";

export class PhysicsSystem implements System<TypeEngine> {
  name = "PhysicsSystem";
  priority = 1;
  enabled = true;

  async init(_engine: TypeEngine) {}

  update(engine: TypeEngine, deltaTime: number): void {
    // Update the physics simulation
    engine.PhysicsEngine.update(deltaTime);

    // Sync component values from physics bodies (inverse of RenderPixiSystem)
    const physicsEntities = engine.EntityEngine.queryWithAny<{
      RigidBodyCircleComponent: RigidBodyCircleComponent[];
      RigidBodyRectangleComponent: RigidBodyRectangleComponent[];
      ColliderCircleComponent: ColliderCircleComponent[];
      ColliderRectangleComponent: ColliderRectangleComponent[];
      SensorCircleComponent: SensorCircleComponent[];
      SensorRectangleComponent: SensorRectangleComponent[];
    }>(PHYSICS_COMPONENTS);

    for (const { components } of physicsEntities) {
      // Handle RigidBodyCircleComponent
      if (components.RigidBodyCircleComponent) {
        for (const component of components.RigidBodyCircleComponent) {
          component.x = component._body.position.x;
          component.y = component._body.position.y;
          component.rotation = component._body.angle;
          component.velocity.x = component._body.velocity.x;
          component.velocity.y = component._body.velocity.y;
          component.angularVelocity = component._body.angularVelocity;
        }
      }

      // Handle RigidBodyRectangleComponent
      if (components.RigidBodyRectangleComponent) {
        for (const component of components.RigidBodyRectangleComponent) {
          component.x = component._body.position.x;
          component.y = component._body.position.y;
          component.rotation = component._body.angle;
          component.velocity.x = component._body.velocity.x;
          component.velocity.y = component._body.velocity.y;
          component.angularVelocity = component._body.angularVelocity;
        }
      }

      // Handle ColliderCircleComponent
      if (components.ColliderCircleComponent) {
        for (const component of components.ColliderCircleComponent) {
          component.x = component._body.position.x;
          component.y = component._body.position.y;
          component.rotation = component._body.angle;
        }
      }

      // Handle ColliderRectangleComponent
      if (components.ColliderRectangleComponent) {
        for (const component of components.ColliderRectangleComponent) {
          component.x = component._body.position.x;
          component.y = component._body.position.y;
          component.rotation = component._body.angle;
        }
      }

      // Handle SensorCircleComponent
      if (components.SensorCircleComponent) {
        for (const component of components.SensorCircleComponent) {
          component.x = component._body.position.x;
          component.y = component._body.position.y;
          component.rotation = component._body.angle;
        }
      }

      // Handle SensorRectangleComponent
      if (components.SensorRectangleComponent) {
        for (const component of components.SensorRectangleComponent) {
          component.x = component._body.position.x;
          component.y = component._body.position.y;
          component.rotation = component._body.angle;
        }
      }
    }
  }

  destroy(_engine: TypeEngine): void {}
}
