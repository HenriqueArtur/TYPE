import { Assets, type Texture } from "pixi.js";
import type { GameComponent } from ".";

export interface TextureComponentData {
  path: string;
}

export class TextureComponent implements GameComponent {
  static readonly _type = "TextureComponent";
  readonly type = TextureComponent._type;
  static readonly prefix = "TX";
  readonly path: string;
  private _instance: Texture | null = null;

  constructor(data: TextureComponentData) {
    // The ".." is needed to adjust asset paths after Electron build
    // Handle different path formats intelligently:
    if (!data.path) {
      // Handle undefined/null/empty path
      this.path = `../${data.path}`;
    } else if (data.path.startsWith("/")) {
      // If absolute path (starts with "/"), add only ".."
      this.path = `..${data.path}`;
    } else {
      // If relative path, add "../"
      this.path = `../${data.path}`;
    }
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
