import type { RectangularBodyComponent } from "../Component/Physics/RectangularBodyComponent";
import type { PhysicsComponent } from "../Component/PhysicsComponent";
import { PhysicsEngine, type PhysicsEngineOptions } from "./PhysicsEngine";

export class PhysicsWorldManager {
  private physicsEngine: PhysicsEngine;

  constructor(options?: PhysicsEngineOptions) {
    this.physicsEngine = new PhysicsEngine(options);
  }

  addPhysicsComponent(component: PhysicsComponent): void {
    this.physicsEngine.addPhysicsComponent(component);
  }

  removePhysicsComponent(component: PhysicsComponent): void {
    this.physicsEngine.removePhysicsComponent(component);
  }

  getPhysicsComponents(): PhysicsComponent[] {
    return this.physicsEngine.getPhysicsComponents();
  }

  getStaticComponents(): PhysicsComponent[] {
    return this.physicsEngine.getStaticComponents();
  }

  getDynamicComponents(): PhysicsComponent[] {
    return this.physicsEngine.getDynamicComponents();
  }

  applyForceToAll(force: { x: number; y: number }): void {
    this.physicsEngine.applyForceToAll(force);
  }

  setAllVelocity(velocity: { x: number; y: number }): void {
    this.physicsEngine.setAllVelocity(velocity);
  }

  setGravity(gravity: { x: number; y: number }): void {
    this.physicsEngine.setGravity(gravity);
  }

  update(deltaTime: number): void {
    // Update the physics world
    this.physicsEngine.update(deltaTime);
  }

  getEngine(): PhysicsEngine {
    return this.physicsEngine;
  }

  destroy(): void {
    // Destroy physics engine
    this.physicsEngine.destroy();
  }

  // Legacy methods for backward compatibility
  addBodyComponent(bodyComponent: RectangularBodyComponent): void {
    this.addPhysicsComponent(bodyComponent);
  }

  removeBodyComponent(bodyComponent: RectangularBodyComponent): void {
    this.removePhysicsComponent(bodyComponent);
  }

  getBodyComponents(): RectangularBodyComponent[] {
    return this.getPhysicsComponents() as RectangularBodyComponent[];
  }
}
