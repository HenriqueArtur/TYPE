import { type Body, Engine, World } from "matter-js";

export interface PhysicsEngineOptions {
  gravity?: {
    x: number;
    y: number;
  };
}

export class PhysicsEngine {
  private engine: Matter.Engine;

  constructor(options?: PhysicsEngineOptions) {
    this.engine = Engine.create();

    if (options?.gravity) {
      this.setGravity(options.gravity);
    }
  }

  addBody(body: Body): void {
    World.add(this.engine.world, body);
  }

  removeBody(body: Body): void {
    World.remove(this.engine.world, body);
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
    // Clear all bodies from the world
    this.engine.world.bodies.length = 0;

    // Reset gravity to default
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 1;
  }
}
