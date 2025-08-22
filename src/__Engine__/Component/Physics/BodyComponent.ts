import { type Body, Body as MatterBody } from "matter-js";
import type { PhysicsComponent } from "../PhysicsComponent";

export interface BodyComponentData {
  is_static?: boolean;
  friction?: number;
  restitution?: number;
  density?: number;
}

export abstract class BodyComponent implements PhysicsComponent {
  static readonly _type: string;
  abstract readonly type: string;
  static readonly prefix: string;

  protected body: Body;
  protected is_static: boolean;
  protected friction: number;
  protected restitution: number;
  protected density: number;

  constructor(data?: BodyComponentData) {
    this.is_static = data?.is_static ?? false;
    this.friction = data?.friction ?? 0.1;
    this.restitution = data?.restitution ?? 0.3;
    this.density = data?.density ?? 0.001;
    this.body = this.createBody();
  }

  protected abstract createBody(): Body;

  getBody(): Body {
    return this.body;
  }

  setPosition(x: number, y: number): void {
    MatterBody.setPosition(this.body, { x, y });
  }

  // PhysicsComponent interface implementation
  getPosition(): { x: number; y: number } {
    return { x: this.body.position.x, y: this.body.position.y };
  }

  setRotation(angle: number): void {
    MatterBody.setAngle(this.body, angle);
  }

  getRotation(): number {
    return this.body.angle;
  }

  applyForce(force: { x: number; y: number }, point?: { x: number; y: number }): void {
    const applyPoint = point ?? this.body.position;
    MatterBody.applyForce(this.body, applyPoint, force);
  }

  setVelocity(velocity: { x: number; y: number }): void {
    MatterBody.setVelocity(this.body, velocity);
  }

  getVelocity(): { x: number; y: number } {
    return { x: this.body.velocity.x, y: this.body.velocity.y };
  }

  isStatic(): boolean {
    return this.body.isStatic;
  }

  setStatic(isStatic: boolean): void {
    this.is_static = isStatic;
    MatterBody.setStatic(this.body, isStatic);
  }

  destroy(): void {
    // Reset body properties to defaults
    this.is_static = false;
    this.friction = 0.1;
    this.restitution = 0.3;
    this.density = 0.001;
  }

  set(data: Omit<BodyComponentData, "id">) {
    if (data.is_static !== undefined) {
      this.is_static = data.is_static;
      this.body.isStatic = this.is_static;
    }
    if (data.friction !== undefined) {
      this.friction = data.friction;
      this.body.friction = this.friction;
    }
    if (data.restitution !== undefined) {
      this.restitution = data.restitution;
      this.body.restitution = this.restitution;
    }
    if (data.density !== undefined) {
      this.density = data.density;
      this.body.density = this.density;
    }
  }

  value() {
    return {
      is_static: this.is_static,
      friction: this.friction,
      restitution: this.restitution,
      density: this.density,
    };
  }

  static jsonToGameObject(_json: string | object): BodyComponent {
    throw new Error("Abstract method jsonToGameObject must be implemented by subclasses");
  }
}
