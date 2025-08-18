import { Bodies, type Body, Body as MatterBody } from "matter-js";
import { BodyComponent, type BodyComponentData } from "./BodyComponent";

export interface RectangularBodyComponentData extends BodyComponentData {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export class RectangularBodyComponent extends BodyComponent {
  static readonly _type = "RectangularBodyComponent";
  readonly type = RectangularBodyComponent._type;
  static readonly prefix = "RBD";

  private width: number;
  private height: number;
  private x: number;
  private y: number;

  constructor(data?: RectangularBodyComponentData) {
    data = data ?? {};

    // Set dimensions and position before calling super
    // because super calls createBody() which needs these values
    const tempData = data;
    super(tempData);

    this.width = data.width ?? 50;
    this.height = data.height ?? 50;
    this.x = data.x ?? 0;
    this.y = data.y ?? 0;

    // Re-create the body with correct values now that properties are set
    this.body = this.createBody();
  }

  protected createBody(): Body {
    return Bodies.rectangle(this.x, this.y, this.width, this.height, {
      isStatic: this.is_static,
      friction: this.friction,
      restitution: this.restitution,
      density: this.density,
    });
  }

  set(data: Omit<RectangularBodyComponentData, "id">) {
    super.set(data);

    if (data.width !== undefined) {
      this.width = data.width;
      this.updateBodyShape();
    }
    if (data.height !== undefined) {
      this.height = data.height;
      this.updateBodyShape();
    }
    if (data.x !== undefined) {
      this.x = data.x;
      MatterBody.setPosition(this.body, { x: this.x, y: this.body.position.y });
    }
    if (data.y !== undefined) {
      this.y = data.y;
      MatterBody.setPosition(this.body, { x: this.body.position.x, y: this.y });
    }
  }

  private updateBodyShape() {
    const new_body = Bodies.rectangle(this.x, this.y, this.width, this.height, {
      isStatic: this.is_static,
      friction: this.friction,
      restitution: this.restitution,
      density: this.density,
    });

    this.body.vertices = new_body.vertices;
    this.body.bounds = new_body.bounds;
    this.body.area = new_body.area;
    this.body.inertia = new_body.inertia;
    this.body.inverseInertia = new_body.inverseInertia;
  }

  value() {
    return {
      ...super.value(),
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
    };
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    super.setPosition(x, y);
  }

  static jsonToGameObject(json: string | object): RectangularBodyComponent {
    const data: RectangularBodyComponentData = typeof json === "string" ? JSON.parse(json) : json;
    return new RectangularBodyComponent(data);
  }
}
