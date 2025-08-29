export interface RectangularBodyComponentData {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  is_static?: boolean;
  friction?: number;
  restitution?: number;
  density?: number;
}

export class RectangularBodyComponent {
  static readonly _type = "RectangularBodyComponent";
  readonly type = RectangularBodyComponent._type;
  static readonly prefix = "RBD";

  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
  readonly is_static: boolean;
  readonly friction: number;
  readonly restitution: number;
  readonly density: number;

  constructor(data: RectangularBodyComponentData = {}) {
    this.width = data.width ?? 50;
    this.height = data.height ?? 50;
    this.x = data.x ?? 0;
    this.y = data.y ?? 0;
    this.is_static = data.is_static ?? false;
    this.friction = data.friction ?? 0.3;
    this.restitution = data.restitution ?? 0.8;
    this.density = data.density ?? 1;
  }

  static jsonToGameObject(json: string | object): RectangularBodyComponent {
    const data: RectangularBodyComponentData = typeof json === "string" ? JSON.parse(json) : json;
    return new RectangularBodyComponent(data);
  }
}
