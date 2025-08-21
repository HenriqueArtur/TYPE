import type { RectangularBodyComponent } from "../Component/Body/RectangularBodyComponent";
import { PhysicsEngine, type PhysicsEngineOptions } from "./PhysicsEngine";

export class PhysicsWorldManager {
  private physicsEngine: PhysicsEngine;
  private bodyComponents: RectangularBodyComponent[] = [];

  constructor(options?: PhysicsEngineOptions) {
    this.physicsEngine = new PhysicsEngine(options);
  }

  addBodyComponent(bodyComponent: RectangularBodyComponent): void {
    const body = bodyComponent.getBody();
    this.physicsEngine.addBody(body);
    this.bodyComponents.push(bodyComponent);
  }

  removeBodyComponent(bodyComponent: RectangularBodyComponent): void {
    const body = bodyComponent.getBody();
    this.physicsEngine.removeBody(body);

    const index = this.bodyComponents.indexOf(bodyComponent);
    if (index > -1) {
      this.bodyComponents.splice(index, 1);
    }
  }

  update(deltaTime: number): void {
    // Update the physics world
    this.physicsEngine.update(deltaTime);
  }

  getEngine(): PhysicsEngine {
    return this.physicsEngine;
  }

  getBodyComponents(): RectangularBodyComponent[] {
    return [...this.bodyComponents];
  }

  destroy(): void {
    // Clear body components
    this.bodyComponents.length = 0;

    // Destroy physics engine
    this.physicsEngine.destroy();
  }
}
