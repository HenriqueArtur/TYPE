import { Sprite } from "pixi.js";
import type { GameComponent } from ".";
import { TextureComponent } from "./TextureComponent";
import { TransformComponent, type TransformComponentData } from "./TransformComponent";

export type SpriteComponentData = TransformComponentData & {
  texture: TextureComponent;
};

export type SpriteComponentDataJson = Omit<SpriteComponentData, "texture"> & {
  readonly texture: string;
};

export class SpriteComponent implements GameComponent {
  static readonly _type = "SpriteComponent";
  readonly type = SpriteComponent._type;
  static readonly prefix = "SP";
  readonly texture: TextureComponent;
  readonly _transform: TransformComponent;
  private _instance: Sprite | null = null;

  constructor({ texture, ...transform }: SpriteComponentData) {
    this.texture = texture;
    this._transform = new TransformComponent(transform);
  }

  transform(data: Omit<TransformComponentData, "id">) {
    console.log(data)
    this._transform.set(data);
    if(data.position?.x){
      (this._instance as Sprite).position.x = data.position.x
    }
    if(data.position?.y){
      (this._instance as Sprite).position.y = data.position.y
    }
    if(data.scale?.x){
      (this._instance as Sprite).scale.x = data.scale.x
    }
    if(data.scale?.y){
      (this._instance as Sprite).scale.y = data.scale.y
    }
    if(data.rotation){
      (this._instance as Sprite).rotation = data.rotation.degrees
    }
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
