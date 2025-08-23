import { type Body, Engine, World } from "matter-js";
import type { PhysicsComponent } from "../../Component/PhysicsComponent";

export interface PhysicsEngineOptions {
  gravity?: {
    x: number;
    y: number;
  };
}

export class PhysicsEngine {
  private engine: Matter.Engine;
  private physicsComponents: PhysicsComponent[] = [];

  constructor(options?: PhysicsEngineOptions) {
    this.engine = Engine.create();

    if (options?.gravity) {
      this.setGravity(options.gravity);
    }
  }

  addPhysicsComponent(component: PhysicsComponent): void {
    if (!this.physicsComponents.includes(component)) {
      this.physicsComponents.push(component);
      World.add(this.engine.world, component.getBody());
    }
  }

  removePhysicsComponent(component: PhysicsComponent): void {
    const index = this.physicsComponents.indexOf(component);
    if (index > -1) {
      this.physicsComponents.splice(index, 1);
      World.remove(this.engine.world, component.getBody());
    }
  }

  getPhysicsComponents(): PhysicsComponent[] {
    return [...this.physicsComponents];
  }

  getStaticComponents(): PhysicsComponent[] {
    return this.physicsComponents.filter((component) => component.isStatic());
  }

  getDynamicComponents(): PhysicsComponent[] {
    return this.physicsComponents.filter((component) => !component.isStatic());
  }

  applyForceToAll(force: { x: number; y: number }): void {
    this.physicsComponents.forEach((component) => {
      if (!component.isStatic()) {
        component.applyForce(force);
      }
    });
  }

  setAllVelocity(velocity: { x: number; y: number }): void {
    this.physicsComponents.forEach((component) => {
      if (!component.isStatic()) {
        component.setVelocity(velocity);
      }
    });
  }

  update(deltaTime: number): void {
    Engine.update(this.engine, deltaTime);
  }

  setGravity(gravity: { x: number; y: number }): void {
    this.engine.world.gravity.x = gravity.x;
    this.engine.world.gravity.y = gravity.y;
  }

  getEngine(): Matter.Engine {
    return this.engine;
  }

  getWorld(): Matter.World {
    return this.engine.world;
  }

  getBodies(): Body[] {
    return this.engine.world.bodies;
  }

  destroy(): void {
    // Clear all physics components
    this.physicsComponents.length = 0;

    // Clear all bodies from the world
    this.engine.world.bodies.length = 0;

    // Reset gravity to default
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 1;
  }

  // Legacy methods for backward compatibility
  addBody(body: Body): void {
    World.add(this.engine.world, body);
  }

  removeBody(body: Body): void {
    World.remove(this.engine.world, body);
  }
}
