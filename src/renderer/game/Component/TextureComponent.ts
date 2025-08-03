import { Assets, type Texture } from "pixi.js";
import type { GameComponent } from ".";
import { generateId } from "../Utils/id";

export interface TextureComponentData {
  id?: string;
  path: string;
}

export class TextureComponent implements GameComponent {
  readonly id: string;
  static readonly _type = "TextureComponent";
  readonly type = TextureComponent._type;
  static readonly prefix = "TX";
  readonly path: string;
  private _instance: Texture | null = null;

  constructor(data: TextureComponentData) {
    this.id = data.id ?? generateId(TextureComponent.prefix);
    this.path = `../${data.path}`;
  }

  async load() {
    const texture = await Assets.load(this.path);
    this._instance = texture;
    return this._instance as Texture;
  }

  instance() {
    return this._instance as Texture;
  }

  static jsonToGameObject(json: string | object): TextureComponent {
    const data: TextureComponent = typeof json === "string" ? JSON.parse(json) : json;
    return new TextureComponent(data);
  }
}
