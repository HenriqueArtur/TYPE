import type { System } from "../__Engine__/Systems/System";
import type { TypeEngine } from "../__Engine__/TypeEngine";

export class ExampleSystem implements System {
  name = "ExampleSystem";
  priority = 3;
  enabled = true;
  init(_engine: TypeEngine): void | Promise<void> {}
  update(_engine: TypeEngine, _deltaTime: number): void {}
  destroy(_engine: TypeEngine): void {}
}
