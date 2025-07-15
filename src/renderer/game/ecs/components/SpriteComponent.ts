import { Component } from "../Component";

export class SpriteComponent extends Component {
  static readonly type = "SpriteComponent";

  public texture: string;

  constructor(data: Record<string, unknown>) {
    super();
    if (typeof data.texture !== "string") {
      throw new Error("SpriteComponent requires a texture path.");
    }
    this.texture = data.texture;
  }
}
