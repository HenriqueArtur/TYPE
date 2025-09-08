import type { TypeEngine } from "../../TypeEngine";
import type { System } from "../System";

export class PhysicsSystem implements System<TypeEngine> {
  name = "PhysicsSystem";
  priority = 1;
  enabled = true;

  async init(_engine: TypeEngine) {}

  update(engine: TypeEngine, deltaTime: number): void {
    engine.PhysicsEngine.update(deltaTime);
  }

  destroy(_engine: TypeEngine): void {}
}
