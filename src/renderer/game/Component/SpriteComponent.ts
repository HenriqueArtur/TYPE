import { Sprite } from "pixi.js";
import type { GameComponent } from ".";
import { generateId } from "../Utils/id";
import { TextureComponent } from "./TextureComponent";
import { TransformComponent, type TransformComponentData } from "./TransformComponent";

export type SpriteComponentData = TransformComponentData & {
  texture: TextureComponent;
};

export type SpriteComponentDataJson = Omit<SpriteComponentData, "texture"> & {
  readonly texture: string;
};

export class SpriteComponent implements GameComponent {
  readonly id: string;
  static readonly _type = "SpriteComponent";
  readonly type = SpriteComponent._type;
  static readonly prefix = "SP";
  readonly texture: TextureComponent;
  readonly _transform: TransformComponent;
  private _instance: Sprite | null = null;

  constructor({ id, texture, ...transform }: SpriteComponentData) {
    this.id = id ?? generateId(SpriteComponent.prefix);
    this.texture = texture;
    this._transform = new TransformComponent(transform);
  }

  transform(data: Omit<TransformComponentData, "id">) {
    this._transform.set(data);
  }

  async load() {
    const { position, scale, rotation } = this._transform.value();
    const texture = await this.texture.load();
    this._instance = new Sprite({
      texture,
      position,
      scale,
      rotation: rotation.degrees,
      anchor: 0.5,
    });
    return this._instance as Sprite;
  }

  instance() {
    return this._instance as Sprite;
  }

  static jsonToGameObject(json: string | object): SpriteComponent {
    const data: SpriteComponentDataJson = typeof json === "string" ? JSON.parse(json) : json;
    const texture = new TextureComponent({ path: data.texture });
    return new SpriteComponent({
      ...data,
      texture,
    });
  }
}
