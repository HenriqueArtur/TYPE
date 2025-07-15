import { Component } from "../Component";

export class TransformComponent extends Component {
  static readonly type = "TransformComponent";

  public x: number;
  public y: number;
  public rotation: number;
  public scaleX: number;
  public scaleY: number;

  constructor(data: Record<string, unknown>) {
    super();
    this.x = typeof data.x === "number" ? data.x : 0;
    this.y = typeof data.y === "number" ? data.y : 0;
    this.rotation = typeof data.rotation === "number" ? data.rotation : 0;
    this.scaleX = typeof data.scaleX === "number" ? data.scaleX : 1;
    this.scaleY = typeof data.scaleY === "number" ? data.scaleY : 1;
  }
}
