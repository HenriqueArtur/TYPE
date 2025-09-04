import { type Body, Engine, Events, type IEventCollision, World } from "matter-js";
import { PHYSICS_COMPONENTS } from "../../Component/Physics";
import type { TypeEngine } from "../../TypeEngine";
import type { EventEngine } from "../Event/EventEngine";

export interface PhysicsEngineOptions {
  eventEngine: EventEngine;
  gravity?: { x: number; y: number };
}

export class PhysicsEngine {
  private matterEngine: Engine;
  private world: World;
  private eventEngine: EventEngine;
  private gravity: { x: number; y: number };
  private bodyMap = new Map<string, Map<string, Body>>();
  private bodyToEntityMap = new Map<Body, string>();

  private boundHandleCollisionEnter?: (event: IEventCollision<Engine>) => void;
  private boundHandleCollisionExit?: (event: IEventCollision<Engine>) => void;

  private bindedAddBody: (entityId: string, component_name: string, body: Body) => void;
  private bindedRemoveBody: (entityId: string, component_name: string) => void;

  constructor(options: PhysicsEngineOptions) {
    this.eventEngine = options.eventEngine;
    this.gravity = options.gravity ?? { x: 0, y: 1 };

    this.matterEngine = Engine.create();
    this.world = this.matterEngine.world;

    // Set initial gravity
    this.matterEngine.gravity.x = this.gravity.x;
    this.matterEngine.gravity.y = this.gravity.y;

    // Bind methods that don't need engine reference
    this.bindedAddBody = this.addBody.bind(this);
    this.bindedRemoveBody = this.removeBody.bind(this);
  }

  async setup(engine: TypeEngine): Promise<void> {
    // Create closures that capture the engine reference
    this.boundHandleCollisionEnter = (event: IEventCollision<Engine>) => {
      for (const pair of event.pairs) {
        const entity_A_id = this._findEntityByBody(pair.bodyA);
        const entity_B_id = this._findEntityByBody(pair.bodyB);

        const entity_A = entity_A_id ? engine.EntityEngine.getEntity(entity_A_id) : undefined;
        const entity_B = entity_B_id ? engine.EntityEngine.getEntity(entity_B_id) : undefined;

        if (entity_A && entity_B) {
          this.eventEngine.emit(`physics:collision:enter:${entity_A_id}`, entity_B);
          this.eventEngine.emit(`physics:collision:enter:${entity_B_id}`, entity_A);
        }
      }
    };

    this.boundHandleCollisionExit = (event: IEventCollision<Engine>) => {
      for (const pair of event.pairs) {
        const entity_A_id = this._findEntityByBody(pair.bodyA);
        const entity_B_id = this._findEntityByBody(pair.bodyB);

        const entity_A = entity_A_id ? engine.EntityEngine.getEntity(entity_A_id) : undefined;
        const entity_B = entity_B_id ? engine.EntityEngine.getEntity(entity_B_id) : undefined;

        if (entity_A && entity_B) {
          this.eventEngine.emit(`physics:collision:exit:${entity_A_id}`, entity_B);
          this.eventEngine.emit(`physics:collision:exit:${entity_B_id}`, entity_A);
        }
      }
    };

    Events.on(this.matterEngine, "collisionStart", this.boundHandleCollisionEnter);
    Events.on(this.matterEngine, "collisionEnd", this.boundHandleCollisionExit);

    this.eventEngine.on("physics:collision:enter", this.boundHandleCollisionEnter);
    this.eventEngine.on("physics:collision:exit", this.boundHandleCollisionExit);

    this.eventEngine.on("physics:add:body", this.bindedAddBody);
    this.eventEngine.on("physics:remove:body", this.bindedRemoveBody);
  }

  private _findEntityByBody(body: Body): string | null {
    return this.bodyToEntityMap.get(body) ?? null;
  }

  setupScene(engine: TypeEngine) {
    const body_entities =
      engine.EntityEngine.queryEntities<Record<string, { _body: Body }>>(PHYSICS_COMPONENTS);
    for (const { entityId, components } of body_entities) {
      let components_ref = this.bodyMap.get(entityId);
      if (!components_ref) {
        components_ref = new Map();
        this.bodyMap.set(entityId, components_ref);
      }
      for (const [name, component] of Object.entries(components)) {
        components_ref.set(name, component._body);
        this.bodyToEntityMap.set(component._body, entityId);
        World.add(this.world, component._body);
      }
    }
  }

  update(deltaTime: number): void {
    Engine.update(this.matterEngine, deltaTime);
  }

  addBody(entityId: string, component_name: string, body: Body): void {
    let components_ref = this.bodyMap.get(entityId);
    if (!components_ref) {
      components_ref = new Map();
      this.bodyMap.set(entityId, components_ref);
    }
    components_ref.set(component_name, body);
    this.bodyToEntityMap.set(body, entityId);
    World.add(this.world, body);
  }

  removeBody(entityId: string, component_name: string): void {
    const components_ref = this.bodyMap.get(entityId);
    if (!components_ref) {
      return;
    }
    const component = components_ref.get(component_name);
    if (!component) {
      return;
    }
    World.remove(this.world, component);
    this.bodyToEntityMap.delete(component);
    components_ref.delete(component_name);
  }

  setGravity(gravity: { x: number; y: number }): void {
    this.gravity = gravity;
    this.matterEngine.gravity.x = gravity.x;
    this.matterEngine.gravity.y = gravity.y;
  }

  getGravity(): { x: number; y: number } {
    return { ...this.gravity };
  }

  getMatterEngine(): Engine {
    return this.matterEngine;
  }

  getWorld() {
    return this.world;
  }

  getBodyMap() {
    return this.bodyMap;
  }

  getBodyToEntityMap() {
    return this.bodyToEntityMap;
  }

  findEntityByBody(body: Body): string | null {
    return this.bodyToEntityMap.get(body) ?? null;
  }

  destroy(): void {
    // Remove event listeners
    if (this.boundHandleCollisionEnter) {
      Events.off(this.matterEngine, "collisionStart", this.boundHandleCollisionEnter);
      this.eventEngine.off("physics:collision:enter", this.boundHandleCollisionEnter);
    }

    if (this.boundHandleCollisionExit) {
      Events.off(this.matterEngine, "collisionEnd", this.boundHandleCollisionExit);
      this.eventEngine.off("physics:collision:exit", this.boundHandleCollisionExit);
    }

    this.eventEngine.off("physics:add:body", this.bindedAddBody);
    this.eventEngine.off("physics:remove:body", this.bindedRemoveBody);

    // Clear all bodies
    World.clear(this.world, false);
    this.bodyMap.clear();
    this.bodyToEntityMap.clear();
  }
}
