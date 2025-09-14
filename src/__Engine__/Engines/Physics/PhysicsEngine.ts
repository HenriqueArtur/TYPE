import {
  type Body,
  Composite,
  Events,
  type IEventCollision,
  Body as MatterBody,
  Engine as MatterEngine,
  World,
} from "matter-js";
import { PHYSICS_COMPONENTS } from "../../Component/Physics/__const__";
import type { BodyComponent } from "../../Component/Physics/__type__";
import type { TypeEngine } from "../../TypeEngine";
import type { EventEngine } from "../Event/EventEngine";

export interface PhysicsEngineOptions {
  engine: TypeEngine;
  EventEngine: EventEngine;
  gravity?: { x: number; y: number };
}

export class PhysicsEngine {
  private engine: TypeEngine;
  private matterEngine: MatterEngine;
  private world: Composite;
  private eventEngine: EventEngine;
  private gravity: { x: number; y: number };
  private bodyMap = new Map<string, Map<string, Body>>();
  private bodyToEntityMap = new Map<Body, string>();

  private boundHandleCollisionEnter?: (event: IEventCollision<MatterEngine>) => void;
  private boundHandleCollisionExit?: (event: IEventCollision<MatterEngine>) => void;

  private bindedAddBody: (entityId: string, component_name: string, body: BodyComponent) => void;
  private bindedRemoveBody: (entityId: string, component_name: string) => void;

  constructor(options: PhysicsEngineOptions) {
    this.engine = options.engine;
    this.eventEngine = options.EventEngine;
    this.gravity = options.gravity ?? { x: 0, y: 1 };

    this.matterEngine = MatterEngine.create();
    this.world = this.matterEngine.world;

    // Set initial gravity
    this.matterEngine.gravity.x = this.gravity.x;
    this.matterEngine.gravity.y = this.gravity.y;

    // Bind methods that don't need engine reference
    this.bindedAddBody = this.addBody.bind(this);
    this.bindedRemoveBody = this.removeBody.bind(this);
  }

  async setup(): Promise<void> {
    // Create closures that capture the engine reference
    this.boundHandleCollisionEnter = (event: IEventCollision<MatterEngine>) => {
      for (const pair of event.pairs) {
        const entity_A_id = this._findEntityByBody(pair.bodyA);
        const entity_B_id = this._findEntityByBody(pair.bodyB);

        const entity_A = entity_A_id ? this.engine.EntityEngine.get(entity_A_id) : undefined;
        const entity_B = entity_B_id ? this.engine.EntityEngine.get(entity_B_id) : undefined;

        if (entity_A && entity_B) {
          this.eventEngine.emit(`physics:collision:enter:${entity_A_id}`, this.engine, entity_B);
          this.eventEngine.emit(`physics:collision:enter:${entity_B_id}`, this.engine, entity_A);
        }
      }
    };

    this.boundHandleCollisionExit = (event: IEventCollision<MatterEngine>) => {
      for (const pair of event.pairs) {
        const entity_A_id = this._findEntityByBody(pair.bodyA);
        const entity_B_id = this._findEntityByBody(pair.bodyB);

        const entity_A = entity_A_id ? this.engine.EntityEngine.get(entity_A_id) : undefined;
        const entity_B = entity_B_id ? this.engine.EntityEngine.get(entity_B_id) : undefined;

        if (entity_A && entity_B) {
          this.eventEngine.emit(`physics:collision:exit:${entity_A_id}`, this.engine, entity_B);
          this.eventEngine.emit(`physics:collision:exit:${entity_B_id}`, this.engine, entity_A);
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

  setupScene() {
    const body_entities =
      this.engine.EntityEngine.queryWithAny<Record<string, { _body: Body }[]>>(PHYSICS_COMPONENTS);
    for (const { entityId, components } of body_entities) {
      let components_ref = this.bodyMap.get(entityId);
      if (!components_ref) {
        components_ref = new Map();
        this.bodyMap.set(entityId, components_ref);
      }
      for (const [name, component] of Object.entries(components)) {
        components_ref.set(name, component[0]._body);
        this.bodyToEntityMap.set(component[0]._body, entityId);
        Composite.add(this.world, component[0]._body);
      }
    }
  }

  update(deltaTime: number): void {
    MatterEngine.update(this.matterEngine, deltaTime);
  }

  addBody(entityId: string, component_name: string, body: BodyComponent): void {
    let components_ref = this.bodyMap.get(entityId);
    if (!components_ref) {
      components_ref = new Map();
      this.bodyMap.set(entityId, components_ref);
    }
    components_ref.set(component_name, body._body);
    this.bodyToEntityMap.set(body._body, entityId);
    Composite.add(this.world, body._body);
    console.log(Composite.allBodies(this.world));
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

  getMatterEngine(): MatterEngine {
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

  applyForce(
    body: Body,
    position: { x: number; y: number },
    force: { x: number; y: number },
  ): void {
    MatterBody.applyForce(body, position, force);
  }

  setPosition(body: Body, position: { x: number; y: number }) {
    MatterBody.setPosition(body, position);
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
    this.clear();
  }

  clear() {
    Composite.clear(this.world, false);
    this.bodyMap.clear();
    this.bodyToEntityMap.clear();
  }
}
