import { type Body, Body as MatterBody } from "matter-js";
import type { GameComponent } from "..";

export interface BodyComponentData {
  is_static?: boolean;
  friction?: number;
  restitution?: number;
  density?: number;
}

export abstract class BodyComponent implements GameComponent {
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
